# ADR-001: Frontend Framework, Database, and Backend Approach

**Date:** April 3, 2026
**Status:** Decided

## Context

The application is a student mental health and wellness platform where users can anonymously post thoughts and feelings, comment on each other's posts, and report malicious or troll content. The team consists of students with varying technical backgrounds, and the project must be completed within an 8-week timeline with no budget for hosting infrastructure. The technical stack must support anonymous user interactions, relational data (posts → comments → reports), a moderation/reporting system, and must be deployable to a live public URL at no cost.

## Options Considered

### Frontend

**Option A — React + Vite** *(chosen)*
**Option B — Plain HTML/CSS/JS**
**Option C — Next.js**

### Database & Backend

**Option A — Supabase + Supabase Edge Functions** *(chosen)*
**Option B — Firebase Firestore (no separate backend)**
**Option C — Node.js + Express + Firebase**

---

## Decision

**React + Vite for the frontend. Supabase (PostgreSQL) for the database with authentication. Supabase Edge Functions for server-side logic including the reporting and moderation system.**

---

## Justification

### Why React + Vite

The application has multiple distinct screens — a post feed, individual post view, comment threads, a reporting interface, and potentially a moderation panel. Plain HTML/CSS/JS becomes difficult to manage at this scale because UI state (e.g., toggling comments, updating post status after a report) has to be manually tracked with vanilla JavaScript, leading to brittle and hard-to-debug code. React's component model handles this cleanly — each post card, comment thread, and report button is an isolated, reusable component with its own state.

Vite is chosen over Create React App because it is significantly faster during development (near-instant hot reload) and is the current industry standard for React project scaffolding. It requires no additional configuration to get started.

### Why Not Plain HTML/CSS/JS

Viable only for simple static pages. Once the app requires dynamic rendering of post feeds fetched from a database, comment threads that update without page reloads, and conditional UI based on user session state, plain HTML/JS requires manual DOM manipulation that quickly becomes unmanageable. Not appropriate for an app of this complexity.

### Why Not Next.js

Next.js is a full-stack React framework with server-side rendering, which is valuable for SEO-heavy public sites. This application is a student project with no SEO requirement, and the added concepts (server components, app router, API routes) introduce unnecessary complexity for a team working within an 8-week deadline. It is not the right tool for this scope.

---

### Why Supabase

The app's core data is inherently relational:

```
Users → Posts → Comments → Reports
```

A post belongs to a user. Comments belong to a post. Reports reference both a post and the reporting user. This structure is best expressed in SQL with foreign keys and joins — not in a document-based NoSQL system. Supabase provides a full PostgreSQL database, which maps directly to this data model without workarounds.

Supabase also includes built-in authentication with anonymous sign-in support, which directly addresses the app's requirement for anonymous posting without requiring a separately configured auth service. Row Level Security (RLS) policies in Supabase allow fine-grained control over who can read, write, or delete records — for example, ensuring users can only delete their own posts, or that only authenticated users can submit reports.

Additionally, Supabase's free tier is sufficient for a school project of this scale and does not require a credit card.

### Why Not Firebase Firestore

Firebase uses a NoSQL document model. While it is fast to set up, the app's relational data structure (posts, comments, reports all referencing each other) would require data duplication and denormalization to query efficiently in Firestore. This introduces inconsistency risks — for example, if a post is deleted, associated comments and reports stored in separate collections must be manually cleaned up. In PostgreSQL with Supabase, cascading deletes handle this automatically through foreign key constraints.

More critically, Firebase Firestore has no native support for the kind of relational queries this app needs, such as fetching all reports tied to a specific post along with the reporting user's details in a single query. These require multiple round trips in Firestore, which adds complexity and performance overhead.

### Why Not Node.js + Express

A separate Node.js/Express backend would give full server-side control but introduces significant overhead: a separate codebase to maintain, a separate deployment pipeline, and additional complexity in connecting it to the database and frontend. For the specific server-side logic this app needs — primarily the reporting and moderation system — Supabase Edge Functions provide the same capability (server-side execution that clients cannot bypass or manipulate) without requiring a separate server. Edge Functions run on Deno, are deployed alongside the Supabase project, and are invoked via HTTP exactly like an Express endpoint. This achieves the same security guarantees with far less infrastructure to manage.

---

## Consequences

**What this makes easier:**
- Relational data (posts, comments, reports) is naturally expressed in PostgreSQL with no workarounds
- Auth and anonymous posting are handled by Supabase out of the box
- The reporting system runs server-side via Edge Functions, meaning clients cannot bypass moderation logic
- Single platform (Supabase) handles database, auth, and backend logic — fewer moving parts
- Free tier covers the entire project lifecycle

**What this makes harder:**
- Team members unfamiliar with SQL will need to learn basic PostgreSQL queries and Supabase's JavaScript client
- Supabase Edge Functions use Deno (not Node.js), which has minor syntax differences that require attention
- Row Level Security policies require careful setup to avoid accidentally exposing or locking data

---

*This ADR was discussed and agreed upon by the team on April 3, 2026 before scaffold setup began.*