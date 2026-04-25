// =============================================================================
// TopBar.jsx
// Desktop: inline search bar in center
// Mobile:  magnifying glass icon → tapping expands a full-width search bar
// =============================================================================
import React, { useState, useRef, useEffect } from "react";
import { Bell, User, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopBar({
  displayName,
  isAdmin,
  unreadCount,
  onBellClick,
  onSearch,
}) {
  const navigate = useNavigate();
  const [query, setQuery]             = useState("");
  const [focused, setFocused]         = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input when mobile search bar opens
  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus();
  }, [mobileOpen]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setQuery("");
    onSearch?.("");
    setMobileOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClose();
  };

  return (
    <header className="neu-topbar">

      {/* ── Mobile search overlay (slides down when open) ─────────────────── */}
      {mobileOpen && (
        <div className="neu-mobile-search-bar">
          <Search size={15} className="neu-search-icon" />
          <input
            ref={inputRef}
            className="neu-search-input"
            type="text"
            placeholder="Search posts, communities…"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="Search"
          />
          {query && (
            <button className="neu-search-clear" onClick={handleClear} aria-label="Clear">
              <X size={13} />
            </button>
          )}
          <button className="neu-mobile-search-close" onClick={handleClose} aria-label="Close search">
            Cancel
          </button>
        </div>
      )}

      {/* ── Normal topbar row ─────────────────────────────────────────────── */}
      <div className="neu-topbar-left">
        <span className="neu-topbar-gold-bar" />
        <span className="neu-topbar-appname">MindSpace</span>
      </div>

      {/* Desktop search — hidden on mobile */}
      <div className={`neu-search-wrap${focused ? " neu-search-wrap--focused" : ""}`}>
        <Search size={15} className="neu-search-icon" />
        <input
          className="neu-search-input"
          type="text"
          placeholder="Search posts, communities…"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          aria-label="Search"
        />
        {query && (
          <button className="neu-search-clear" onClick={handleClear} aria-label="Clear search">
            <X size={13} />
          </button>
        )}
      </div>

      <div className="neu-topbar-right">

        {/* Mobile search trigger — hidden on desktop */}
        <button
          className="neu-mobile-search-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open search"
        >
          <Search size={18} strokeWidth={2} />
        </button>

        <span className="neu-user-chip">
          {displayName}
          {isAdmin && <span className="neu-admin-badge">Admin</span>}
        </span>

        <button
          className="neu-profile-btn"
          onClick={() => navigate("/profile")}
          aria-label="Go to profile"
        >
          <User size={18} strokeWidth={2} />
        </button>

        <button
          className="neu-bell-btn"
          onClick={onBellClick}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell size={18} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="neu-bell-badge">{unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}