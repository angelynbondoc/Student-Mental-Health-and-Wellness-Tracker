# Student Mental Health and Wellness Tracker

A comprehensive mental health and wellness platform designed specifically for students at **New Era University**, featuring anonymous peer support, mood tracking, habit building, and access to mental health resources.

---

##  1. Project Overview

The **Student Mental Health and Wellness Tracker** is a full-stack web application that provides students at New Era University with a safe space to monitor their mental well-being, connect with peers anonymously, and access evidence-based mental health resources.

The platform leverages the **SECI knowledge management framework** to facilitate the conversion of personal experiences into actionable wellness strategies, ensuring that knowledge flows naturally from individual reflection to community insight to daily practice.

---

##  2. KM Framework Used and Rationale

### SECI Framework Implementation

This application implements the **SECI (Socialization, Externalization, Combination, Internalization)** knowledge management model developed by Nonaka and Takeuchi.

| SECI Component | KM Meaning | App Feature |
|---|---|---|
| **Socialization** | Sharing tacit knowledge through direct interaction | Anonymous community posts, peer support sharing |
| **Externalization** | Converting feelings and thoughts to explicit form | Mood journal entries, reflection prompts |
| **Combination** | Organizing and structuring knowledge | Resource library, categorized coping strategies |
| **Internalization** | Applying knowledge to daily practice | Habit tracker, daily wellness exercises |

### Rationale

The SECI framework was chosen because it mirrors the natural journey of mental health awareness:

1. **Thoughts → Structured Reflections** (Externalization)
2. **Experiences → Shareable Insights** (Socialization)
3. **Information → Actionable Personal Knowledge** (Combination)
4. **Knowledge → Daily Wellness Practices** (Internalization)

---
##  3. Team Members and Roles

| Role | Responsibilities | GitHub Profile |
|------|------------------|----------------|
| **Scrum Master** | Project management, sprint planning, team coordination | [Angelyn Bondoc](https://github.com/angelynbondoc) |
| **Full Stack Developer 1** | Frontend and backend development, React components, database integration | [Aletheos Peñarubia](https://github.com/Aletheos-uuu) |
| **Full Stack Developer 2** | Full-stack development, API integration, authentication system | [Klyne Zyro Reyes](https://github.com/KlyneZyro) |
| **UI/UX Designer** | User interface design, user experience optimization, wireframing | [Sean Orioque](https://github.com/seanorioque) |
| **KM Analyst** | Knowledge management framework, SECI implementation, documentation | [Micole Kurt Gonda](https://github.com/MicoleKurt) |
| **QA & Documentation Lead** | Quality assurance, testing, documentation, user acceptance testing | [Tricia Labbao](https://github.com/tricialabbao) |

---

##  4. Features List

### Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 |  **Home Feed** | Anonymous community posts with real-time updates |
| 2 |  **Create Post** | Anonymous sharing with community selection |
| 3 |  **Mood Journal** | Daily mood tracking with emotion analysis |
| 4 |  **Resources Library** | Categorized mental health resources and coping strategies |
| 5 |  **Habit Tracker** | Daily wellness habits (water intake, meditation, exercise) |
| 6 |  **Communities** | Join and participate in anonymous support communities |
| 7 |  **Profile Management** | Customizable profile with privacy controls |
| 8 |  **Notifications** | Real-time updates for community interactions |

### Advanced Features

| # | Feature | Description |
|---|---------|-------------|
| 9  |  **Smart Search** | Full-text search across posts with history logging |
| 10 |  **Content Moderation** | Automated and manual moderation system |
| 11 |  **Admin Dashboard** | Comprehensive admin tools for community management |
| 12 |  **Google SSO Authentication** | Secure institutional authentication via Google Workspace |
| 13 |  **Mobile-Responsive Design** | Optimized for mobile and desktop experiences |
| 14 |  **Onboarding Flow** | Guided introduction to platform features |
| 15 |  **User Suspension System** | Administrative user management capabilities |

---

##  5. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.4 | Modern UI library with latest features |
| **Vite** | 8.0.4 | Fast development and build tool |
| **React Router DOM** | 7.14.0 | Client-side routing |
| **Lucide React** | 1.8.0 | Beautiful icon library |
| **CSS3** | — | Custom styling with mobile-first approach |

### Backend & Database

| Technology | Version | Purpose |
|---|---|---|
| **Supabase** | 2.89.1 | Backend-as-a-Service platform |
| **PostgreSQL** | — | Robust relational database with RLS policies |
| **Supabase Auth** | — | Authentication with Google OAuth integration |
| **Supabase Edge Functions** | — | Serverless functions for custom logic |

### Development Tools

| Technology | Version | Purpose |
|---|---|---|
| **ESLint** | 9.39.4 | Code quality and consistency |
| **TypeScript Support** | — | Type safety for better development experience |

---

##  6. Setup Instructions

Follow these steps carefully to get the project running on your local machine.

### Prerequisites

Before you begin, make sure you have the following:

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **Git** — [Download here](https://git-scm.com/)
- A valid **@neu.edu.ph** email address for authentication
- Supabase environment keys — request these from **Dev 2**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/Student-Mental-Health-and-Wellness-Tracker.git
cd Student-Mental-Health-and-Wellness-Tracker
```

---

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`.

---

### Step 3: Configure Environment Variables

Create a `.env.local` file in the **project root** directory:

```bash
cp .env.example .env
```

Add the following variables (request the actual values from Dev 2):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> You can also reference the `.env.example` file included in the repository for the full list of supported environment variables.

---

### Step 4: Start the Development Server

```bash
npm run dev

```

---

### Step 5: Open the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---

### Step 6: Authenticate

1. Click the **"Login with Google"** button on the login page
2. Sign in using your **@neu.edu.ph** institutional email address
3. Complete the **onboarding flow** to set up your profile and preferences

> **Note:** Only `@neu.edu.ph` email addresses are authorized. Any other domain will be rejected at both the UI and database levels.

---

## 7. Repository Structure

```
Student-Mental-Health-and-Wellness-Tracker/
│
├── public/                          # Static assets (favicon, images)
│
├── src/
│   ├── components/                  # Reusable React components
│   │   ├── layout/                  # Layout components (MobileLayout, etc.)
│   │   ├── postcard/                # Post display components
│   │   └── createpage/              # Post creation components
│   │
│   ├── pages/                       # Page-level components
│   │   ├── HomePage/                # Main community feed
│   │   ├── CreatePage/              # Post creation interface
│   │   ├── JournalPage/             # Mood journal and emotion tracking
│   │   ├── ResourcesPage/           # Mental health resource library
│   │   ├── HabitsPage/              # Daily habit tracker
│   │   ├── CommunitiesPage/         # Community browsing and management
│   │   ├── ProfilePage/             # User profile and settings
│   │   ├── NotificationsPage/       # Notification center
│   │   ├── AdminPage/               # Admin dashboard
│   │   ├── LoginPage/               # Authentication (Google SSO)
│   │   └── OnboardingPage/          # New user onboarding flow
│   │
│   ├── hooks/                       # Custom React hooks
│   ├── utils/                       # Utility functions and helpers
│   ├── styles/                      # Global CSS stylesheets
│   ├── App.jsx                      # Main application component and routing
│   ├── AppContext.js                 # Global state management (Context API)
│   └── supabase.js                  # Supabase client configuration
│
├── docs/                            # Project documentation
│   ├── adr/                         # Architecture Decision Records
│   ├── test-cases/                  # Test case documentation
│   ├── wireframes/                  # UI/UX wireframes and mockups
│   ├── screenshots/                 # App screenshots for README
│   ├── km-framework-memo.md         # KM framework documentation
│   └── km-architecture.md           # Knowledge architecture diagrams
│
├── supabase/                        # Supabase configuration and migrations
├── tests/                           # Test files
│
├── .env.example                     # Environment variables template
├── .env.local                       # Your local environment variables (git-ignored)
├── package.json                     # Project dependencies and scripts
├── vite.config.js                   # Vite build configuration
└── README.md                        # This file
```

---

## 8. Branch Strategy

We follow a structured Git workflow to ensure code quality and collaboration.

### Branch Types

| Branch | Purpose | Direct Push Allowed? |
|--------|---------|----------------------|
| `main` | Production-ready code, always deployable |
| `dev` | Integration branch for completed features |
| `feature/*` | Individual feature development |

### Workflow

```bash
# 1. Create a feature branch from dev
git checkout -b feature/new-feature-name

# 2. Develop and commit
git add .
git commit -m "feat: implement new feature"

# 3. Push and open a Pull Request → dev
git push origin feature/new-feature-name

# 4. After review and merge, sync your local dev
git checkout dev
git pull origin dev

# 5. Deploy to staging from dev for testing

# 6. Merge to main for production release
git checkout main
git merge dev
git push origin main
```

### Branch Protection Rules

- **`main`** — Requires PR approval; no direct pushes; must pass all checks
- **`dev`** — Requires PR approval from a feature branch; no direct pushes
- **`feature/*`** — Open for development; PR required to merge into `dev`

---

## 9. Contribution Evidence
All member contributions, linked PRs, and commit history. **[Contribution Log](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/wiki/Contribution-Log)**.

---

## 10. Screenshots of the Live App

### Mobile Views

| Screen | Preview |
|--------|---------|
| **Dashboard** | ![Dashboard Mobile](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/blob/main/docs/screenshots/dashboard.png) |
| **Mood Journal** | ![Mobile Mood Journal](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/blob/main/docs/screenshots/journal-page.png) |
| **Habit Tracker** | ![Mobile Habit Tracker](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/blob/main/docs/screenshots/habits.png) |

> *Dashboard* — Anonymous community feed with real-time posts.

> *Mood Journal* — Daily mood tracking with emotion analysis.

> *Habit Tracker* — Wellness habit tracking with progress visualization.

---

### Desktop Views

| Screen | Preview |
|--------|---------|
| **Dashboard** | ![Desktop Dashboard](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/blob/main/docs/screenshots/dashboard.png) |
| **Admin Panel** | ![Admin Dashboard](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/blob/feature/tricia-qa-docs/docs/screenshots/admin.png) |
| **Resource Library** | ![Resource Library](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/blob/feature/tricia-qa-docs/docs/screenshots/resources.png) |

> *Desktop Dashboard* — Complete desktop experience with all features accessible.

> *Admin Dashboard* — Comprehensive admin tools for community management.

> *Resource Library* — Categorized mental health resources and coping strategies.

---

### Key Feature Highlights

- **Anonymous Posting** — Safe space for sharing without identity exposure
- **Real-time Notifications** — Instant updates for community interactions
- **Smart Search** — Full-text search with intelligent filtering
- **Mobile-First Design** — Optimized for mobile devices with responsive desktop support

---

## 11. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## User Guide
**[User Guide](https://github.com/angelynbondoc/Student-Mental-Health-and-Wellness-Tracker/wiki/User-Guide)**

---

<div align="center">

*If you or someone you know is in crisis, please reach out to a trusted person or mental health professional.*

</div>
