**Prompt Log: AI-Assisted Backend Development (Sprint 1)**
**Developer: Dev 2 (Backend & Infrastructure)**

**Entry 1: Relational Schema Architecture & Integrity**

* **Date & Task:** April 10, 2026 - Designing the foundational PostgreSQL database schema and ensuring relational integrity for the 14 core tables.

* **The Prompt:** "Role: Senior Backend Architect. Task: Generate the PostgreSQL schema for a student wellness tracker. I need tables for users, posts, comments, reports, and notifications. Ensure all foreign key relationships enforce cascading deletes to prevent orphaned records."

* **What the AI produced:** The AI generated the raw CREATE TABLE SQL statements, successfully mapping out the relational structure and adding standard UUID primary keys and timestamp columns.

* **What I changed, rejected, or improved — and WHY:** The AI forgot to add explicit NOT NULL constraints to critical fields like post_id in the comments table. I manually refactored the SQL to enforce strict data constraints at the database level.

* **What I learned or decided:** I learned that while AI is excellent at scaffolding standard relational models, it often overlooks strict database-level constraints. As a backend developer, I must enforce these rules manually to ensure data integrity before the frontend ever touches the API.

**Entry 2: Implementing Row Level Security (RLS)**

* **Date & Task:** April 11, 2026 - Locking down the database to ensure users can only modify their own data.

* **The Prompt:** "Generate Supabase Row Level Security (RLS) policies for the posts and comments tables. Rule: Anyone can read, but only authenticated users can insert, and users can only update/delete if their author_id matches the auth.uid()."

* **What the AI produced:** The AI provided the correct CREATE POLICY SQL statements, utilizing Supabase's auth.uid() function to map session users to table rows.

* **What I changed, rejected, or improved — and WHY:** The AI created a single generic policy for "ALL" operations. I rejected this and split it into distinct SELECT, INSERT, UPDATE, and DELETE policies. This granular approach is much more secure and easier to audit for vulnerabilities.

* **What I learned or decided:** Granular RLS is critical for secure multi-tenant applications. Writing separate policies for different CRUD operations minimizes the risk of accidental privilege escalation.

**Entry 3: Designing the Anonymity Layer (SQL Views)**

* **Date & Task:** April 12, 2026 - Fulfilling the requirement for anonymous posting without destroying relational integrity.

* **The Prompt:** "Users need to post anonymously. How should I handle this? Give me backend architecture options."

* **What the AI produced:** The AI suggested handling anonymity on the frontend (React) by simply hiding the user's name if a boolean flag was set to true.

* **What I changed, rejected, or improved — and WHY:** I completely rejected the AI's frontend approach. If the backend sends the author's ID to the client, a malicious user could intercept the network payload and expose the anonymous student. Instead, I commanded the AI to write a PostgreSQL VIEW (posts_view) that masks the author data natively in the database before the data ever leaves the server.

* **What I learned or decided:** I learned a crucial security principle: never trust the client. Data masking must happen at the database level (via SQL Views or Edge Functions) to guarantee true anonymity.

**Entry 4: Automating Profile Generation via SQL Triggers**

* **Date & Task:** April 13, 2026 - Ensuring a profiles row is automatically generated whenever a new user registers in the Supabase Auth system.

* **The Prompt:** "Write a PostgreSQL trigger and function that listens to the auth.users schema. Upon a new user registration, automatically insert a corresponding row into the public profiles table."

* **What the AI produced:** The AI provided a standard PL/pgSQL function utilizing the NEW record to map auth.users.id to profiles.id.

* **What I changed, rejected, or improved — and WHY:** The AI's code worked, but I added error handling and a default role assignment ('student') to the insert statement to ensure Role-Based Access Control (RBAC) was initialized immediately upon account creation.

* **What I learned or decided:** Database triggers are really powerful for maintaining state consistency without relying on the client to make secondary API calls after registration.

**Entry 5: Auth Hook Infrastructure Limitations (The Loopback Paradox)**

* **Date & Task:** April 14, 2026 - Attempting to restrict registration to @neu.edu.ph emails using native Supabase Auth Hooks.

* **The Prompt:** "Provide the config.toml setup and Edge Function code to intercept user signups using before_user_created Auth Hooks to validate the email domain."

* **What the AI produced:** The AI provided the correct production-grade configuration, utilizing internal Docker routing like host.docker.internal and 127.0.0.1 to connect the Auth container to the Edge Runtime.

* **What I changed, rejected, or improved — and WHY:** The configuration failed completely. I diagnosed this as a local Docker/WSL2 loopback paradox—the GoTrue container could not resolve the internal HTTP requests, causing a fatal timeout. I realized the AI's "textbook" solution was fundamentally incompatible with local Windows development environments.

* **What I learned or decided:** I gained a deep, practical understanding of containerized microservices and Docker networking. I decided to abandon the native Auth Hook in favor of a more resilient custom endpoint.

**Entry 6: Pivoting to the optimized Edge Function**

* **Date & Task:** April 15, 2026 - Refactoring the registration flow to bypass Docker limitations while maintaining strict server-side security.

* **The Prompt:** "Since local Auth Hooks are failing, rewrite the registration flow. Write a standalone Deno Edge Function (validate-neu-email) that accepts email/password, validates the domain, and uses the Supabase Admin Client to force-create the user."

* **What the AI produced:** The AI wrote a highly secure script utilizing the SUPABASE_SERVICE_ROLE_KEY to bypass RLS and provision the user account server-side.

* **What I changed, rejected, or improved — and WHY:** The AI forgot that Edge Functions require JWT authentication by default. Since this is a signup route, the user has no token yet. I manually updated config.toml to set verify_jwt = false for this specific function, exposing it publicly while keeping the Admin API logic hidden securely inside.

* **What I learned or decided:** Using the Supabase Admin Client inside a secure serverless environment is an excellent architectural pattern for executing privileged operations (like secure registration) without exposing administrative keys to the frontend.

**Entry 7: Deploying the Moderation Webhook (Automated Reporting)**

* **Date & Task:** April 16, 2026 - Building the automated moderation system triggered by the reports table.

* **The Prompt:** "Write a Deno Edge Function (moderate-post) that parses a database webhook payload. If a report is inserted, it should flag the associated post and insert a notification for the admin."

* **What the AI produced:** The AI successfully generated the Deno logic to parse the req.json() payload and execute the updates using the Admin API.

* **What I changed, rejected, or improved — and WHY:** When I wired the webhook in the Local Studio UI, it failed because the local Postgres instance lacked the pg_net extension. The AI did not warn me about this environment difference. I manually ran create extension pg_net in the SQL editor to arm the database with HTTP capabilities.

* **What I learned or decided:** I learned how to integrate Database Webhooks to create event-driven architectures. This allows the backend to act autonomously (flagging posts instantly) without the frontend having to manage multiple asynchronous API calls.

**Entry 8: Version Control & Infrastructure as Code**

* **Date & Task:** April 16, 2026 - Capturing the local Studio UI changes (the webhook trigger) into a permanent SQL migration file for team distribution.

* **The Prompt:** "How do I save the webhook I just created in the local Supabase dashboard so Dev 1 can access it when they pull my repository?"

* **What the AI produced:** The AI provided the CLI command npx supabase db diff -f add_moderate_post_webhook to extract the UI changes into a raw SQL file.

* **What I changed, rejected, or improved — and WHY:** I executed the command, staged the new untracked migration file, and immediately pushed it to the remote Git repository. I ensured that the README.md was updated with explicit instructions for Dev 1 on how to run supabase db push and functions serve.

* **What I learned or decided:** Infrastructure as Code (IaC) is critical. Dashboard clicks are ephemeral; if backend architecture isn't codified in migration files, the team's environments will immediately desynchronize.