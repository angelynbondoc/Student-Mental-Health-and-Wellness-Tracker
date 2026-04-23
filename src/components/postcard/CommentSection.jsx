// =============================================================================
// ShareConfirm.jsx
// Confirmation box shown when the user clicks the Share button.
// SECI Combination: redistribution creates a new post record — no separate
// 'shares' table needed. The sharer becomes the new author_id.
// =============================================================================
import React from 'react';

export default function ShareConfirm({ onConfirm, onCancel }) {
  return (
    <div className="pc-confirm">
      <p className="pc-confirm__text">Share this post to your community feed?</p>
      <div className="pc-confirm__row">
        <button className="pc-confirm__btn" onClick={onConfirm}>
          Yes, Share
        </button>
        <button
          className="pc-confirm__btn pc-confirm__btn--cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}