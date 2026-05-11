# Student Mental Health and Wellness Tracker

A KM-driven anonymous student wellness platform based on the SECI model. This project supports students in monitoring their mental health and well-being through a safe, anonymous, and knowledge-informed environment — helping surface patterns and resources without compromising privacy.

---

## Tech Stack

- **Frontend:** React + Vite — fast, modern UI with component-based architecture
- **Database & Auth:** Supabase (PostgreSQL) — handles secure data storage and user authentication
- **Server-side Logic:** Supabase Edge Functions — lightweight serverless functions for backend processing

---

### Prerequisites
1. Node.js installed on your machine.
2. A `.env` file configured with the production Supabase keys.

1. Clone the repo
2. `cd src && npm install` — installs all project dependencies
3. Copy `.env.example` to `.env` and fill in your Supabase credentials — you'll need your Supabase project URL and anon key from the Supabase dashboard
4. `npm run dev` — starts the local development server, usually at `http://localhost:5173`

---

## Folder Structure

- `/src` — Application source code (components, pages, and application logic)
- `/docs` — Project documentation, wireframes, ADRs, and KM artifacts
- `/tests` — Test files for validating application behavior

---

## Deployment

Deployment is currently in progress. This section will be updated once the production environment is finalized. Expected setup includes hosting the frontend on a static platform (such as Vercel or Netlify) and connecting it to the existing Supabase cloud instance for database and authentication services.
