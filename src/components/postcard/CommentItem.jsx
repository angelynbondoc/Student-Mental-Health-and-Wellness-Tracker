// =============================================================================
// CommentItem.jsx
// Single comment row: avatar + author name + text + timestamp.
// =============================================================================
import React from 'react';
import PostAvatar from './PostAvatar';

export default function CommentItem({ comment, profiles }) {
  const author = profiles.find((p) => p.id === comment.author_id);
  const name   = author?.display_name ?? 'Unknown';

  return (
    <div className="pc-comment">
      <PostAvatar name={name} small />
      <div className="pc-comment__body">
        <span className="pc-comment__author">{name}</span>
        <p className="pc-comment__text">{comment.content}</p>
        <p className="pc-comment__time">
          {new Date(comment.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}