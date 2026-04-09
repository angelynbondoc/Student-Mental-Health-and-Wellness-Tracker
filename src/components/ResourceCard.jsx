// ============================================================
// COMPONENT: ResourceCard — Presentational only, no state.
// SECI CONNECTION — COMBINATION:
//   Curated coping strategies from multiple sources merged
//   into one organized reference. Combination = aggregating
//   explicit knowledge into new structured knowledge.
// ============================================================

function ResourceCard({ resource }) {
  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "14px",
    backgroundColor: "#f0fff4",
    borderLeft: "4px solid #28a745",
  };

  return (
    <div style={cardStyle}>
      <span
        style={{
          fontSize: "11px",
          backgroundColor: "#28a745",
          color: "#fff",
          padding: "2px 8px",
          borderRadius: "99px",
        }}
      >
        {resource.category}
      </span>
      <h3 style={{ margin: "8px 0 6px 0", fontSize: "16px" }}>{resource.title}</h3>
      <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>{resource.description}</p>
    </div>
  );
}

export default ResourceCard;