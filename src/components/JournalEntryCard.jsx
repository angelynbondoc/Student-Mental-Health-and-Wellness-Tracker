// ============================================================
// COMPONENT: JournalEntryCard
// SECI CONNECTION — INTERNALIZATION:
//   Internalization = converting explicit knowledge back into
//   tacit knowledge through personal reflection and experience.
//   The journal is where users read their own past entries and
//   absorb patterns in their own mental health over time.
//   "Learning by reflecting" is the KM process here.
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
      {/* Render the prompt that was answered — from 'prompt_answered' schema key */}
      <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 6px 0" }}>
        📅 {formatDate(entry.created_at)}
      </p>
      <p style={{ fontSize: "13px", fontStyle: "italic", color: "#888", margin: "0 0 8px 0" }}>
        Prompt: "{entry.prompt_answered}"
      </p>
      {/* The actual journal entry — from 'entry_text' schema key */}
      <p style={{ fontSize: "15px", margin: 0 }}>{entry.entry_text}</p>
    </div>
  );
}

export default JournalEntryCard;