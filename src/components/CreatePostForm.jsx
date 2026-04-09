import { useState } from "react";

// ============================================================
// COMPONENT: CreatePostForm
// SECI CONNECTION — EXTERNALIZATION:
//   This is the most important SECI touchpoint in the app.
//   Externalization = converting TACIT knowledge (inner feelings,
//   personal struggles) into EXPLICIT knowledge (written text
//   that others can read, learn from, and engage with).
//   The act of writing a post IS the KM process in action.
//
// PROPS:
//   - onPostSubmit: a callback function passed in by the parent
//     page (CreatePage). When the form submits, it calls this
//     function with the new post object, so the parent can add
//     it to the shared posts list. This is called "lifting state up"
//     — child components don't manage shared data; they report
//     changes upward to the parent.
// ============================================================

function CreatePostForm({ onPostSubmit }) {
  // Controlled state for the textarea — every keystroke updates this
  const [content, setContent] = useState("");

  // Controlled state for the checkbox — true = post anonymously
  const [isAnonymous, setIsAnonymous] = useState(false);

  // UI state: show a success message after submitting
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Guard: Prevent submitting blank posts
    if (!content.trim()) {
      alert("Please write something before posting.");
      return;
    }

    // Build the new post object — STRICTLY following the 'posts' Data Contract.
    // Every key here matches a column in the posts DB table.
    const newPost = {
      id: crypto.randomUUID(),        // Simulates Supabase auto-UUID
      author_id: "user-uuid-current", // Placeholder — will be auth.user.id later
      content: content,               // From textarea
      is_anonymous: isAnonymous,      // From checkbox
      upvotes: 0,                     // New posts start at 0 upvotes
      created_at: new Date().toISOString(),
    };

    // "Lift state up" — pass the new post to the parent component.
    // The parent (HomePage via CreatePage) will add it to the posts list.
    onPostSubmit(newPost);

    // Reset form fields to empty state after submission
    setContent("");
    setIsAnonymous(false);

    // Show a temporary success message
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000); // Hide after 3 seconds
  };

  return (
    <div>
      <h2>📝 Share How You Feel</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Your story could be exactly what someone else needs to hear today.
      </p>

      {/* Textarea — controlled input bound to 'content' state */}
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

      {/* Submit Button */}
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

      {/* Success feedback message — only shown for 3 seconds post-submit */}
      {submitted && (
        <p style={{ color: "green", marginTop: "10px", textAlign: "center" }}>
          ✅ Your post has been shared. Thank you for your courage.
        </p>
      )}
    </div>
  );
}

export default CreatePostForm;