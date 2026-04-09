import CreatePostForm from "../components/CreatePostForm";

// ============================================================
// PAGE: CreatePage — Thin wrapper for CreatePostForm.
// SECI CONNECTION — EXTERNALIZATION:
//   The page where tacit feelings become explicit community posts.
// ============================================================

function CreatePage({ onPostSubmit, communities, currentUserId }) {
  return (
    <div>
      <CreatePostForm
        onPostSubmit={onPostSubmit}
        communities={communities}
        currentUserId={currentUserId}
      />
    </div>
  );
}

export default CreatePage;