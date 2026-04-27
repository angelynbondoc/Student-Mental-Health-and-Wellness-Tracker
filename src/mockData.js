// =============================================================================
// mockData.js
// All field names strictly match Dev 2's DB schema.
// Batch 3 adds: direct_messages, notifications
// =============================================================================

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ── PROFILES ──────────────────────────────────────────────────────────────────
export const INITIAL_PROFILES = [
  {
    id: 'user-1',
    email: 'teststudent@university.edu',
    display_name: 'Test Student',
    role: 'student',
    privacy_acknowledged: true,
    created_at: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'user-2',
    email: 'janedoe@university.edu',
    display_name: 'Jane Doe',
    role: 'student',
    privacy_acknowledged: true,
    created_at: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'user-admin',
    email: 'admin@university.edu',
    display_name: 'Dr. Admin',
    role: 'admin',
    privacy_acknowledged: true,
    created_at: new Date('2024-01-01').toISOString(),
  },
];

// ── COMMUNITIES ───────────────────────────────────────────────────────────────
export const INITIAL_COMMUNITIES = [
  {
    id: 'community-1',
    name: 'BSCS',
    category: 'program_discussion',
    created_by: 'user-admin',
    created_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'community-2',
    name: 'Mental Wellness Corner',
    category: 'shared_interest',
    created_by: 'user-admin',
    created_at: new Date('2024-01-01').toISOString(),
  },
];

// ── POSTS ─────────────────────────────────────────────────────────────────────
export const INITIAL_POSTS = [
  {
    id: 'post-1',
    author_id: 'user-2',
    community_id: 'community-1',
    content: 'Does anyone have good resources for the final exams? Feeling a bit overwhelmed.',
    is_anonymous: false,
    is_flagged: false,
    created_at: new Date('2024-06-10T09:00:00').toISOString(),
  },
  {
    id: 'post-2',
    author_id: 'user-1',
    community_id: 'community-2',
    content: "I've been struggling with anxiety lately. Anyone else feeling this way?",
    is_anonymous: true,
    is_flagged: false,
    created_at: new Date('2024-06-11T14:30:00').toISOString(),
  },
];

// ── COMMENTS ──────────────────────────────────────────────────────────────────
export const INITIAL_COMMENTS = [
  {
    id: 'comment-1',
    post_id: 'post-1',
    author_id: 'user-1',
    content: 'Check the university library portal — they have past papers there!',
    created_at: new Date('2024-06-10T10:15:00').toISOString(),
  },
];

// ── REACTIONS ─────────────────────────────────────────────────────────────────
export const INITIAL_REACTIONS = [
  {
    id: 'reaction-1',
    post_id: 'post-1',
    user_id: 'user-2',
    type: 'upvote',
    created_at: new Date('2024-06-10T11:00:00').toISOString(),
  },
];

// ── MOOD JOURNAL ──────────────────────────────────────────────────────────────
export const INITIAL_MOOD_JOURNAL = [
  {
    id: 'journal-1',
    user_id: 'user-1',
    mood_rating: 3,
    trigger_note: 'Had a tough time focusing during lectures today.',
    gratitude_note: 'Grateful for my study group who helped me catch up.',
    reflection_note: 'I should try the Pomodoro technique tomorrow.',
    entry_text: 'Overall an okay day, but I felt mentally foggy in the afternoon.',
    created_at: new Date('2024-06-09T21:00:00').toISOString(),
  },
  {
    id: 'journal-2',
    user_id: 'user-1',
    mood_rating: 5,
    trigger_note: 'Finished my major project and submitted on time.',
    gratitude_note: 'Grateful for coffee and a quiet library corner.',
    reflection_note: 'Taking breaks actually helped me stay more focused.',
    entry_text: 'Great day! Feeling accomplished and relieved.',
    created_at: new Date('2024-06-10T20:30:00').toISOString(),
  },
];

// ── RESOURCES ─────────────────────────────────────────────────────────────────
export const INITIAL_RESOURCES = [
  {
    id: 'resource-1',
    title: '4-7-8 Breathing Technique',
    content: 'Inhale for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds. Repeat 4 times.',
    category: 'Breathing Exercises',
    created_at: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'resource-2',
    title: 'Box Breathing',
    content: 'Breathe in for 4 counts, hold for 4, out for 4, hold for 4. Used by Navy SEALs.',
    category: 'Breathing Exercises',
    created_at: new Date('2024-01-06').toISOString(),
  },
  {
    id: 'resource-3',
    title: 'Body Scan Meditation',
    content: 'Slowly move attention from toes to head, releasing tension. Takes about 10 minutes.',
    category: 'Mindfulness',
    created_at: new Date('2024-01-07').toISOString(),
  },
  {
    id: 'resource-4',
    title: 'The 5-4-3-2-1 Grounding Technique',
    content: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    category: 'Mindfulness',
    created_at: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'resource-5',
    title: 'University Counseling Hotline',
    content: 'Available Mon–Fri, 8AM–5PM. Call ext. 1234 or visit Room 204, Student Services Building.',
    category: 'Crisis Support',
    created_at: new Date('2024-01-09').toISOString(),
  },
];

// ── HABITS ────────────────────────────────────────────────────────────────────
export const INITIAL_HABITS = [
  {
    id: 'habit-1',
    user_id: 'user-1',
    habit_name: 'Morning Meditation (10 min)',
    created_at: new Date('2024-05-01').toISOString(),
  },
  {
    id: 'habit-2',
    user_id: 'user-1',
    habit_name: 'Drink 8 glasses of water',
    created_at: new Date('2024-05-01').toISOString(),
  },
  {
    id: 'habit-3',
    user_id: 'user-1',
    habit_name: '30-min walk or exercise',
    created_at: new Date('2024-05-02').toISOString(),
  },
  {
    id: 'habit-4',
    user_id: 'user-2', // Belongs to Jane Doe — should NOT appear for user-1
    habit_name: "Jane's private habit",
    created_at: new Date('2024-05-01').toISOString(),
  },
];

// ── HABIT LOGS ────────────────────────────────────────────────────────────────
export const INITIAL_HABIT_LOGS = [
  {
    id: 'log-1',
    habit_id: 'habit-1',
    user_id: 'user-1',
    completed_date: new Date('2024-06-09').toISOString().split('T')[0],
    created_at: new Date('2024-06-09T08:00:00').toISOString(),
  },
];

// =============================================================================
// ── NOTIFICATIONS  (NEW — Batch 3) ───────────────────────────────────────────
// Schema: id, user_id, type, content, is_read, created_at
// Seeded with a mix of read and unread so the bell badge has a count to show.
// =============================================================================
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'comment',
    content: 'Jane Doe commented on your post in Mental Wellness Corner.',
    is_read: false,
    created_at: new Date('2024-06-11T15:00:00').toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    type: 'reaction',
    content: 'Someone upvoted your post in BSCS.',
    is_read: false,
    created_at: new Date('2024-06-11T16:30:00').toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    type: 'share',
    content: 'Dr. Admin shared your post in Mental Wellness Corner.',
    is_read: true,
    created_at: new Date('2024-06-10T10:00:00').toISOString(),
  },
  {
    id: 'notif-4',
    user_id: 'user-1',
    type: 'system',
    content: 'Welcome to MindSpace! Explore communities and start your wellness journey.',
    is_read: true,
    created_at: new Date('2024-01-15T08:00:00').toISOString(),
  },
];

// =============================================================================
// ── DIRECT MESSAGES  (NEW — Batch 3) ─────────────────────────────────────────
// Schema: id, sender_id, receiver_id, message_text, is_read, created_at
//
// Flat one-directional records. InboxPage groups them into threads by finding
// all rows where currentUser is EITHER sender OR receiver, then grouping by
// the OTHER person's ID.
// =============================================================================
export const INITIAL_DIRECT_MESSAGES = [
  // Thread: user-1 ↔ user-2
  {
    id: 'dm-1',
    sender_id: 'user-2',
    receiver_id: 'user-1',
    message_text: 'Hey! Did you manage to find study resources for the finals?',
    is_read: true,
    created_at: new Date('2024-06-10T11:00:00').toISOString(),
  },
  {
    id: 'dm-2',
    sender_id: 'user-1',
    receiver_id: 'user-2',
    message_text: 'Yes! Check the library portal — they have past papers. 📚',
    is_read: true,
    created_at: new Date('2024-06-10T11:05:00').toISOString(),
  },
  {
    id: 'dm-3',
    sender_id: 'user-2',
    receiver_id: 'user-1',
    message_text: 'Amazing, thank you so much! You saved my life 😅',
    is_read: false, // Unread — drives the badge on this thread
    created_at: new Date('2024-06-10T11:10:00').toISOString(),
  },
  // Thread: user-1 ↔ user-admin
  {
    id: 'dm-4',
    sender_id: 'user-admin',
    receiver_id: 'user-1',
    message_text: 'Hi! Just checking in — how are you finding the wellness features?',
    is_read: false,
    created_at: new Date('2024-06-11T09:00:00').toISOString(),
  },
];

export const MOCK_REPORTS = [
  {
    id: 1, status: "pending", reason: "Harmful content",
    description: "This post contains advice that could be dangerous to students struggling with mental health.",
    reportedAt: "2025-04-26T09:14:00",
    reporter: { name: "Ana Reyes", program: "BS Psychology", avatar: "AR" },
    post: {
      id: "p1",
      content: "If you feel like no one cares, maybe they're right. Just stop trying to reach out, it never works anyway.",
      author: { name: "Unknown User", program: "BS Computer Science", avatar: "UU" },
      postedAt: "2025-04-26T08:00:00", likes: 2, comments: 5,
    },
  },
  {
    id: 2, status: "pending", reason: "Misinformation",
    description: "Post spreads false information about medication and mental health treatment.",
    reportedAt: "2025-04-25T14:30:00",
    reporter: { name: "Carlo Mendoza", program: "BS Nursing", avatar: "CM" },
    post: {
      id: "p2",
      content: "Antidepressants are just a scam by big pharma. Just exercise and you'll be 100% cured from depression. Doctors won't tell you this.",
      author: { name: "Jeric Santos", program: "BS Physical Education", avatar: "JS" },
      postedAt: "2025-04-25T11:00:00", likes: 14, comments: 21,
    },
  },
  {
    id: 3, status: "pending", reason: "Bullying / Harassment",
    description: "The post is mocking students who seek professional help.",
    reportedAt: "2025-04-24T18:45:00",
    reporter: { name: "Maria Cruz", program: "BS Education", avatar: "MC" },
    post: {
      id: "p3",
      content: "lol imagine going to therapy because you can't handle college. some people are just too soft for university life ngl 💀",
      author: { name: "Kevin Lim", program: "BS Business Administration", avatar: "KL" },
      postedAt: "2025-04-24T17:20:00", likes: 7, comments: 3,
    },
  },
  {
    id: 4, status: "resolved", resolution: "removed", reason: "Spam",
    description: "Repetitive promotional content unrelated to mental health.",
    reportedAt: "2025-04-23T10:00:00",
    reporter: { name: "Rina Bautista", program: "BS Psychology", avatar: "RB" },
    post: {
      id: "p4",
      content: "Check out this amazing supplement that cures anxiety! DM me for prices. Limited stocks only!!!",
      author: { name: "Spam Account", program: "—", avatar: "SA" },
      postedAt: "2025-04-23T09:00:00", likes: 0, comments: 0,
    },
  },
  {
    id: 5, status: "resolved", resolution: "dismissed", reason: "Inappropriate language",
    description: "Contains strong language but reviewer found it within acceptable bounds.",
    reportedAt: "2025-04-22T16:00:00",
    reporter: { name: "Paolo Garcia", program: "BS Accountancy", avatar: "PG" },
    post: {
      id: "p5",
      content: "Honestly this semester has been absolute hell. I'm burnt out and exhausted and I just need a break.",
      author: { name: "Tricia Villanueva", program: "BS Accountancy", avatar: "TV" },
      postedAt: "2025-04-22T15:00:00", likes: 44, comments: 12,
    },
  },
];

export const MOCK_USER_REPORTS = [
  {
    id: "ur1", status: "pending", reason: "Harassment",
    description: "This user has been sending threatening messages to other students in the community.",
    reportedAt: "2025-04-26T10:00:00",
    reporter: { name: "Ana Reyes", program: "BS Psychology", avatar: "AR" },
    reportedUser: { id: "u2", name: "Kevin Lim", program: "BS Business Administration", avatar: "KL", postCount: 21, joinedAt: "2024-08-01" },
  },
  {
    id: "ur2", status: "pending", reason: "Spam / Bot behavior",
    description: "Account posts repetitive promotional content multiple times a day.",
    reportedAt: "2025-04-25T08:30:00",
    reporter: { name: "Carlo Mendoza", program: "BS Nursing", avatar: "CM" },
    reportedUser: { id: "u3", name: "Spam Account", program: "—", avatar: "SA", postCount: 5, joinedAt: "2025-04-20" },
  },
  {
    id: "ur3", status: "pending", reason: "Impersonation",
    description: "This user is pretending to be a licensed school counselor and giving mental health advice.",
    reportedAt: "2025-04-24T15:00:00",
    reporter: { name: "Maria Cruz", program: "BS Education", avatar: "MC" },
    reportedUser: { id: "u1", name: "Jeric Santos", program: "BS Physical Education", avatar: "JS", postCount: 38, joinedAt: "2024-08-01" },
  },
  {
    id: "ur4", status: "resolved", resolution: "suspended", reason: "Repeated violations",
    description: "User has accumulated multiple post removals and continues to violate community guidelines.",
    reportedAt: "2025-04-22T12:00:00",
    reporter: { name: "Rina Bautista", program: "BS Psychology", avatar: "RB" },
    reportedUser: { id: "u3", name: "Spam Account", program: "—", avatar: "SA", postCount: 5, joinedAt: "2025-04-20" },
    adminNote: "User suspended after review of violation history.",
  },
  {
    id: "ur5", status: "resolved", resolution: "dismissed", reason: "Inappropriate username",
    description: "Reporter found the username offensive but it does not violate our guidelines.",
    reportedAt: "2025-04-21T09:00:00",
    reporter: { name: "Paolo Garcia", program: "BS Accountancy", avatar: "PG" },
    reportedUser: { id: "u4", name: "Ana Reyes", program: "BS Psychology", avatar: "AR", postCount: 57, joinedAt: "2024-08-01" },
    adminNote: "Username reviewed — does not violate community standards.",
  },
];

export const MOCK_USERS = [
  { id: "u1", name: "Jeric Santos", program: "BS Physical Education", avatar: "JS", status: "active", reportCount: 2, joinedAt: "2024-08-01", postCount: 38 },
  { id: "u2", name: "Kevin Lim", program: "BS Business Administration", avatar: "KL", status: "active", reportCount: 1, joinedAt: "2024-08-01", postCount: 21 },
  { id: "u3", name: "Spam Account", program: "—", avatar: "SA", status: "suspended", reportCount: 4, joinedAt: "2025-04-20", postCount: 5 },
  { id: "u4", name: "Ana Reyes", program: "BS Psychology", avatar: "AR", status: "active", reportCount: 0, joinedAt: "2024-08-01", postCount: 57 },
  { id: "u5", name: "Tricia Villanueva", program: "BS Accountancy", avatar: "TV", status: "active", reportCount: 0, joinedAt: "2024-08-01", postCount: 29 },
];