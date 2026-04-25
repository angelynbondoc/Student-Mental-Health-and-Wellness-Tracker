// =============================================================================
// PostContentField.jsx
// Textarea for the post body with its label.
// =============================================================================
import React from 'react';

export default function PostContentField({ value, onChange }) {
  return (
    <>
      <label className="field-label" htmlFor="post-content">
        Your Post <span className="req">*</span>
      </label>
      <textarea
        id="post-content"
        className="field-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your thoughts, ask a question, or offer support..."
        rows={5}
      />
    </>
  );
}