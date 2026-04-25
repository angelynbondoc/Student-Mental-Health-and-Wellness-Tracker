# Student Mental Health and Wellness Tracker

## Cloud Backend Setup (Sprint 1)

This project uses a live Supabase Cloud instance for the database, authentication, and serverless Edge Functions. 

### Prerequisites
1. Node.js installed on your machine.
2. A `.env` file configured with the production Supabase keys.

### Wiring up the Frontend
1. Clone the repository and navigate to the project root.
2. Run `npm install` to install frontend dependencies.
3. Create a `.env.local` file in your frontend root directory and add the following keys (request these from Dev 2):
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<the-cloud-anon-key>

## Authentication & Data Fetching API Contracts
* Registration & Login: We now use Google Workspace SSO exclusively. Do NOT use standard email/password inputs. You must trigger the Google OAuth flow and enforce the hosted domain:
```javascript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    queryParams: {
      prompt: 'select_account',
      hd: 'neu.edu.ph' // Asks the UI to restrict to school emails
    }
  }
});

---

* (Note: Database-level triggers will forcefully reject any non-@neu.edu.ph emails that attempt to bypass this frontend UI).

- Anonymous Posting: When fetching the feed, you must query the posts_view instead of the raw posts table to ensure anonymous author IDs are correctly masked by the database.

- Search Function: Do not fetch all posts to filter on the client. Call the custom RPC function to search and log history simultaneously:

```javascript
await supabase.rpc('log_and_search', { search_term: 'your query' })