import { NavLink, Outlet } from "react-router-dom";

// ============================================================
// COMPONENT: MobileLayout
// SECI CONNECTION: This is the main shell of the app.
// It structures how knowledge flows between sections:
//   - Home (Socialization) → Read shared community experiences
//   - Create (Externalization) → Articulate personal feelings into posts
//   - Journal (Internalization) → Privately reflect and absorb insights
//   - Resources (Combination) → Curated coping knowledge
//
// WHY <Outlet />: React Router's <Outlet> is a placeholder that
// renders whichever child page is currently active based on the URL.
// Think of MobileLayout as a picture frame — <Outlet> is the
// canvas inside that changes depending on which tab you click.
//
// WHY bottom tab nav: We design mobile-first because our target
// users (students) are primarily on phones. Bottom tabs are
// thumb-friendly and a standard mobile UX pattern.
// ============================================================

function MobileLayout() {
  // Inline styles object — simulates a "mobile phone" viewport
  // so we can develop and test the layout even on a desktop browser.
  const shellStyle = {
    maxWidth: "480px",
    margin: "0 auto",
    border: "1px solid #ccc",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    fontFamily: "sans-serif",
  };

  const contentAreaStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    // Extra bottom padding so content is never hidden behind the nav bar
    paddingBottom: "80px",
  };

  const navBarStyle = {
    position: "fixed",
    bottom: 0,
    width: "100%",
    maxWidth: "480px",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTop: "2px solid #eee",
    padding: "10px 0",
  };

  // NavLink from react-router-dom automatically applies an
  // "active" class when the current URL matches its 'to' prop.
  // We use a callback style for 'style' to dynamically change
  // the color of the active tab — visual feedback for the user.
  const getLinkStyle = ({ isActive }) => ({
    textDecoration: "none",
    color: isActive ? "#6c63ff" : "#888",
    fontWeight: isActive ? "bold" : "normal",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  });

  return (
    <div style={shellStyle}>
      {/* The scrollable content area — renders the active page */}
      <div style={contentAreaStyle}>
        <Outlet />
      </div>

      {/* Bottom Tab Navigation Bar */}
      <nav style={navBarStyle}>
        <NavLink to="/" end style={getLinkStyle}>
          <span>🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/create" style={getLinkStyle}>
          <span>✏️</span>
          <span>Create</span>
        </NavLink>
        <NavLink to="/journal" style={getLinkStyle}>
          <span>📓</span>
          <span>Journal</span>
        </NavLink>
        <NavLink to="/resources" style={getLinkStyle}>
          <span>💡</span>
          <span>Resources</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default MobileLayout;