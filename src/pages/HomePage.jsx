import PostCard from "../components/PostCard";

// ============================================================
// PAGE: HomePage
// SECI CONNECTION — SOCIALIZATION:
//   The feed where community members share lived experiences.
//
// WHY HomePage IS NOW SIMPLER:
//   Previously, HomePage used useEffect + useState to load and
//   own mock data. Now that App.jsx owns all posts and comments,
//   HomePage is purely a "pass-through" — it receives data as
//   props and forwards them to PostCard. It no longer needs
//   useEffect or its own loading state because the data is
//   already loaded and alive in App.jsx above it.
//
// PROPS RECEIVED FROM App.jsx:
//   - posts: the full merged array of all posts
//   - comments: all comments (will be filtered per post below)
//   - upvotedPostIds: Set of post IDs the user already upvoted
//   - onUpvote: handler to call when a post is upvoted
//   - onAddComment: handler to call when a comment is submitted
// ============================================================

function HomePage({ posts, comments, upvotedPostIds, onUpvote, onAddComment }) {
  return (
    <div>
      <h2 style={{ marginBottom: "4px" }}>🌿 Community Feed</h2>
      <p style={{ color: "#888", fontSize: "13px", marginTop: 0 }}>
        A safe space to share and be heard.
      </p>

      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", marginTop: "40px" }}>
          No posts yet. Be the first to share! 💬
        </p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            // Filter the master comments array to only this post's comments.
            // This mirrors a SQL WHERE comment.post_id = post.id query.
            comments={comments.filter((c) => c.post_id === post.id)}
            // Tell this PostCard whether the user already upvoted it
            hasUpvoted={upvotedPostIds.has(post.id)}
            // Pass the App-level handlers down — PostCard will call
            // these with the relevant data when the user interacts
            onUpvote={onUpvote}
            onAddComment={onAddComment}
          />
        ))
      )}
    </div>
  );
}

export default HomePage;