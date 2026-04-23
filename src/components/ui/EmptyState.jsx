// =============================================================================
// EmptyState.jsx
// Reusable empty-list placeholder used by HabitsPage, JournalPage,
// InboxPage, and ResourcesPage.
//
// Usage:
//   <EmptyState message="No habits yet. Ask an admin to add some!" />
//   <EmptyState icon="🌱" message="No posts." hint="Be the first to post!" />
// =============================================================================
import React from 'react';

export default function EmptyState({ icon, message, hint }) {
  if (icon) {
    return (
      <div className="neu-home-empty">
        <div className="neu-home-empty-icon">{icon}</div>
        <p className="neu-home-empty-msg">{message}</p>
        {hint && <p className="neu-home-empty-hint">{hint}</p>}
      </div>
    );
  }

  return <p className="empty-state">{message}</p>;
}