# ADR-002: Authentication Approach and Registration Security

**Date**: April 16, 2026
**Status**: Decided

## Context

The application requires a secure authentication system that strictly limits registration to users with a valid @neu.edu.ph institutional email address. While the platform allows for anonymous interactions (posting and commenting without displaying names), the underlying accounts must be verified students to maintain a safe, moderated environment. The system must prevent malicious actors from registering with personal emails (e.g., @gmail.com) via API manipulation or frontend bypasses.

## Options Considered

**Option A — Client-Side Validation + Standard Supabase signUp: Validate the email string in the React frontend before calling the native Supabase authentication method.**

**Option B — Native Supabase Auth Hooks (before_user_created): Intercept the registration at the database level using a webhook tied to the Supabase GoTrue container.**

**Option C — Custom Server-Side Registration Endpoint via Edge Function *(Chosen)*: Bypass the public Supabase registration entirely and handle sign-ups through a dedicated Deno Edge Function using the Supabase Admin API.**

---

## Decision

**We will use Option C. Registration will be handled entirely server-side via a custom Supabase Edge Function (validate-neu-email). The frontend will send credentials directly to this endpoint. The function will validate the domain, and if valid, use the SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security and forcefully create the user in the database.**

---

## Justification

## Why Not Option A (Client-Side Validation)

Validating the email domain exclusively on the frontend (React) is a critical security vulnerability. While it provides a good user experience by showing immediate error messages, a malicious user can easily bypass the frontend logic by intercepting the network request or using a tool like Postman to send a POST request directly to the public Supabase Auth endpoint. This would allow unauthorized non-institutional emails to flood the database. Security must be enforced on the server.

## Why Not Option B (Native Supabase Auth Hooks)

Supabase provides native Auth Hooks designed specifically for this use case. However, during development, we encountered significant infrastructure limitations when running the Supabase CLI locally via Windows Docker Desktop (WSL2). The Supabase GoTrue (Auth) container requires specific loopback addresses (127.0.0.1 or localhost) for HTTP webhooks. Because the Edge Runtime lives in a separate container, resolving the internal network route caused a "hook timeout after retry" fatal error. While this architecture works flawlessly in the cloud production environment, it completely blocks local development and testing for the team.

---

## Why Option C (Custom Edge Function with Admin API)

This approach provides the absolute highest level of security while completely sidestepping the local Docker networking paradox.

Security: By creating our own endpoint, the frontend never touches the public Supabase signUp method. The validation logic is locked securely in the backend backend. If an invalid email is sent, the function returns a 403 Forbidden and the database remains untouched.

Execution: If the email is valid, the function utilizes the SUPABASE_SERVICE_ROLE_KEY. This key operates with administrative privileges, allowing the function to securely provision the user account on behalf of the system.

Developer Experience: This endpoint can be served locally via supabase functions serve and works seamlessly across all operating systems, ensuring the frontend developers can test registration without fighting Docker network configurations.

---

## Consequences

**What this makes easier:**

- Guarantees 100% security against API abuse and frontend bypass attempts.
- Resolves all local development networking issues, allowing the team to work efficiently.
- Centralizes all registration business logic into a single, highly readable TypeScript file.

**What this makes harder:**
- The frontend team (Dev 1) cannot use the standard supabase.auth.signUp() method found in standard tutorials. They must be explicitly instructed to send a POST request to the custom validate-neu-email Edge Function instead.
- Requires the endpoint to be configured with verify_jwt = false in the config.toml file to allow unauthenticated users to reach the sign-up logic.

---

*This ADR was documented and implemented during Sprint 1.*