# ADR 002: Use Local State and Mock Data for Initial Frontend Development

**Date:** April 9, 2026

**Status:** Decided

**Context:** During Sprint 1, the frontend team (Dev 1 and UI/UX) needed to start building the application's core features (routing, forms, lists, and unique constraints) immediately. However, the Supabase database and backend API (handled by Dev 2) were still in active development. We needed a strategy to build fully functional frontend logic without being blocked by the backend, while also guaranteeing that integrating the real database later would not require rewriting our React components.

**Options Considered:** 1. **Wait for the backend to be finished:** This would completely block Dev 1 and the UI/UX designer, risking our Sprint 1 deadlines.
2. **Use a mock REST API (like JSON Server):** This simulates network requests but requires running a separate local server, adding unnecessary setup overhead for the UI/UX designer.
3. **Use React top-level `useState` and a `mockData.js` file:** hardcoding initial arrays that strictly follow the planned database schema and passing them down as props/context.

**Decision:** We chose to use **React `useState` with `mockData.js`** (Option 3). 
The critical rule for this decision was "Data Contract Strictness." Dev 1 was required to use the exact column names defined by Dev 2's database schema (e.g., `author_id`, `is_anonymous`, `created_at`) for all mock objects. We placed the state at the top level in `App.jsx` so data would persist while navigating between different pages during Sprint 1.

**Consequences:** * **What this makes easier:** It completely unblocked the frontend. Dev 1 was able to successfully build all 12 core feature logics. When Dev 2 is ready in Sprint 2, the transition will be seamless because the React components are already mapped to the correct data structures.
* **What this makes harder:** Data does not persist across hard browser refreshes during Sprint 1 testing. Furthermore, Dev 1 and Dev 2 will need to manually comb through `App.jsx` in Sprint 2 to replace all the array manipulation functions (e.g., `setPosts([...posts, newPost])`) with actual Supabase API calls.