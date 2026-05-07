import React from "react";
import { NavLink } from "react-router-dom";
import NAV_LINKS from "./navLinks";

export default function BottomNav() {
  return (
    <nav className="neu-bottom-nav">
      {NAV_LINKS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `neu-nav-item${isActive ? " active" : ""}`
          }
        >
          <item.icon size={20} className="neu-nav-icon" />
          <span className="neu-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}