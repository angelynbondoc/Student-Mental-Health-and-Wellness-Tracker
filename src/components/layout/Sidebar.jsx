// =============================================================================
// Sidebar.jsx
// Desktop-only left navigation sidebar.
// Hidden on mobile via CSS — see MobileLayout.css (.neu-sidebar).
// =============================================================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import NAV_LINKS from './navLinks';

export default function Sidebar() {
  return (
    <aside className="neu-sidebar">
      <p className="neu-sidebar-label">Navigation</p>
      {NAV_LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `neu-sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <Icon size={16} className="neu-sidebar-icon" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}