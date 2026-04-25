# ADR-002: Authentication Architecture Pivot to Google OAuth & Zero-Trust Database Triggers

**Date**: April 25, 2026
**Status**: Decided & Refactored (Supersedes previous Edge Function architecture)

## Context

The application requires a secure authentication system that strictly limits registration to users with a valid `@neu.edu.ph` institutional email address. Initially, this was handled via a custom Deno Edge Function. However, since the university already utilizes Google Workspace for student emails, managing custom passwords and standalone validation endpoints introduces unnecessary friction and maintenance overhead. The system must natively authenticate users while maintaining an absolute, impenetrable block against personal emails (e.g., `@gmail.com`) attempting to bypass the frontend UI via API manipulation.

## Options Considered

**Option A — Client-Side Validation + Standard Supabase signUp:** Validate the email string in the React frontend before calling the native Supabase authentication method. *(Rejected: Frontend validation can be bypassed by intercepting the network request).*

**Option B — Custom Server-Side Registration Endpoint via Edge Function:** Handle sign-ups through a dedicated Deno Edge Function using the Supabase Admin API. *(Previously Chosen, Now Deprecated: Resolved security and Docker networking issues, but required users to manually manage passwords instead of utilizing existing institutional SSO).*

**Option C — Google Workspace SSO + Database-Level Domain Enforcement (Chosen):** Utilize Supabase's native Google OAuth provider to authenticate users without passwords, combined with a PostgreSQL `BEFORE INSERT` or `AFTER INSERT` trigger on the `auth.users` table to natively reject unauthorized domains at the database layer.

---

## Decision

**We will use Option C. Authentication will be handled exclusively via Google Workspace SSO. To guarantee zero-trust security, we have deployed a PostgreSQL trigger (`handle_new_user`) that acts as a database-level bouncer. If a user attempts to bypass the frontend UI and authenticate with a non-institutional email, the database will raise an exception and forcefully reject the transaction.**

---

## Justification

### The Shift to Passwordless SSO
By pivoting to Google OAuth with the `hd: 'neu.edu.ph'` parameter, we drastically improve the user experience. Students no longer need to create or remember a separate password for the wellness tracker, and the frontend team is relieved of managing complex registration state and password reset flows. 

### The Necessity of the Database Trigger
While the frontend `hd` parameter asks Google to restrict the login screen to the institutional domain, a malicious actor could intercept the API request and strip this parameter out, attempting to inject a personal Gmail account into the system. By shifting the domain validation from the deprecated Edge Function directly into a PostgreSQL trigger, we achieve a Zero-Trust architecture. The database itself physically refuses to store any account that does not end in `@neu.edu.ph`, rendering frontend bypass attacks completely useless.

---

## Consequences

**What this makes easier:**
- Eliminates password management and storage liabilities.
- Reduces cloud infrastructure bloat by allowing us to permanently delete the custom `validate-neu-email` Edge Function.
- Provides absolute, database-level guarantee of institutional domain compliance.
- Allows Dev 1 to replace complex form inputs with a single "Login with Google" button.

**What this makes harder:**
- Requires configuring and maintaining Google Cloud Platform (GCP) OAuth credentials.

---

*This ADR was updated during the Sprint 1 architecture pivot.*