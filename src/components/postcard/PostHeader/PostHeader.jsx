// =============================================================================
// PostHeader.jsx
// Updated: author name and avatar are now clickable → navigates to
// /profile/:authorId so the user sees the full UserProfilePage.
// Props unchanged except we now receive authorId (the raw UUID).
// =============================================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PostHeader.css'; // your existing file — no changes needed there

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(isoString) {
  // Append Z to tell JavaScript this is UTC, not local time
  const utcString = isoString.endsWith('Z') ? isoString : isoString + 'Z';
  const diff = (Date.now() - new Date(utcString)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PostHeader({
  authorId,        // ← NEW: raw user UUID (pass from PostCard)
  displayName,
  communityName,
  createdAt,
  isShared,
  avatarUrl,       // ← optional: pass profile.avatar_url from PostCard
}) {
  const navigate = useNavigate();

  // Anonymous posts must not link to a profile
  const isClickable = displayName !== 'Anonymous' && Boolean(authorId);

  function handleAuthorClick(e) {
    if (!isClickable) return;
    e.stopPropagation(); // prevent outer card clicks from interfering
    navigate(`/profile/${authorId}`);
  }

  const initials = getInitials(displayName);

  return (
    <div className="ph-wrapper">
      {/* ── avatar ── */}
      <button
        className={`ph-avatar-btn ${!isClickable ? 'ph-avatar-btn--static' : ''}`}
        onClick={handleAuthorClick}
        aria-label={isClickable ? `View ${displayName}'s profile` : undefined}
        disabled={!isClickable}
      >
        {avatarUrl ? (
          <img className="ph-avatar-img" src={avatarUrl} alt={displayName} />
        ) : (
          <span className="ph-avatar-initials">{initials}</span>
        )}
      </button>

      {/* ── meta ── */}
      <div className="ph-meta">
        <div className="ph-top-row">
          <button
            className={`ph-author-name ${!isClickable ? 'ph-author-name--static' : ''}`}
            onClick={handleAuthorClick}
            disabled={!isClickable}
          >
            {displayName}
          </button>

          {isShared && (
            <span className="ph-shared-badge">Shared</span>
          )}
        </div>

        <p className="ph-sub">
          <span className="ph-community">{communityName}</span>
          <span className="ph-dot" aria-hidden="true">·</span>
          <time className="ph-time" dateTime={createdAt}>
            {timeAgo(createdAt)}
          </time>
        </p>
      </div>
    </div>
  );
}