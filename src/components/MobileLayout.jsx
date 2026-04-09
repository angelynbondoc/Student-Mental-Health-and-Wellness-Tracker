import { NavLink, Outlet } from "react-router-dom";

// ============================================================
// COMPONENT: MobileLayout — App Shell with Bottom Tab Nav
//
// SECI CONNECTION:
//   Each tab maps to a SECI knowledge process:
//   Home       → Socialization  (share lived experiences)
//   Create     → Externalization (write tacit feelings into text)
//   Journal    → Internalization (private reflection)
//   Resources  → Combination    (curated explicit knowledge)
//
// WHY <Outlet />:
//   React Router renders the currently active child route
//   inside <Outlet>. MobileLayout is the picture frame;
//   Outlet is the canvas that swaps per tab.
// ============================================================

function MobileLayout() {
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
    paddingBottom: "80px", // prevents content hiding behind nav bar
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

  // NavLink callback style: highlights the active tab in purple
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
      <div style={contentAreaStyle}>
        <Outlet />
      </div>
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