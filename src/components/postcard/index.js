// =============================================================================
// index.js
// Barrel export — import PostCard cleanly from the folder, not the file.
//
// Usage:
//   import { PostCard } from '../components/postcard';
// =============================================================================
export { default as PostCard } from "./PostCard/PostCard";
export { default as PostHeader } from "./PostHeader/PostHeader";
export { default as PostAvatar } from "./PostAvatar";
export { default as ActionBar } from "./ActionBar";
export { default as ShareConfirm } from "./ShareConfirm";
export { default as CommentSection } from "./CommentSection/CommentSection";
export { default as CommentItem } from "./CommentItem/CommentItem";
export { default as usePostCard } from "./usePostCard";
