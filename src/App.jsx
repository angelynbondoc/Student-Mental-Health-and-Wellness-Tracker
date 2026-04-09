import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MobileLayout from "./components/MobileLayout";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import JournalPage from "./pages/JournalPage";
import ResourcesPage from "./pages/ResourcesPage";
import { MOCK_POSTS, MOCK_COMMENTS } from "./mockData";

// ============================================================
// ROOT COMPONENT: App.jsx
//
// WHY App.jsx NOW OWNS posts AND comments:
//   React Router unmounts a page component when you navigate
//   away from it. Any useState inside that component is wiped.
//   The fix is "lifting state up" to the nearest ancestor that
//   is NEVER unmounted — App.jsx. Since App.jsx wraps ALL routes,
//   it stays alive for the entire session, so state persists
//   across tab navigation.
//
// STATE OWNED HERE:
//   - posts: the full list of posts (including upvote counts)
//   - comments: all comments across all posts
//   - upvotedPostIds: a Set tracking which posts THIS user
//     has already upvoted (enforces one-vote-per-post rule)
//
// PATTERN — "Lift State, Pass Handlers":
//   App.jsx owns the data. Child components receive data as
//   props and report changes via callback functions (handlers).
//   Children never mutate state directly — they ask the parent
//   to do it. This is the standard React data flow pattern.
// ============================================================

function App() {
  // ---- Master Posts Array ----
  // Initialized with mock data directly (no useEffect needed here
  // since App.jsx never unmounts — we load it once at startup).
  const [posts, setPosts] = useState(MOCK_POSTS);

  // ---- Master Comments Array ----
  // Holds ALL comments for ALL posts. We filter by post_id when
  // passing down to individual PostCard components.
  const [comments, setComments] = useState(MOCK_COMMENTS);

  // ---- Upvoted Post Tracker ----
  // WHY a Set: A Set automatically prevents duplicates and has
  // O(1) lookup with .has() — perfect for checking "has this
  // user already upvoted post X?" without looping the array.
  // We store post IDs here, not upvote counts (counts live in posts).
  const [upvotedPostIds, setUpvotedPostIds] = useState(new Set());

  // ---- HANDLER: Add New Post ----
  // Called by CreatePostForm via CreatePage.
  // Prepends the new post so it appears at the top of the feed.
  const handleNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // ---- HANDLER: Upvote a Post ----
  // Called by PostCard when the upvote button is clicked.
  // WHY we pass postId as an argument: the handler lives in App.jsx
  // but needs to know WHICH post to update. The child passes its
  // own post.id up to identify itself.
  const handleUpvote = (postId) => {
    // Guard: if this post is already in our upvoted set, do nothing
    if (upvotedPostIds.has(postId)) return;

    // Update the posts array — find the matching post and increment
    // its upvotes. WHY map() instead of mutating directly:
    // React requires state to be replaced with a NEW array/object,
    // not mutated in place. map() returns a new array where only
    // the matching post object is replaced with a new object
    // (spread + override), leaving all other posts untouched.
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, upvotes: post.upvotes + 1 } // new object, +1 upvote
          : post // all other posts unchanged
      )
    );

    // Record this postId as upvoted so the button locks.
    // WHY new Set(prev): Sets are reference types. We must create a
    // new Set (not mutate the old one) to trigger a React re-render.
    setUpvotedPostIds((prev) => new Set(prev).add(postId));
  };

  // ---- HANDLER: Add a Comment ----
  // Called by PostCard when the Reply button is clicked.
  // Appends the new comment to the master comments array.
  // Since comments are filtered by post_id at render time,
  // this new comment will automatically appear under the
  // correct post without any extra routing logic.
  const handleAddComment = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
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
              upvotedPostIds={upvotedPostIds}
              onUpvote={handleUpvote}
              onAddComment={handleAddComment}
            />
          }
        />
        <Route
          path="create"
          element={<CreatePage onPostSubmit={handleNewPost} />}
        />
        <Route path="journal" element={<JournalPage />} />
        <Route path="resources" element={<ResourcesPage />} />
      </Route>
    </Routes>
  );
}

export default App;