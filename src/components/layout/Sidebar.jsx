import React from 'react';
import { NavLink } from 'react-router-dom';
import NAV_LINKS from './Navlinks';

export default function Sidebar() {
  return (
    <aside className="neu-sidebar">
      <p className="neu-sidebar-label">Navigation</p>
      {NAV_LINKS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `neu-sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <item.icon size={16} className="neu-sidebar-icon" />
          {item.label}
        </NavLink>
      ))}
      <div className="neu-sidebar-note"><span>ONE DAY AT A TIME</span><p>Make a little space for yourself today.</p><NavLink to="/resources">Explore wellness resources <span aria-hidden="true">↗</span></NavLink></div>
    </aside>
  );
}
