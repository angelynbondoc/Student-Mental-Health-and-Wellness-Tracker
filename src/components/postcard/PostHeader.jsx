// =============================================================================
// PostHeader.jsx
// Avatar + author name + community meta + optional "Shared" badge.
// =============================================================================
import React from 'react';
import PostAvatar from './PostAvatar';

export default function PostHeader({ displayName, communityName, createdAt, isShared }) {
  return (
    <div className="pc-header">
      <PostAvatar name={displayName} />
      <div>
        <p className="pc-author">{displayName}</p>
        <p className="pc-meta">
          {communityName} · {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
      {isShared && <span className="pc-shared-badge">🔁 Shared</span>}
    </div>
  );
}