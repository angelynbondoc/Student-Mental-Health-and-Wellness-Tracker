// =============================================================================
// PostCard.jsx
// Feature 9 (Share) + RESTORED Comment logic — both live here together.
//
// ORAL DEFENSE — WHAT THIS FILE HANDLES:
//   • Reactions   — toggle upvote; enforces unique post_id + user_id
//   • Comments    — inline form pushes to global comments array; list filtered
//                   by post_id (mirrors SELECT * FROM comments WHERE post_id=?)
//   • Share       — SECI Combination: creates a new post record prepended with
//                   "[Shared Post]:" so redistributed content is clearly marked
// =============================================================================
import React, { useContext, useState } from 'react';
import AppContext from '../AppContext';
import { generateUUID } from '../Mockdata';

export default function PostCard({ post }) {
  const {
    currentUser,
    profiles,
    communities,
    posts,     setPosts,
    comments,  setComments,   // ← needed for comment feature
    reactions, setReactions,
  } = useContext(AppContext);

  // Local UI state
  const [showConfirm,   setShowConfirm]   = useState(false); // share confirmation
  const [commentInput,  setCommentInput]  = useState('');    // controlled input
  const [showComments,  setShowComments]  = useState(false); // toggle comment section

  // ── Resolve author display name (respects is_anonymous) ──────────────────
  const author      = profiles.find((p) => p.id === post.author_id);
  const displayName = post.is_anonymous
    ? 'Anonymous'
    : (author?.display_name ?? 'Unknown');

  const community = communities.find((c) => c.id === post.community_id);

  // ── Reactions ─────────────────────────────────────────────────────────────
  const postReactions = reactions.filter((r) => r.post_id === post.id);
  const upvoteCount   = postReactions.filter((r) => r.type === 'upvote').length;
  const myReaction    = postReactions.find((r) => r.user_id === currentUser.id);

  const handleReaction = () => {
    if (myReaction) {
      // Toggle off: remove the reaction row
      setReactions((prev) => prev.filter((r) => r.id !== myReaction.id));
    } else {
      // Toggle on: insert a new reaction — unique post_id + user_id enforced
      setReactions((prev) => [
        ...prev,
        {
          id:         generateUUID(),
          post_id:    post.id,
          user_id:    currentUser.id,
          type:       'upvote',
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  // ── Comments ───────────────────────────────────────────────────────────────
  // Filter the global comments array for this post only.
  // SQL equivalent: SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC
  const postComments = comments
    .filter((c) => c.post_id === post.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Submit handler: build a new comment object matching the DB schema exactly,
  // then append it to the global comments array via setComments.
  // SQL equivalent: INSERT INTO comments (id, post_id, author_id, content, created_at)
  const handleAddComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return; // Don't allow blank comments

    const newComment = {
      id:         generateUUID(),    // Simulates DB auto-generated UUID
      post_id:    post.id,           // Foreign key → links comment to this post
      author_id:  currentUser.id,    // Foreign key → links comment to the author
      content:    trimmed,
      created_at: new Date().toISOString(),
    };

    // Spread existing comments + append new one (immutability pattern)
    setComments((prev) => [...prev, newComment]);
    setCommentInput(''); // Clear the input after submitting
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  // ORAL DEFENSE — SECI Combination:
  //   No 'shares' table in schema → simulate redistribution by inserting a
  //   NEW POST. Prepending "[Shared Post]:" marks it as redistributed
  //   knowledge, not original content. The sharer becomes the new author_id.
  const handleShare = () => {
    const sharedPost = {
      id:           generateUUID(),
      author_id:    currentUser.id,                       // Sharer becomes new author
      community_id: post.community_id,                    // Stays in same community
      content:      `[Shared Post]: ${post.content}`,    // Marks redistributed content
      is_anonymous: false,                                // Shares are always attributed
      is_flagged:   false,
      created_at:   new Date().toISOString(),
    };
    setPosts((prev) => [sharedPost, ...prev]); // Prepend → appears at top of feed
    setShowConfirm(false);
  };

  // Guard: prevent sharing an already-shared post (stops infinite share chains)
  const isAlreadyShared = post.content.startsWith('[Shared Post]:');

  return (
    <div style={styles.card}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={styles.authorName}>{displayName}</p>
          <p style={styles.meta}>
            {community?.name ?? 'Community'} ·{' '}
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
        {isAlreadyShared && (
          <span style={styles.sharedBadge}>🔁 Shared</span>
        )}
      </div>

      {/* ── POST CONTENT ───────────────────────────────────────────────────── */}
      <p style={styles.content}>{post.content}</p>

      {/* ── ACTION BAR ─────────────────────────────────────────────────────── */}
      <div style={styles.actions}>
        {/* Upvote — active state when currentUser has already reacted */}
        <button
          style={{ ...styles.actionBtn, ...(myReaction ? styles.activeBtn : {}) }}
          onClick={handleReaction}
        >
          👍 {upvoteCount}
        </button>

        {/* Comment toggle — shows count and expands/collapses section */}
        <button
          style={{ ...styles.actionBtn, ...(showComments ? styles.activeBtn : {}) }}
          onClick={() => setShowComments((v) => !v)}
        >
          💬 {postComments.length}
        </button>

        {/* Share — hidden on already-shared posts */}
        {!isAlreadyShared && (
          <button style={styles.actionBtn} onClick={() => setShowConfirm(true)}>
            🔁 Share
          </button>
        )}
      </div>

      {/* ── SHARE CONFIRMATION ─────────────────────────────────────────────── */}
      {showConfirm && (
        <div style={styles.confirmBox}>
          <p style={styles.confirmText}>
            Share this post to your community feed?
          </p>
          <div style={styles.confirmRow}>
            <button style={styles.confirmBtn} onClick={handleShare}>
              Yes, Share
            </button>
            <button
              style={{ ...styles.confirmBtn, ...styles.cancelBtn }}
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
          COMMENT SECTION
          Shown / hidden by the 💬 button above.
          - Renders existing comments filtered by post_id
          - Input form at the bottom pushes to global comments array
          ================================================================ */}
      {showComments && (
        <div style={styles.commentSection}>

          {/* ── Existing comments list ──────────────────────────────────── */}
          {postComments.length === 0 && (
            <p style={styles.noComments}>No comments yet. Be the first!</p>
          )}

          {postComments.map((comment) => {
            // Resolve commenter's display name from global profiles
            const commenter = profiles.find((p) => p.id === comment.author_id);
            return (
              <div key={comment.id} style={styles.commentItem}>
                <div style={styles.commentAvatar}>
                  {(commenter?.display_name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div style={styles.commentBody}>
                  <span style={styles.commentAuthor}>
                    {commenter?.display_name ?? 'Unknown'}
                  </span>
                  <p style={styles.commentText}>{comment.content}</p>
                  <p style={styles.commentTime}>
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}

          {/* ── Add comment form ────────────────────────────────────────── */}
          {/* ORAL DEFENSE: Submitting creates an object matching the DB
              schema (id, post_id, author_id, content, created_at) and
              appends it to the global comments array via setComments.     */}
          <div style={styles.commentInputRow}>
            <input
              style={styles.commentInput}
              type="text"
              placeholder="Write a comment…"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              // Allow Enter key to submit for better UX
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button style={styles.commentSubmitBtn} onClick={handleAddComment}>
              Post
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const styles = {
  card: {
    background: '#fff', borderRadius: 16, padding: '16px',
    marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  },
  header:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 15,
  },
  authorName:  { fontSize: 14, fontWeight: 700, margin: 0 },
  meta:        { fontSize: 11, color: '#9ca3af', margin: 0 },
  sharedBadge: {
    marginLeft: 'auto', fontSize: 11, fontWeight: 600,
    color: '#6366f1', background: '#ede9fe', padding: '3px 8px', borderRadius: 20,
  },
  content:  { fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '8px 0 12px' },
  actions:  { display: 'flex', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    padding: '6px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb',
    background: '#f9fafb', fontSize: 13, cursor: 'pointer',
    color: '#555', fontWeight: 500,
  },
  activeBtn: { background: '#ede9fe', borderColor: '#6366f1', color: '#6366f1' },

  // Share confirmation
  confirmBox: {
    marginTop: 12, padding: '12px 14px', borderRadius: 12,
    background: '#f0f9ff', border: '1.5px solid #bae6fd',
  },
  confirmText: { fontSize: 13, color: '#0369a1', margin: '0 0 10px', fontWeight: 500 },
  confirmRow:  { display: 'flex', gap: 8 },
  confirmBtn: {
    flex: 1, padding: '8px', borderRadius: 10, border: 'none',
    background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
  cancelBtn: { background: '#e5e7eb', color: '#374151' },

  // Comment section
  commentSection: {
    marginTop: 14, paddingTop: 14,
    borderTop: '1px solid #f3f4f6',   // Visual separator from the action bar
  },
  noComments: { fontSize: 12, color: '#9ca3af', margin: '0 0 10px' },
  commentItem: {
    display: 'flex', gap: 8, marginBottom: 10,
  },
  commentAvatar: {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 11,
  },
  commentBody:   { flex: 1 },
  commentAuthor: { fontSize: 12, fontWeight: 700, color: '#111827' },
  commentText:   { fontSize: 13, color: '#374151', margin: '2px 0 2px' },
  commentTime:   { fontSize: 10, color: '#9ca3af' },

  // Comment input form
  commentInputRow: {
    display: 'flex', gap: 8, marginTop: 10,
  },
  commentInput: {
    flex: 1, padding: '9px 14px', borderRadius: 20,
    border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none',
    background: '#f9fafb',
  },
  commentSubmitBtn: {
    padding: '9px 16px', borderRadius: 20, border: 'none',
    background: '#6366f1', color: '#fff',
    fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
};