import { useState } from "react";

// ============================================================
// COMPONENT: CreatePostForm
// SECI CONNECTION — EXTERNALIZATION:
//   Writing a post converts tacit knowledge (inner feelings)
//   into explicit knowledge (text others can read and learn
//   from). The act of typing IS the KM process in action.
//
// PROPS:
//   - onPostSubmit: callback to App.jsx to add the new post
//   - communities: array used to populate the community picker
//   - currentUserId: the logged-in user's ID for author_id
//
// NEW IN THIS REFACTOR:
//   - community_id: user selects a community before posting
//   - is_flagged: defaults to false on all new posts
//   - author_id: now included using currentUserId prop
// ============================================================

function CreatePostForm({ onPostSubmit, communities = [], currentUserId }) {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Controlled state for the community dropdown.
  // Default to the first community if available.
  const [selectedCommunityId, setSelectedCommunityId] = useState(
    communities[0]?.id || ""
  );

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("Please write something before posting.");
      return;
    }
    if (!selectedCommunityId) {
      alert("Please select a community.");
      return;
    }

    // Build post object strictly following the updated Data Contract.
    // No 'upvotes' field — votes now live in the reactions table.
    const newPost = {
      id: crypto.randomUUID(),
      author_id: currentUserId,
      community_id: selectedCommunityId,   // ← NEW: from dropdown
      content: content,
      is_anonymous: isAnonymous,
      is_flagged: false,                   // ← NEW: always false on creation
      created_at: new Date().toISOString(),
    };

    onPostSubmit(newPost); // Lift up to App.jsx
    setContent("");
    setIsAnonymous(false);
    setSelectedCommunityId(communities[0]?.id || "");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div>
      <h2>📝 Share How You Feel</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Your story could be exactly what someone else needs to hear today.
      </p>

      {/* Community Picker — NEW */}
      <label style={{ fontSize: "14px", display: "block", marginBottom: "6px" }}>
        Post to Community:
      </label>
      <select
        value={selectedCommunityId}
        onChange={(e) => setSelectedCommunityId(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "12px",
          fontSize: "14px",
        }}
      >
        {communities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Post Content Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share a feeling, a coping tip, or a daily win..."
        rows={6}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "15px",
          boxSizing: "border-box",
          resize: "vertical",
        }}
      />

      {/* Anonymous Checkbox */}
      <div style={{ margin: "10px 0", display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          id="anonCheck"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        <label htmlFor="anonCheck" style={{ fontSize: "14px" }}>
          🕵️ Post Anonymously
        </label>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#6c63ff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Post to Community
      </button>

      {submitted && (
        <p style={{ color: "green", marginTop: "10px", textAlign: "center" }}>
          ✅ Your post has been shared. Thank you for your courage.
        </p>
      )}
    </div>
  );
}

export default CreatePostForm;