// ============================================================
// COMPONENT: CommentItem — Presentational only, no state.
// SECI CONNECTION — SOCIALIZATION:
//   Peer-to-peer replies are tacit knowledge passed directly
//   from one person to another who needs it.
// ============================================================

function CommentItem({ comment }) {
  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const style = {
    backgroundColor: "#f0eeff",
    borderLeft: "3px solid #6c63ff",
    padding: "8px 10px",
    marginTop: "8px",
    borderRadius: "4px",
    fontSize: "14px",
  };

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