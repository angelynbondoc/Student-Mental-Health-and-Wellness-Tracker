// =============================================================================
// usePostCard.js
// Custom hook — encapsulates all reaction, comment, and share logic for a post.
// Keeps PostCard.jsx a pure orchestrator with zero business logic.
// =============================================================================
import { useState, useContext } from 'react';
import AppContext from '../../AppContext';
import { generateUUID } from '../../Mockdata';

export default function usePostCard(post) {
  const {
    currentUser,
    posts,     setPosts,
    comments,  setComments,
    reactions, setReactions,
  } = useContext(AppContext);

  const [showConfirm,  setShowConfirm]  = useState(false);
  const [showComments, setShowComments] = useState(false);

  // ── Reactions ──────────────────────────────────────────────────────────────
  const postReactions = reactions.filter((r) => r.post_id === post.id);
  const upvoteCount   = postReactions.filter((r) => r.type === 'upvote').length;
  const myReaction    = postReactions.find((r) => r.user_id === currentUser.id);

  const handleReaction = () => {
    if (myReaction) {
      // Toggle off: remove the reaction row
      // SQL: DELETE FROM reactions WHERE id = ?
      setReactions((prev) => prev.filter((r) => r.id !== myReaction.id));
    } else {
      // Toggle on: insert a new reaction — unique post_id + user_id enforced
      // SQL: INSERT INTO reactions (id, post_id, user_id, type, created_at) VALUES (...)
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
  const commentCount = comments.filter((c) => c.post_id === post.id).length;

  const handleAddComment = (content) => {
    // SQL: INSERT INTO comments (id, post_id, author_id, content, created_at) VALUES (...)
    setComments((prev) => [
      ...prev,
      {
        id:         generateUUID(),
        post_id:    post.id,
        author_id:  currentUser.id,
        content,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  // SECI Combination: no 'shares' table — redistribution creates a new post.
  // Prepending "[Shared Post]:" marks redistributed content clearly.
  // SQL: INSERT INTO posts (id, author_id, community_id, content, ...) VALUES (...)
  const handleShare = () => {
    setPosts((prev) => [
      {
        id:           generateUUID(),
        author_id:    currentUser.id,
        community_id: post.community_id,
        content:      `[Shared Post]: ${post.content}`,
        is_anonymous: false,
        is_flagged:   false,
        created_at:   new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowConfirm(false);
  };

  return {
    // Derived state
    upvoteCount,
    commentCount,
    hasReacted:   Boolean(myReaction),
    showConfirm,
    showComments,
    // Handlers
    handleReaction,
    handleAddComment,
    handleShare,
    setShowConfirm,
    setShowComments,
  };
}