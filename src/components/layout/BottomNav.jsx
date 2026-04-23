// =============================================================================
// BottomNav.jsx
// Mobile-only fixed bottom tab bar.
// Hidden on desktop via CSS — see MobileLayout.css (.neu-bottom-nav).
// =============================================================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import NAV_LINKS from './navLinks';

export default function BottomNav() {
  return (
    <nav className="neu-bottom-nav">
      {NAV_LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `neu-nav-item${isActive ? ' active' : ''}`
          }
        >
          <Icon size={20} className="neu-nav-icon" />
          <span className="neu-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}