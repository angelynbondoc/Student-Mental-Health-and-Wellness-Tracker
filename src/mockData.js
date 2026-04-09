// ============================================================
// MOCK DATA — Refactored to match Dev 2's finalized schema
// Simulates our Supabase database tables as local JS arrays.
// When the backend is ready, these get replaced with real
// Supabase fetch calls — component logic stays untouched.
// ============================================================

// ---- COMMUNITIES ----
export const MOCK_COMMUNITIES = [
  {
    id: "community-uuid-001",
    name: "Academic Stress",
    category: "Stressors",
    created_by: "user-uuid-admin",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "community-uuid-002",
    name: "Coping Strategies",
    category: "Wellness",
    created_by: "user-uuid-admin",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "community-uuid-003",
    name: "Daily Affirmations",
    category: "Positivity",
    created_by: "user-uuid-admin",
    created_at: "2025-01-01T00:00:00Z",
  },
];

// ---- POSTS ----
// REMOVED: upvotes integer (now derived from reactions[])
// ADDED:   community_id (FK → communities), is_flagged (moderation)
export const MOCK_POSTS = [
  {
    id: "post-uuid-001",
    author_id: "user-uuid-abc",
    community_id: "community-uuid-001",
    content:
      "I've been feeling really overwhelmed with school lately. Does anyone else struggle with balancing academics and mental health? I feel like I'm drowning.",
    is_anonymous: true,
    is_flagged: false,
    created_at: "2025-06-10T08:30:00Z",
  },
  {
    id: "post-uuid-002",
    author_id: "user-uuid-def",
    community_id: "community-uuid-002",
    content:
      "Today I tried the 5-4-3-2-1 grounding technique during my anxiety attack and it actually worked! 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste. Highly recommend.",
    is_anonymous: false,
    is_flagged: false,
    created_at: "2025-06-09T14:00:00Z",
  },
  {
    id: "post-uuid-003",
    author_id: "user-uuid-ghi",
    community_id: "community-uuid-003",
    content:
      "Reminder: It's okay to not be okay. You don't have to perform happiness for anyone.",
    is_anonymous: true,
    is_flagged: false,
    created_at: "2025-06-08T20:15:00Z",
  },
];

// ---- COMMENTS ----
// ADDED: author_id — now required by the updated Data Contract
export const MOCK_COMMENTS = [
  {
    id: "comment-uuid-001",
    post_id: "post-uuid-001",
    author_id: "user-uuid-def",
    content: "You are not alone. I feel this every semester.",
    created_at: "2025-06-10T09:00:00Z",
  },
  {
    id: "comment-uuid-002",
    post_id: "post-uuid-001",
    author_id: "user-uuid-ghi",
    content: "Have you tried talking to the school counselor? It helped me.",
    created_at: "2025-06-10T09:45:00Z",
  },
  {
    id: "comment-uuid-003",
    post_id: "post-uuid-002",
    author_id: "user-uuid-abc",
    content: "Saving this. I always forget the steps during a panic attack!",
    created_at: "2025-06-09T15:30:00Z",
  },
];

// ---- REACTIONS ----
// NEW TABLE — replaces the upvotes integer on posts.
// Each upvote is its own record with user_id + post_id + type.
// Upvote count = filter this array by post_id and type === 'upvote'
export const MOCK_REACTIONS = [
  {
    id: "reaction-uuid-001",
    post_id: "post-uuid-001",
    user_id: "user-uuid-def",
    type: "upvote",
    created_at: "2025-06-10T09:10:00Z",
  },
  {
    id: "reaction-uuid-002",
    post_id: "post-uuid-001",
    user_id: "user-uuid-ghi",
    type: "upvote",
    created_at: "2025-06-10T10:00:00Z",
  },
  {
    id: "reaction-uuid-003",
    post_id: "post-uuid-002",
    user_id: "user-uuid-abc",
    type: "upvote",
    created_at: "2025-06-09T15:00:00Z",
  },
  {
    id: "reaction-uuid-004",
    post_id: "post-uuid-003",
    user_id: "user-uuid-abc",
    type: "upvote",
    created_at: "2025-06-09T21:00:00Z",
  },
  {
    id: "reaction-uuid-005",
    post_id: "post-uuid-003",
    user_id: "user-uuid-def",
    type: "upvote",
    created_at: "2025-06-09T21:05:00Z",
  },
];

// ---- JOURNAL ENTRIES ---- (unchanged)
export const MOCK_JOURNAL_ENTRIES = [
  {
    id: "journal-uuid-001",
    user_id: "user-uuid-abc",
    prompt_answered: "What is one thing that challenged you today?",
    entry_text:
      "I had a hard time focusing during my morning classes. My mind kept drifting to worries about the future.",
    created_at: "2025-06-10T21:00:00Z",
  },
  {
    id: "journal-uuid-002",
    user_id: "user-uuid-abc",
    prompt_answered: "What are you grateful for right now?",
    entry_text:
      "I'm grateful for my friends who checked in on me today. Small gestures mean so much.",
    created_at: "2025-06-09T21:30:00Z",
  },
];

// ---- RESOURCES ---- (unchanged)
export const MOCK_RESOURCES = [
  {
    id: "resource-uuid-001",
    title: "Box Breathing for Anxiety",
    description:
      "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat. A technique used by Navy SEALs to stay calm under pressure.",
    category: "Breathing",
  },
  {
    id: "resource-uuid-002",
    title: "Progressive Muscle Relaxation",
    description:
      "Systematically tense and release muscle groups from your toes to your head to release physical tension caused by stress.",
    category: "Body",
  },
  {
    id: "resource-uuid-003",
    title: "Cognitive Reframing",
    description:
      "Challenge negative automatic thoughts by asking: Is this thought 100% true? What would I tell a friend who thought this?",
    category: "Mindset",
  },
];