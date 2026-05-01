// =============================================================================
// CommentSection.jsx
// Fetches comments for a post from Supabase, renders list + input form.
// =============================================================================
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import CommentItem from './CommentItem';

export default function CommentSection({ postId, profiles, onAddComment }) {
  const [comments, setComments]   = useState([]);
  const [input,    setInput]      = useState('');
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    async function fetchComments() {
      const { data } = await supabase
        .from('comments')
        .select('id, post_id, author_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      setComments(data ?? []);
      setLoading(false);
    }
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await onAddComment(trimmed); // insert, fully awaited
    // re-fetch after confirmed insert — no race condition since insert is done
    const { data } = await supabase
      .from('comments')
      .select('id, post_id, author_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data ?? []);
  };

  return (
    <div className="pc-comments">
      {loading && <p className="pc-comments__empty">Loading…</p>}

      {!loading && comments.length === 0 && (
        <p className="pc-comments__empty">No comments yet. Be the first!</p>
      )}

      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          profiles={profiles}
        />
      ))}

      <div className="pc-comments__input-row">
        <input
          className="pc-comments__input"
          type="text"
          placeholder="Write a comment…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button className="pc-comments__submit" onClick={handleSubmit}>
          Post
        </button>
      </div>
    </div>
  );
}