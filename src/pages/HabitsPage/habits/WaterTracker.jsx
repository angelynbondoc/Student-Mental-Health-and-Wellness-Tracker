import React, { useState } from "react";

const TOTAL_GLASSES = 8;

export function WaterTracker({ habitId, logged, onToggleLog }) {
  const storageKey = `water_${habitId}_${new Date().toISOString().split("T")[0]}`;
  const [filled, setFilled] = useState(() => {
    try {
      return parseInt(localStorage.getItem(storageKey) || "0", 10);
    } catch {
      return 0;
    }
  });
  const [showPanel, setShowPanel] = useState(false);

  const fill = (n) => {
    const next = filled === n ? n - 1 : n;
    setFilled(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // localStorage unavailable, continue without persisting
    }
    if (next >= TOTAL_GLASSES && !logged) onToggleLog(habitId);
    if (next < TOTAL_GLASSES && logged) onToggleLog(habitId);
  };

  return (
    <div className="habit-panel-wrap">
      {/* Card row */}
      <div
        className={`content-card hp-card${logged ? " content-card--active" : ""}`}
      >
        <div className="hp-left">
          <span className="hp-emoji">💧</span>
          <div>
            <p className="hp-name">Drink 8 glasses of water</p>
            <p className="hp-streak">
              {filled}/{TOTAL_GLASSES} glasses today
            </p>
          </div>
        </div>
        <div className="hp-card-actions">
          <button
            className="hp-track-btn"
            onClick={() => setShowPanel((v) => !v)}
          >
            {showPanel ? "Hide" : "Track"}
          </button>
          {logged && <span className="hp-done-badge">✓ Done</span>}
        </div>
      </div>

      {/* Expandable panel */}
      {showPanel && (
        <div className="habit-panel water-panel">
          <p className="panel-title">Tap a glass to log it</p>
          <div className="water-glasses-row">
            {Array.from({ length: TOTAL_GLASSES }, (_, i) => (
              <button
                key={i}
                className={`water-glass-btn${i < filled ? " water-glass-btn--filled" : ""}`}
                onClick={() => fill(i + 1)}
                aria-label={`Glass ${i + 1}`}
                title={`Glass ${i + 1}`}
              >
                <GlassIcon filled={i < filled} />
              </button>
            ))}
          </div>
          <p className="water-progress-text">
            {filled === 0 && "Start drinking! Your body will thank you 💙"}
            {filled > 0 &&
              filled < 4 &&
              `Good start! ${TOTAL_GLASSES - filled} more to go.`}
            {filled >= 4 &&
              filled < 8 &&
              `Halfway there! ${TOTAL_GLASSES - filled} more glasses.`}
            {filled === 8 && "🎉 Daily goal reached! Amazing!"}
          </p>
        </div>
      )}
    </div>
  );
}

export function GlassIcon({ filled }) {
  return (
    <svg viewBox="0 0 40 56" width="32" height="44" className="glass-svg">
      {/* Glass outline */}
      <path
        d="M6 4 L10 52 L30 52 L34 4 Z"
        fill={filled ? "#BBDEFB" : "#F5F5F5"}
        stroke={filled ? "#1E88E5" : "#BDBDBD"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Water fill */}
      {filled && (
        <path d="M11 30 L10 52 L30 52 L29 30 Z" fill="#1E88E5" opacity="0.7" />
      )}
      {/* Shine */}
      {filled && (
        <line
          x1="14"
          y1="34"
          x2="14"
          y2="48"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      )}
    </svg>
  );
}
