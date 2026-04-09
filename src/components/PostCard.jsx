import { useState } from "react";
import CommentItem from "./CommentItem";

// ============================================================
// COMPONENT: PostCard
// SECI CONNECTION — SOCIALIZATION:
//   The core unit of peer knowledge sharing. Tacit experiences
//   become visible and validatable by the community.
//
// KEY CONCEPT — DERIVED VALUE for upvote count:
//   We no longer read post.upvotes (it doesn't exist anymore).
//   Instead: upvoteCount = reactions.filter(r => r.type === 'upvote').length
//   This is computed fresh on every render from the source-of-truth
//   reactions array. It's always mathematically correct.
//   SQL equivalent: SELECT COUNT(*) FROM reactions
//                   WHERE post_id = X AND type = 'upvote'
//
// PROPS:
//   - post           : post object (no upvotes field)
//   - comments       : pre-filtered comments for this post
//   - reactions      : pre-filtered reactions for this post
//   - hasUpvoted     : did current user already upvote?
//   - communityName  : resolved community label string
//   - currentUserId  : for attaching author_id to new comments
//   - onUpvote       : callback → App.jsx
//   - onAddComment   : callback → App.jsx
// ============================================================

function PostCard({
  post,
  comments,
  reactions,
  hasUpvoted,
  communityName,
  currentUserId,
  onUpvote,
  onAddComment,
}) {
  // Only local state: temporary comment input text.
  // Intentionally resets on unmount — that behavior is correct here.
  const [newCommentText, setNewCommentText] = useState("");

  // ---- DERIVED VALUE: Upvote Count ----
  // Calculated from the reactions prop, not stored anywhere.
  const upvoteCount = reactions.filter((r) => r.type === "upvote").length;

  const handleUpvote = () => {
    if (hasUpvoted) return;
    onUpvote(post.id);
  };

  // ---- HANDLER: Add Comment ----
  // Builds a comment matching the updated schema (now includes author_id)
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const newComment = {
      id: crypto.randomUUID(),
      post_id: post.id,
      author_id: currentUserId,         // ← required by updated Data Contract
      content: newCommentText,
      created_at: new Date().toISOString(),
    };

    onAddComment(newComment);
    setNewCommentText("");
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
      {/* Community badge — from the communities lookup in HomePage */}
      {communityName && (
        <span
          style={{
            fontSize: "11px",
            backgroundColor: "#e8e6ff",
            color: "#6c63ff",
            padding: "2px 8px",
            borderRadius: "99px",
            marginBottom: "6px",
            display: "inline-block",
          }}
        >
          # {communityName}
        </span>
      )}

      <p style={{ fontSize: "12px", color: "#999", margin: "6px 0 4px 0" }}>
        {post.is_anonymous ? "🕵️ Anonymous" : "👤 Community Member"} ·{" "}
        {formatDate(post.created_at)}
      </p>

      <p style={{ margin: "8px 0", fontSize: "15px" }}>{post.content}</p>

      {/* Upvote button — count derived from reactions array */}
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
        }}
      >
        ▲ Upvote {upvoteCount}
      </button>

      <hr style={{ margin: "12px 0", borderColor: "#eee" }} />

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