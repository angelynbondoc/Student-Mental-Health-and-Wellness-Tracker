import React, { useState, useEffect, useContext } from "react";
import AppContext from "../../AppContext";
import { supabase } from "../../supabase";
import { containsCrisisKeywords } from "../../utils/crisisKeywords";

/**
 * Custom hook that encapsulates the interactive business logic for a single post card.
 * Manages local state and database synchronisation for upvoting, commenting, and sharing.
 * Includes automated crisis keyword detection on new comments to immediately flag 
 * the parent post and notify administrators.
 *
 * @param {Object} post - The post object containing ID, author, and content metadata.
 * @returns {Object} State variables and handler functions (handleReaction, handleAddComment, handleShare).
 */

export default function usePostCard(post) {
  const { currentUser, setPosts } = useContext(AppContext);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // ── Reactions ──────────────────────────────────────────────────────────────
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [myReactionId, setMyReactionId] = useState(null);
  const reactingRef = React.useRef(false);

  useEffect(() => {
    if (!currentUser) return;
    async function fetchReactions() {
      const { data } = await supabase
        .from("reactions")
        .select("id, user_id")
        .eq("post_id", post.id)
        .eq("type", "upvote");
      if (!data) return;
      setUpvoteCount(data.length);
      const mine = data.find((r) => r.user_id === currentUser.id);
      setMyReactionId(mine?.id ?? null);
    }
    fetchReactions();
  }, [post.id, currentUser?.id]);

  const handleReaction = async () => {
    if (!currentUser) return;
    if (reactingRef.current) return;
    reactingRef.current = true;
    if (myReactionId) {
      setUpvoteCount((n) => n - 1);
      setMyReactionId(null);
      await supabase.from("reactions").delete().eq("id", myReactionId);
    } else {
      setUpvoteCount((n) => n + 1);
      const { data } = await supabase
        .from("reactions")
        .insert({ post_id: post.id, user_id: currentUser.id, type: "upvote" })
        .select("id")
        .single();
      if (data) setMyReactionId(data.id);

      // Notify post author on like only (not unlike)
      if (post.author_id && post.author_id !== currentUser.id) {
        await supabase.from("notifications").insert({
          user_id: post.author_id,
          type: "reaction",
          content: `${currentUser.display_name ?? "Someone"} liked your post.`,
          post_id: post.id,
        });
      }
    }
    reactingRef.current = false;
  };

  // ── Comments ───────────────────────────────────────────────────────────────
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("post_id", post.id);
      setCommentCount(count ?? 0);
    }
    fetchCount();
  }, [post.id]);

  const handleAddComment = async (content, isAnonymous = false) => {
    if (!currentUser) return;

    const isCrisis = containsCrisisKeywords(content.trim());

    const { error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, author_id: currentUser.id, content, is_anonymous: isAnonymous });
    if (!error) {
      setCommentCount((n) => n + 1);
      // Notify post author on comment
      if (post.author_id && post.author_id !== currentUser.id) {
        await supabase.from("notifications").insert({
          user_id: post.author_id,
          type: "comment",
          content: isAnonymous
            ? "Someone commented on your post."
            : `${currentUser.display_name ?? "Someone"} commented on your post.`,
          post_id: post.id,
        });
      }

      // --- CRISIS AUTO-FLAG FLOW FOR COMMENTS ---
      if (isCrisis) {
        try {
          // 🚨 ADD THIS: Flag the parent post so the dashboard doesn't hide the report
          await supabase.from('posts').update({ is_flagged: true }).eq('id', post.id);

          // Insert a report linking to the parent post
          await supabase.from('reports').insert({
            type:        'post',
            post_id:     post.id,
            reporter_id: currentUser.id, 
            reason:      'crisis_auto_flagged',
            details:     `Auto-flagged from a COMMENT: "${content.trim()}"`,
            status:      'pending',
          });

          const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .in('role', ['admin', 'superadmin']);

          if (admins && admins.length > 0) {
            const notifRows = admins.map(a => ({
              user_id:  a.id,
              type:     'system',
              title:    '🚨 Crisis Comment Detected',
              message:  'A comment was auto-flagged for potential crisis content. Review the reported post now.',
              is_read:  false,
            }));
            await supabase.from('notifications').insert(notifRows);
          }
        } catch (flagErr) {
          console.error('Crisis flag error on comment:', flagErr);
        }
      }
      // --- END CRISIS FLOW ---
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
  if (!currentUser) return;

  const trueOriginalAuthorId = post.original_author_id ?? post.author_id;

  let originalContent = post.content;
  if (originalContent.startsWith("[Shared Post]:")) {
    originalContent = originalContent.replace("[Shared Post]:", "").trim();
  }

  const { error } = await supabase.from("posts").insert({
    author_id: currentUser.id,
    original_author_id: trueOriginalAuthorId,  
    community_id: post.community_id,
    content: `[Shared Post]: ${originalContent}`,
    is_anonymous: false,
    is_flagged: false
  });

    if (!error) {
      setShowConfirm(false);

      // Notify original post author
      if (post.author_id && post.author_id !== currentUser.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", currentUser.id)
          .single();

        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: post.author_id,
          type: "share",
          content: `${profile?.display_name ?? "Someone"} shared your post.`,
          post_id: post.id,
        });
        if (notifError) console.error("notif insert failed:", notifError);
      }

      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    }
  };

  return {
    upvoteCount,
    commentCount,
    hasReacted: Boolean(myReactionId),
    showConfirm,
    showComments,
    handleReaction,
    handleAddComment,
    handleShare,
    setShowConfirm,
    setShowComments,
  };
}