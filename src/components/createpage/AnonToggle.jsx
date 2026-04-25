// =============================================================================
// AnonToggle.jsx
// Checkbox row + conditional notice for anonymous posting.
// =============================================================================
import React from 'react';

export default function AnonToggle({ checked, onChange }) {
  return (
    <>
      <label className="cp-anon-row">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="cp-anon-row__label">Post anonymously</span>
      </label>

      {checked && (
        <p className="notice--gold">
          🔒 Your name will be hidden. Only "Anonymous" will be shown.
        </p>
      )}
    </>
  );
}