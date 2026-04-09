import CreatePostForm from "../components/CreatePostForm";

// ============================================================
// PAGE: CreatePage
// A thin wrapper page for the CreatePostForm component.
// The actual logic lives inside CreatePostForm — this page
// just provides the route target and page-level heading.
// onPostSubmit will be wired up in App.jsx via shared state
// (for now, we pass a simple console.log as placeholder).
// ============================================================

function CreatePage({ onPostSubmit }) {
  return (
    <div>
      <CreatePostForm onPostSubmit={onPostSubmit} />
    </div>
  );
}

export default CreatePage;