import React, { useContext, useState } from "react";
import AppContext from "../../../AppContext";
import usePostCard from "../usePostCard";
import PostHeader from "../PostHeader/PostHeader";
import PostMenu from "../PostMenu/PostMenu";
import ActionBar from "../ActionBar";
import ShareConfirm from "../ShareConfirm";
import CommentSection from "../CommentSection/CommentSection";
import ReportModal from "../../ui/ReportModal/ReportModal";
import "./PostCard.css";

export default function PostCard({ post }) {
  const { profiles, communities } = useContext(AppContext);
  const [hidden, setHidden] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const isShared = post.content?.startsWith("[Shared Post]:");

  let displayContent = post.content || "";
  if (isShared) {
    displayContent = displayContent.replace(/^\[Shared Post\]:\s*/, "").trim();
  }

  const isAdminBroadcast = displayContent.startsWith("[Admin Broadcast]\n");
  if (isAdminBroadcast) {
    displayContent = displayContent.replace(/^\[Admin Broadcast\]\n\s*/, "").trim();
  }

  // ── Determine if this is an ORIGINAL admin broadcast (not a share) ─────────
  const isOriginalAdminBroadcast = isAdminBroadcast && !isShared;

  // ── Header: sharer's real info, except for original admin broadcasts ────────
  const sharer = profiles.find((p) => p.id === post.author_id);
  
  const displayName = isOriginalAdminBroadcast
    ? "Admin"
    : post.is_anonymous
    ? "Anonymous"
    : sharer?.display_name ?? "Unknown";

  const displayAvatar = isOriginalAdminBroadcast
    ? "/NEULogo1.png"
    : post.is_anonymous
    ? null
    : sharer?.photo_url;

  // ── PostHeader: null authorId = not clickable ───────────────────────────────
  const headerAuthorId = isOriginalAdminBroadcast || post.is_anonymous
    ? null
    : post.author_id;

  // ── Original author attribution (shown inside card for shared posts) ──────
  const originalAuthorId = isShared ? post.original_author_id : null;
  const originalAuthor = originalAuthorId
    ? profiles.find((p) => p.id === originalAuthorId)
    : null;

  const originalAuthorName = isAdminBroadcast
    ? "Admin"
    : originalAuthor?.display_name ?? null;

  const community = communities.find((c) => c.id === post.community_id);

  const {
    upvoteCount, commentCount, hasReacted,
    showConfirm, showComments,
    handleReaction, handleAddComment, handleShare,
    setShowConfirm, setShowComments,
  } = usePostCard(post);

  if (hidden) {
    return (
      <div className="pc-card pc-card--hidden">
        <span className="pc-hidden-text">Post hidden</span>
        <button className="pc-undo-btn" onClick={() => setHidden(false)}>Undo</button>
      </div>
    );
  }

  return (
    <>
      <div className="pc-card">
        <div className="pc-header-row">
          <PostHeader
            authorId={headerAuthorId}
            avatarUrl={displayAvatar}
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

        {/* ── Original author attribution ── */}
        {isShared && originalAuthorName && (
          <p className="pc-shared-origin">
            Originally posted by <strong>{originalAuthorName}</strong>
          </p>
        )}

        <p className="pc-body">{displayContent}</p>

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