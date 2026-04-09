// ============================================================
// COMPONENT: CommentItem
// A pure "presentational" component — it receives one comment
// object as a prop and renders it. It has NO state of its own.
//
// WHY SEPARATE FROM PostCard:
//   Separation of Concerns. PostCard manages the LOGIC (adding
//   comments, upvoting). CommentItem only handles the DISPLAY
//   of a single comment. This makes both easier to maintain,
//   test, and hand off to the UI/UX designer later.
//
// SECI CONNECTION — SOCIALIZATION:
//   Comments are peer-to-peer knowledge sharing. One person's
//   tacit experience (emotional support, lived advice) is
//   transmitted directly to someone who needs it.
// ============================================================

function CommentItem({ comment }) {
  const style = {
    backgroundColor: "#f0eeff",
    borderLeft: "3px solid #6c63ff",
    padding: "8px 10px",
    marginTop: "8px",
    borderRadius: "4px",
    fontSize: "14px",
  };

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div style={style}>
      <p style={{ margin: "0 0 4px 0" }}>{comment.content}</p>
      <span style={{ fontSize: "11px", color: "#999" }}>
        {formatDate(comment.created_at)}
      </span>
    </div>
  );
}

export default CommentItem;