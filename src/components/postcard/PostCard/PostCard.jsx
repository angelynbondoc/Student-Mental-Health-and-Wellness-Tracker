// =============================================================================
// PostCard.jsx — adds PostMenu (3-dot), hide, and report functionality
// =============================================================================
import React, { useContext, useState } from "react";
import AppContext from "../../../AppContext";
import usePostCard from "../usePostCard";
import PostHeader from "../PostHeader/PostHeader";
import PostMenu from "../PostMenu/PostMenu";
import ActionBar from "../ActionBar";
import ShareConfirm from "../ShareConfirm";
import CommentSection from "../CommentSection";
import ReportModal from "../../ui/ReportModal/ReportModal";
import "./PostCard.css";

export default function PostCard({ post }) {
  const { profiles, communities } = useContext(AppContext);

  const [hidden, setHidden] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const author = profiles.find((p) => p.id === post.author_id);
  const displayName = post.is_anonymous
    ? "Anonymous"
    : (author?.display_name ?? "Unknown");
  const community = communities.find((c) => c.id === post.community_id);
  const isShared = post.content.startsWith("[Shared Post]:");

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

  if (hidden) {
    return (
      <div className="pc-card pc-card--hidden">
        <span className="pc-hidden-text">Post hidden</span>
        <button className="pc-undo-btn" onClick={() => setHidden(false)}>
          Undo
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pc-card">
        <div className="pc-header-row">
          <PostHeader
            authorId={post.is_anonymous ? null : post.author_id}
            avatarUrl={post.is_anonymous ? null : author?.avatar_url}
            displayName={displayName}
            communityName={community?.name ?? "Community"}
            createdAt={post.created_at}
            isShared={isShared}
          />
          <PostMenu
            postId={post.id}
            onHide={() => setHidden(true)}
            onReport={() => setShowReport(true)}
          />
        </div>

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
            profiles={profiles}
            onAddComment={handleAddComment}
          />
        )}
      </div>

      {showReport && (
        <ReportModal
          type="post"
          targetId={post.id}
          onClose={() => setShowReport(false)}
          onSubmit={() => setShowReport(false)}
        />
      )}
    </>
  );
}
