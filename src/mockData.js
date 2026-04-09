// ============================================================
// MOCK DATA — Sprint 1 Simulation Layer
// WHY THIS EXISTS: Our Supabase backend isn't ready yet.
// Instead of blocking development, we simulate the database
// by exporting plain JavaScript arrays that mirror the exact
// schema from our Data Contracts. When Dev 2 finishes the
// backend, we only need to swap these arrays with real
// Supabase fetch calls — the component logic stays the same.
// ============================================================

// Mirrors the 'posts' table schema from Data Contracts.
// 'upvotes' starts at different values to simulate real data variety.
export const MOCK_POSTS = [
  {
    id: "post-uuid-001",
    author_id: "user-uuid-abc",
    content:
      "I've been feeling really overwhelmed with school lately. Does anyone else struggle with balancing academics and mental health? I feel like I'm drowning.",
    is_anonymous: true,
    upvotes: 14,
    created_at: "2025-06-10T08:30:00Z",
  },
  {
    id: "post-uuid-002",
    author_id: "user-uuid-def",
    content:
      "Today I tried the 5-4-3-2-1 grounding technique during my anxiety attack and it actually worked! 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste. Highly recommend.",
    is_anonymous: false,
    upvotes: 42,
    created_at: "2025-06-09T14:00:00Z",
  },
  {
    id: "post-uuid-003",
    author_id: "user-uuid-ghi",
    content:
      "Reminder: It's okay to not be okay. You don't have to perform happiness for anyone.",
    is_anonymous: true,
    upvotes: 88,
    created_at: "2025-06-08T20:15:00Z",
  },
];

// Mirrors the 'comments' table. Each comment has a post_id
// foreign key so we can filter which comments belong to which post.
export const MOCK_COMMENTS = [
  {
    id: "comment-uuid-001",
    post_id: "post-uuid-001",
    content: "You are not alone. I feel this every semester.",
    created_at: "2025-06-10T09:00:00Z",
  },
  {
    id: "comment-uuid-002",
    post_id: "post-uuid-001",
    content: "Have you tried talking to the school counselor? It helped me.",
    created_at: "2025-06-10T09:45:00Z",
  },
  {
    id: "comment-uuid-003",
    post_id: "post-uuid-002",
    content: "Saving this. I always forget the steps during a panic attack!",
    created_at: "2025-06-09T15:30:00Z",
  },
];

// Mirrors the 'mood_journal' table from Data Contracts.
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

// Supplementary mock data for the Resources page.
// This doesn't have a strict DB contract yet, so we keep it simple.
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