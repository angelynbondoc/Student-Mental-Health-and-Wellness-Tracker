# ADR 001: Use Vercel for Frontend Hosting and Deployment

**Date:** April 9, 2026

**Status:** Decided

**Context:** For our Knowledge Management Project, we need a reliable, fast, and easy-to-use platform to host our React frontend. The platform must integrate smoothly with GitHub for Continuous Integration and Continuous Deployment (CI/CD) so that every push or merged Pull Request is automatically built and deployed. As a student team, we also need a solution that offers a robust free tier while supporting client-side routing out-of-the-box.

**Options Considered:** 1. **Vercel** - Optimized for React/Vite, zero-config GitHub integration, automatic PR preview links.
2. **GitHub Pages** - Free and built into GitHub, but requires manual configuration for React client-side routing (handling 404s on page refresh).
3. **Netlify** - Excellent alternative with similar features to Vercel, but Vercel's dashboard and build speeds for React tend to be slightly faster out-of-the-box.

**Decision:** We chose **Vercel**. 
The primary reason is its seamless integration with GitHub and React. Vercel automatically generates preview deployments for Pull Requests, which will make it incredibly easy for our PM and QA Lead to review UI/UX and Dev 1 features before merging them into the `dev` or `main` branches. It also handles React Router paths natively without requiring custom redirect scripts like GitHub Pages does.

**Consequences:** * **What this makes easier:** Deploying the app requires zero manual server configuration. Our QA tester will always have a live URL to test our latest commits.
* **What this makes harder:** We are locked into Vercel's ecosystem for frontend hosting. If the app were to scale massively beyond the capstone requirements, we might hit free-tier bandwidth limits, though this is not a risk for our current scope.