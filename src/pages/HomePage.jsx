import PostCard from "../components/PostCard";

// ============================================================
// PAGE: HomePage — Community Feed
// SECI CONNECTION — SOCIALIZATION:
//   Central hub where members exchange lived experiences.
//
// WHY THIS PAGE IS NOW A THIN PASS-THROUGH:
//   All data lives in App.jsx. HomePage just receives props
//   and forwards the right slices to each PostCard. It does
//   NOT own state or fetch data — that responsibility was
//   lifted up to App.jsx so it survives tab navigation.
// ============================================================

function HomePage({
  posts,
  comments,
  reactions,
  communities,
  currentUserId,
  onUpvote,
  onAddComment,
}) {
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
        posts.map((post) => {
          // Pre-filter all arrays to only this post's related data.
          // WHY filter here: PostCard stays reusable and receives
          // only what it needs — mirrors a SQL JOIN with a WHERE clause.

          const postComments = comments.filter((c) => c.post_id === post.id);
          const postReactions = reactions.filter((r) => r.post_id === post.id);

          // Has the current user already upvoted this specific post?
          const hasUpvoted = postReactions.some(
            (r) => r.user_id === currentUserId && r.type === "upvote"
          );

          // Resolve community name from community_id foreign key.
          // ?. (optional chaining) prevents crash if no match found.
          const community = communities.find((c) => c.id === post.community_id);

          return (
            <PostCard
              key={post.id}
              post={post}
              comments={postComments}
              reactions={postReactions}
              hasUpvoted={hasUpvoted}
              communityName={community?.name}
              currentUserId={currentUserId}
              onUpvote={onUpvote}
              onAddComment={onAddComment}
            />
          );
        })
      )}
    </div>
  );
}

export default HomePage;