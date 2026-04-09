// ============================================================
// COMPONENT: JournalEntryCard — Presentational only, no state.
// SECI CONNECTION — INTERNALIZATION:
//   Users reflect on past entries to absorb patterns in their
//   own mental health over time. Reading your own writing IS
//   the knowledge internalization process.
// ============================================================

function JournalEntryCard({ entry }) {
  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "14px",
    backgroundColor: "#fffef7",
    borderLeft: "4px solid #ffc107",
  };

  return (
    <div style={cardStyle}>
      <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 6px 0" }}>
        📅 {formatDate(entry.created_at)}
      </p>
      <p style={{ fontSize: "13px", fontStyle: "italic", color: "#888", margin: "0 0 8px 0" }}>
        Prompt: "{entry.prompt_answered}"
      </p>
      <p style={{ fontSize: "15px", margin: 0 }}>{entry.entry_text}</p>
    </div>
  );
}

export default JournalEntryCard;