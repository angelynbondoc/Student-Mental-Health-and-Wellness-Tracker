import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import MobileLayout from "./components/MobileLayout";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import JournalPage from "./pages/JournalPage";
import ResourcesPage from "./pages/ResourcesPage";
import {
  MOCK_POSTS,
  MOCK_COMMENTS,
  MOCK_REACTIONS,
  MOCK_COMMUNITIES,
} from "./mockData";

// ============================================================
// ROOT COMPONENT: App.jsx — Single Source of Truth
//
// WHY ALL STATE LIVES HERE:
//   App.jsx is never unmounted during tab navigation.
//   Any state inside a page component (HomePage, CreatePage)
//   gets destroyed when the user navigates away. By lifting
//   all shared state here, data persists across the entire
//   session regardless of which tab is active.
//
// CURRENT_USER_ID simulates Supabase auth.user.id.
// In Phase 3, replace this with: supabase.auth.getUser()
// ============================================================

const CURRENT_USER_ID = "user-uuid-current";

function App() {
  // Master posts array — no longer stores upvote count
  const [posts, setPosts] = useState(MOCK_POSTS);

  // Master comments array — includes author_id per new schema
  const [comments, setComments] = useState(MOCK_COMMENTS);

  // Master reactions array — each upvote is its own record here.
  // Upvote counts are DERIVED from this at render time, not stored.
  const [reactions, setReactions] = useState(MOCK_REACTIONS);

  // Communities — read-only in Phase 1, no setter needed
  const [communities] = useState(MOCK_COMMUNITIES);

  // ---- HANDLER: Add New Post ----
  // Prepends so newest posts appear at the top of the feed
  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // ---- HANDLER: Upvote (Refactored) ----
  // Instead of incrementing post.upvotes, we INSERT a new record
  // into the reactions array. This mirrors how the real Supabase
  // INSERT INTO reactions (...) query will work in Phase 3.
  const handleUpvote = (postId) => {
    // Guard: prevent double-voting by checking reactions array.
    // .some() short-circuits on first match — faster than .filter()
    const alreadyReacted = reactions.some(
      (r) => r.post_id === postId && r.user_id === CURRENT_USER_ID
    );
    if (alreadyReacted) return;

    const newReaction = {
      id: crypto.randomUUID(),
      post_id: postId,
      user_id: CURRENT_USER_ID,
      type: "upvote",
      created_at: new Date().toISOString(),
    };

    // Append — triggers re-render so PostCard recalculates upvoteCount
    setReactions((prev) => [...prev, newReaction]);
  };

  // ---- HANDLER: Add Comment ----
  const handleAddComment = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <Routes>
      <Route path="/" element={<MobileLayout />}>
        <Route
          index
          element={
            <HomePage
              posts={posts}
              comments={comments}
              reactions={reactions}
              communities={communities}
              currentUserId={CURRENT_USER_ID}
              onUpvote={handleUpvote}
              onAddComment={handleAddComment}
            />
          }
        />
        <Route
          path="create"
          element={
            <CreatePage
              onPostSubmit={handleNewPost}
              communities={communities}
              currentUserId={CURRENT_USER_ID}
            />
          }
        />
        <Route path="journal" element={<JournalPage />} />
        <Route path="resources" element={<ResourcesPage />} />
      </Route>
    </Routes>
  );
}

export default App;