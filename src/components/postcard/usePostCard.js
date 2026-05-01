import React, { useState, useEffect, useContext } from "react";
import AppContext from "../../AppContext";
import { supabase } from "../../supabase";

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

  const handleAddComment = async (content) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, author_id: currentUser.id, content });
    if (!error) setCommentCount((n) => n + 1);
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!currentUser) return;
    const { error } = await supabase.from("posts").insert({
      author_id: currentUser.id,
      community_id: post.community_id,
      content: `[Shared Post]: ${post.content}`,
      is_anonymous: false,
      is_flagged: false,
    });
    if (!error) {
      setShowConfirm(false);
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