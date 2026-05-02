// =============================================================================
// CommentItem.jsx
// Single comment row: avatar + author name + text + timestamp.
// =============================================================================
import React, { useContext } from 'react';
import PostAvatar from './PostAvatar';
import AppContext from '../../AppContext';

export default function CommentItem({ comment, profiles, onDelete }) {
  const { currentUser } = useContext(AppContext);
  const author = profiles.find((p) => p.id === comment.author_id);
  const isAnon = comment.is_anonymous;
  const name   = isAnon ? 'Anonymous' : (author?.display_name ?? 'Unknown');
  const isOwn  = currentUser?.id === comment.author_id;

  return (
    <div className="pc-comment">
      <PostAvatar name={isAnon ? 'A' : name} small />
      <div className="pc-comment__body">
        <span className="pc-comment__author">{name}</span>
        <p className="pc-comment__text">{comment.content}</p>
        <p className="pc-comment__time">
          {new Date(comment.created_at).toLocaleString()}
        </p>
      </div>
      {isOwn && (
        <button className="pc-comment__delete" onClick={() => onDelete(comment.id)}>
          🗑
        </button>
      )}
    </div>
  );
}