# Changelog

## [1.1.0] - Authentication Architecture Pivot - 2026-04-25

### Changed
- **Authentication Flow:** Completely deprecated the custom `validate-neu-email` Edge Function and password-based registration. Pivoted the platform to utilize Google Workspace Single Sign-On (SSO) via Supabase Native OAuth.
- **Security Enforcement:** Upgraded the `handle_new_user` PostgreSQL trigger. The database now natively acts as the domain security, rejecting any `auth.users` insertions where the email does not end in `@neu.edu.ph`. This secures the backend against unauthorized `@gmail.com` injections bypassing the frontend UI.

## [1.0.0] - Sprint 1 (Backend Infrastructure) - 2026-04-16

### Added
- **Database Schema:** Scaffolding for all 16 core tables including `profiles`, `posts`, `comments`, `reports`, `notifications`, `search_history`, and `recent_activity`.
- **Row Level Security (RLS):** Fully configured policies across all tables to ensure data isolation and security.
- **Anonymity Layer:** Created the `posts_view` SQL view to automatically mask the author's identity while preserving relationship integrity.
- **Automated Profile Creation:** SQL trigger to automatically generate a `profiles` row when a new user signs up.
- **Custom Authentication:** Built a standalone Deno Edge Function (`validate-neu-email`) utilizing the Admin API to strictly enforce `@neu.edu.ph` institutional email registration.
- **Automated Moderation:** Deployed a Cloud Database Webhook tied to the `moderate-post` Edge Function that automatically flags posts and notifies admins when a report is inserted.
- **Knowledge Retrieval:** Implemented a secure PostgreSQL RPC (`log_and_search`) utilizing `tsvector` for full-text search and automated search history logging.
- **Privacy Lock:** Added a `privacy_acknowledged` boolean to enforce terms acceptance on sign-up.

### Security
- Locked down native Supabase public registration to prevent frontend API manipulation.