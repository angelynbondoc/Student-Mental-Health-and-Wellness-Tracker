// =============================================================================
// PostMenu.jsx
// Three-dot (⋯) button in the top-right corner of every PostCard.
// Options: Hide post | Report post
// Clicking "Report post" opens ReportModal.
// Props:
//   postId     — used as targetId for the report
//   onHide     — () => void — hides the card from the feed
//   onReport   — opens the report modal (handled by parent PostCard)
// =============================================================================
import React, { useState, useRef, useEffect } from 'react';
import './PostMenu.css';

export default function PostMenu({onHide, onReport }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleHide() {
    setOpen(false);
    onHide?.();
  }

  function handleReport() {
    setOpen(false);
    onReport?.();
  }

  return (
    <div className="pm-wrapper" ref={menuRef}>
      <button
        className="pm-trigger"
        aria-label="Post options"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      >
        <span className="pm-dot" />
        <span className="pm-dot" />
        <span className="pm-dot" />
      </button>

      {open && (
        <div className="pm-dropdown" role="menu">
          <button className="pm-item" role="menuitem" onClick={handleHide}>
            <span className="pm-item-icon" aria-hidden="true">
              {/* eye-slash icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </span>
            Hide post
          </button>

          <div className="pm-divider" />

          <button className="pm-item pm-item--danger" role="menuitem" onClick={handleReport}>
            <span className="pm-item-icon" aria-hidden="true">
              {/* flag icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </span>
            Report post
          </button>
        </div>
      )}
    </div>
  );
}