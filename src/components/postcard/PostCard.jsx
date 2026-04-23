// =============================================================================
// PostCard.jsx
// Lean orchestrator — composes sub-components, delegates all logic to
// usePostCard. No business logic or styles live here.
// =============================================================================
import React, { useContext } from 'react';
import AppContext from '../../AppContext';
import usePostCard from './usePostCard';
import PostHeader from './PostHeader';
import ActionBar from './ActionBar';
import ShareConfirm from './ShareConfirm';
import CommentSection from './CommentSection';
import './PostCard.css';

export default function PostCard({ post }) {
  const { profiles, communities, comments } = useContext(AppContext);

  // Derived display values
  const author      = profiles.find((p) => p.id === post.author_id);
  const displayName = post.is_anonymous ? 'Anonymous' : (author?.display_name ?? 'Unknown');
  const community   = communities.find((c) => c.id === post.community_id);
  const isShared    = post.content.startsWith('[Shared Post]:');

  const {
    upvoteCount,
    commentCount,
    hasReacted,
    showConfirm,
    showComments,
    handleReaction,
    handleAddComment,
    handleShare,
    setShowConfirm,
    setShowComments,
  } = usePostCard(post);

  return (
    <div className="pc-card">

      <PostHeader
        displayName={displayName}
        communityName={community?.name ?? 'Community'}
        createdAt={post.created_at}
        isShared={isShared}
      />

      <p className="pc-body">{post.content}</p>

      <ActionBar
        upvoteCount={upvoteCount}
        commentCount={commentCount}
        hasReacted={hasReacted}
        showComments={showComments}
        isShared={isShared}
        onReact={handleReaction}
        onToggleComments={() => setShowComments((v) => !v)}
        onShare={() => setShowConfirm(true)}
      />

      {showConfirm && (
        <ShareConfirm
          onConfirm={handleShare}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showComments && (
        <CommentSection
          postId={post.id}
          comments={comments}
          profiles={profiles}
          onAddComment={handleAddComment}
        />
      )}

    </div>
  );
}