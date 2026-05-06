// =============================================================================
// CommentSection.jsx
// Keeps all existing Supabase calls untouched.
// Adds local state for nested replies (frontend only for now).
// Shows photo_url for current user avatar, falls back to initials.
// Shows 'AN' initials on gray when posting as anonymous.
// =============================================================================
import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../../supabase';
import AppContext from '../../../AppContext';
import CommentItem from '../CommentItem/CommentItem';
import './CommentSection.css';

// ── Small avatar used in the input row ───────────────────────────────────────
function InputAvatar({ photoUrl, initials, isAnonymous }) {
  const [imgError, setImgError] = useState(false);
  const showImg = !isAnonymous && photoUrl && !imgError;

  return (
    <div
      className="cs-user-avatar"
      style={{ background: showImg ? 'transparent' : (isAnonymous ? '#888780' : '#2E7D32') }}
      aria-hidden="true"
    >
      {showImg ? (
        <img
          src={photoUrl}
          alt="You"
          className="cs-user-avatar__img"
          onError={() => setImgError(true)}
        />
      ) : (
        isAnonymous ? 'AN' : initials
      )}
    </div>
  );
}

export default function CommentSection({ postId, profiles, onAddComment }) {
  const { currentUser } = useContext(AppContext);

  const [comments,     setComments]    = useState([]);
  const [input,        setInput]       = useState('');
  const [loading,      setLoading]     = useState(true);
  const [isAnonymous,  setIsAnonymous] = useState(false);
  const [submitting,   setSubmitting]  = useState(false);

  // Local-only replies stored as { parentId: [ replyObj, ... ] }
  const [localReplies, setLocalReplies] = useState({});

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      const { data } = await supabase
        .from('comments')
        .select('id, post_id, author_id, content, created_at, is_anonymous')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      setComments(data ?? []);
      setLoading(false);
    }
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setInput('');
    await onAddComment(trimmed, isAnonymous);
    const { data } = await supabase
      .from('comments')
      .select('id, post_id, author_id, content, created_at, is_anonymous')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data ?? []);
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setLocalReplies((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
    }
  };

  // ── Local-only reply handler (no DB yet) ──────────────────────────────────
  const handleReply = (content, parentId) => {
    const newReply = {
      id:           `local-${Date.now()}`,
      author_id:    currentUser?.id,
      content,
      created_at:   new Date().toISOString(),
      is_anonymous: isAnonymous,
      parent_id:    parentId,
      like_count:   0,
    };
    setLocalReplies((prev) => ({
      ...prev,
      [parentId]: [...(prev[parentId] ?? []), newReply],
    }));
  };

  const handleDeleteReply = (replyId, parentId) => {
    setLocalReplies((prev) => ({
      ...prev,
      [parentId]: (prev[parentId] ?? []).filter((r) => r.id !== replyId),
    }));
  };

  // ── Current user display info ─────────────────────────────────────────────
  const displayName = currentUser?.username || currentUser?.full_name || 'You';
  const initials    = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const photoUrl = currentUser?.photo_url ?? null;

  return (
    <div className="cs-root">
      <hr className="cs-divider" />

      {loading && <p className="cs-loading">Loading comments…</p>}

      {!loading && (
        <p className="cs-count">
          {comments.length === 0
            ? 'No comments yet. Be the first!'
            : `${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {!loading && comments.length > 0 && (
        <div className="cs-list">
          {comments.map((c) => (
            <React.Fragment key={c.id}>
              <CommentItem
                comment={c}
                profiles={profiles}
                onDelete={handleDelete}
                onReply={handleReply}
              />
              {(localReplies[c.id] ?? []).map((r) => (
                <CommentItem
                  key={r.id}
                  comment={r}
                  profiles={profiles}
                  onDelete={(id) => handleDeleteReply(id, c.id)}
                  isReply
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="cs-input-area">
        <div className="cs-anon-row">
          <input
            type="checkbox"
            id={`anon-${postId}`}
            className="cs-anon-check"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <label htmlFor={`anon-${postId}`} className="cs-anon-label">
            Post as anonymous
          </label>
        </div>

        <div className="cs-input-row">
          <InputAvatar
            photoUrl={photoUrl}
            initials={initials}
            isAnonymous={isAnonymous}
          />

          <input
            className="cs-input"
            type="text"
            placeholder="Write a comment…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={submitting}
          />

          <button
            className="cs-post-btn"
            onClick={handleSubmit}
            disabled={!input.trim() || submitting}
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}