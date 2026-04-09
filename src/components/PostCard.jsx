import { useState } from "react";
import CommentItem from "./CommentItem";

// ============================================================
// COMPONENT: PostCard
// SECI CONNECTION — SOCIALIZATION:
//   The core unit of peer-to-peer knowledge sharing. Each card
//   displays a community member's lived experience and allows
//   others to validate it (upvote) or respond (comment).
//
// WHY PostCard NO LONGER OWNS upvotes OR comments IN STATE:
//   This is the core bug fix. Previously PostCard used useState
//   for upvotes and comments — local state that was destroyed
//   every time the user navigated away (component unmount).
//   Now PostCard is a "controlled component" — like a controlled
//   <input>, it displays whatever its parent tells it to (via
//   props) and reports user actions upward via callbacks.
//   It owns NO persistent data of its own.
//
// PROPS RECEIVED:
//   - post: single post object (contains upvotes count from App)
//   - comments: pre-filtered array of comments for this post
//   - hasUpvoted: boolean — has current user upvoted this post?
//   - onUpvote(postId): callback to App.jsx to increment upvotes
//   - onAddComment(newComment): callback to App.jsx to add comment
//
// THE ONE useState STILL HERE — newCommentText:
//   The text input for typing a reply is temporary UI state —
//   it only needs to exist while the user is typing and clears
//   after submission. It does NOT need to persist across
//   navigation, so it's fine to keep it local here.
// ============================================================

function PostCard({ post, comments, hasUpvoted, onUpvote, onAddComment }) {
  // This is the ONLY local state PostCard should own —
  // the temporary value of the comment text input field.
  // It is intentionally ephemeral (resets on unmount is fine).
  const [newCommentText, setNewCommentText] = useState("");

  // ---- HANDLER: Upvote ----
  // We don't manage the count here anymore — we just tell App.jsx
  // "the user clicked upvote on THIS post" by passing up the ID.
  // App.jsx will update the posts array and pass the new count
  // back down via the post.upvotes prop on the next render.
  const handleUpvote = () => {
    if (hasUpvoted) return; // Guard: already voted, do nothing
    onUpvote(post.id);      // Lift the action up to App.jsx
  };

  // ---- HANDLER: Add Comment ----
  // Builds a comment object matching the 'comments' Data Contract,
  // then passes it up to App.jsx via the onAddComment callback.
  const handleAddComment = () => {
    if (!newCommentText.trim()) return; // Guard: no empty comments

    // Build comment object strictly following the Data Contract schema
    const newComment = {
      id: crypto.randomUUID(),          // Simulates Supabase auto-UUID
      post_id: post.id,                 // Foreign key — links to parent post
      content: newCommentText,
      created_at: new Date().toISOString(),
    };

    onAddComment(newComment); // Lift up to App.jsx to persist in master array
    setNewCommentText("");    // Clear the local input field after submit
  };

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    backgroundColor: "#fafafa",
  };

  return (
    <div style={cardStyle}>
      <p style={{ fontSize: "12px", color: "#999", margin: "0 0 4px 0" }}>
        {post.is_anonymous ? "🕵️ Anonymous" : "👤 Community Member"} ·{" "}
        {formatDate(post.created_at)}
      </p>

      <p style={{ margin: "8px 0", fontSize: "15px" }}>{post.content}</p>

      {/* Upvote button — reads upvote count directly from post prop,
          which is now controlled by App.jsx and persists navigation */}
      <button
        onClick={handleUpvote}
        disabled={hasUpvoted}
        style={{
          backgroundColor: hasUpvoted ? "#6c63ff" : "#eee",
          color: hasUpvoted ? "#fff" : "#333",
          border: "none",
          borderRadius: "4px",
          padding: "6px 12px",
          cursor: hasUpvoted ? "not-allowed" : "pointer",
          marginRight: "8px",
        }}
      >
        ▲ Upvote {post.upvotes}
      </button>

      <hr style={{ margin: "12px 0", borderColor: "#eee" }} />

      {/* Comments Section — renders from props, not local state */}
      <div>
        <strong style={{ fontSize: "13px" }}>
          💬 Replies ({comments.length})
        </strong>

        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a supportive reply..."
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            style={{
              flex: 1,
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleAddComment}
            style={{
              padding: "6px 10px",
              backgroundColor: "#6c63ff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;