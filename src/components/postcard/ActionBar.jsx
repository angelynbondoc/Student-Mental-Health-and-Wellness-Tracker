// =============================================================================
// ActionBar.jsx
// Upvote, comment toggle, and share buttons for a post.
// =============================================================================
import React from 'react';
import { ThumbsUp, MessageCircle, Repeat2 } from 'lucide-react';

export default function ActionBar({
  upvoteCount,
  commentCount,
  hasReacted,
  showComments,
  isShared,
  onReact,
  onToggleComments,
  onShare,
}) {
  return (
    <div className="pc-actions">
      <button
        className={`pc-btn${hasReacted ? ' pc-btn--active' : ''}`}
        onClick={onReact}
      >
        <ThumbsUp size={14} strokeWidth={2} />
        {upvoteCount}
      </button>

      <button
        className={`pc-btn${showComments ? ' pc-btn--active' : ''}`}
        onClick={onToggleComments}
      >
        <MessageCircle size={14} strokeWidth={2} />
        {commentCount}
      </button>

      <button className="pc-btn" onClick={onShare}>
        <Repeat2 size={14} strokeWidth={2} />
        Share
      </button>
    </div>
  );
}