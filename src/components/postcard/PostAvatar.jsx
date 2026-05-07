// =============================================================================
// PostAvatar.jsx
// Shared avatar circle used in both the post header and comment list.
// =============================================================================
import React from 'react';

export default function PostAvatar({ name, small = false }) {
  return (
    <div className={`pc-avatar${small ? ' pc-avatar--sm' : ''}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}