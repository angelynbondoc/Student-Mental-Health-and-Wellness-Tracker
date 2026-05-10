# Developer Reflection — Dev 2 (Backend, DB & Auth)

---

## Hardest Technical Problem

The hardest technical problem was designing the anonymous posting system in a way that was genuinely secure — not just hidden at the UI level. The requirement was specific: co-students cannot see the identity behind anonymous posts, but admins can, for accountability. That sounds simple until you start thinking through the database layer. A naive implementation would just store the author ID in the post record and let the frontend decide whether to show it. But that means anyone who can query the database directly — or intercept an API response — can see the identity. That's not privacy; that's a curtain.

The real solution required row-level security (RLS) policies in Supabase so that the `author_id` field on anonymous posts is only readable by rows matching an admin role. Regular users, even authenticated ones, get a null or masked value back from the query itself — not just from the UI. Designing and testing that policy correctly, without accidentally locking out admins or leaking data in edge cases, took significantly more iteration than I expected. The database has to enforce the rule, not trust the frontend to.

---

## How I Used the AI

I used the AI primarily as a Supabase-specific reference — the RLS policy syntax, PostgreSQL trigger patterns for the recent activity tracking feature, and the Edge Function structure for content moderation. What I found was that the AI was fast at generating policy boilerplate but frequently got the role-checking logic wrong. It would generate a policy that looked correct but would either be too permissive (any authenticated user could read the author) or too restrictive (admins were also blocked).

My process became: generate the policy, test it against both a regular user session and an admin session in Supabase Studio, find where it broke, bring the failure back to the AI with the specific error or unexpected result, and iterate. The prompt log reflects about four cycles of this for the anonymous posting RLS alone. The AI was most useful once I had already narrowed the problem — giving it a precise failure to fix rather than a broad goal to achieve.

I also used it for the schema design for the User Profile tables. It generated a reasonable first draft, but it didn't account for the soft-delete requirement (users removing posts while preserving admin audit trails), so I had to restructure the approach and explain the constraint before it could help effectively.

---

## What I Would Architect Differently

Two things. First, I would define and document the RLS policies before writing any application code — not alongside it. I designed the schema first, then wrote the policies after, which meant some early table structures had to be reworked when the security requirements didn't map cleanly onto them. Starting from the security model and building the schema around it would have saved a revision cycle.

Second, I underestimated how much the integration phase would depend on the API response shapes I defined. Dev 1 built their mock layer against contracts we agreed on early, and those contracts held — but there were a few edge cases (particularly around what the anonymous post query returned for the `author` field) where the actual Supabase response differed from what either of us assumed. A shared, version-controlled schema definition file — something both sides could reference and update — would have caught those mismatches earlier, before they surfaced at integration time.

The lesson: contracts are good, but a single source of truth for the data shape is better.