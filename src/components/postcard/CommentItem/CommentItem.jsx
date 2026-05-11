// =============================================================================
// CommentItem.jsx
// Single comment row with pill-style actions + inline reply box.
// Uses author?.photo_url to match PostCard.jsx convention.
// No new DB calls — onDelete and onReply are handled by the parent.
// =============================================================================
import React, { useState, useContext } from 'react';
import AppContext from '../../../AppContext';
import './CommentItem.css';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = [
  '#2E7D32', '#185FA5', '#0F6E56',
  '#854F0B', '#533AB7', '#993556', '#C62828',
];

function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Avatar — photo if available, initials fallback ────────────────────────────
function Avatar({ name, photoUrl, size = 'md', isAnon = false }) {
  const [imgError, setImgError] = useState(false);

  const bgColor  = isAnon ? '#888780' : avatarColor(name);
  const initials = isAnon ? 'AN' : getInitials(name);
  const showImg  = !isAnon && photoUrl && !imgError;

  return (
    <div
      className={`pc-avatar pc-avatar--${size}`}
      style={{ background: showImg ? 'transparent' : bgColor }}
      aria-hidden="true"
    >
      {showImg ? (
        <img
          src={photoUrl}
          alt={name}
          className="pc-avatar__img"
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function ThumbsUpIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? '#2E7D32' : 'none'}
      stroke={filled ? '#2E7D32' : 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ── CommentItem ───────────────────────────────────────────────────────────────
export default function CommentItem({
  comment,
  profiles,
  onDelete,
  onReply,
  isReply = false,
}) {
  const { currentUser } = useContext(AppContext);
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(comment.like_count ?? 0);
  const [showReply,  setShowReply]  = useState(false);
  const [replyInput, setReplyInput] = useState('');

  const author   = profiles?.find((p) => p.id === comment.author_id);
  const isAnon   = comment.is_anonymous;
  const name     = isAnon ? 'Anonymous' : (author?.display_name ?? 'Unknown');
  const photoUrl = isAnon ? null : (author?.photo_url ?? null);   // ← matches PostCard
  const isOwn    = currentUser?.id === comment.author_id;

  const currentName     = currentUser?.username || currentUser?.full_name || 'You';
  const currentPhotoUrl = currentUser?.photo_url ?? null;          // ← matches PostCard

  function toggleLike() {
    setLiked((prev) => !prev);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);
  }

  function handleReplySubmit() {
    const trimmed = replyInput.trim();
    if (!trimmed) return;
    onReply?.(trimmed, comment.id);
    setReplyInput('');
    setShowReply(false);
  }

  return (
    <div className={`pc-comment${isReply ? ' pc-comment--reply' : ''}`}>

      <Avatar
        name={name}
        photoUrl={photoUrl}
        size={isReply ? 'sm' : 'md'}
        isAnon={isAnon}
      />

      <div className="pc-comment__body">
        <div className="pc-comment__top">
          <span className="pc-comment__author">{name}</span>
          {isAnon && <span className="pc-comment__anon-badge">Anonymous</span>}
          <span className="pc-comment__time">{timeAgo(comment.created_at)}</span>
        </div>

        <p className="pc-comment__text">{comment.content}</p>

        <div className="pc-comment__actions">
          <button
            className={`pc-comment__pill pc-comment__pill--like${liked ? ' active' : ''}`}
            onClick={toggleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <ThumbsUpIcon filled={liked} />
            <span>{likeCount}</span>
          </button>

          {!isReply && (
            <button
              className={`pc-comment__pill pc-comment__pill--reply${showReply ? ' active' : ''}`}
              onClick={() => setShowReply((p) => !p)}
            >
              <ReplyIcon />
              Reply
            </button>
          )}

          {isOwn && (
            <button
              className="pc-comment__pill pc-comment__pill--delete"
              onClick={() => onDelete(comment.id)}
              aria-label="Delete comment"
            >
              <TrashIcon />
              Delete
            </button>
          )}
        </div>

        {showReply && (
          <div className="pc-comment__reply-box">
            <Avatar
              name={currentName}
              photoUrl={currentPhotoUrl}
              size="sm"
            />
            <input
              className="pc-comment__reply-input"
              type="text"
              placeholder={`Reply to ${name}…`}
              value={replyInput}
              autoFocus
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
            />
            <button
              className="pc-comment__reply-post"
              onClick={handleReplySubmit}
              disabled={!replyInput.trim()}
            >
              Post
            </button>
            <button
              className="pc-comment__reply-cancel"
              onClick={() => { setShowReply(false); setReplyInput(''); }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}