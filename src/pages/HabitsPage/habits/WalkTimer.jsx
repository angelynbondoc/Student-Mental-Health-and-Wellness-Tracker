import React, {
  useState,
  useEffect,useRef
} from "react";
// ── Walk Timer ────────────────────────────────────────────────────────────────
const WALK_DURATION = 30 * 60; // 30 minutes in seconds

export function WalkTimer({ habitId, logged, onToggleLog, completionCount }) {
  const [showPanel, setShowPanel] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(WALK_DURATION);
  const [running,   setRunning]   = useState(false);
  const [finished,  setFinished]  = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            if (!logged) onToggleLog(habitId);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setRunning(false);
    setTimeLeft(WALK_DURATION);
    setFinished(false);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const progress = 1 - timeLeft / WALK_DURATION;
  const circumference = 2 * Math.PI * 80;

  return (
    <div className="habit-panel-wrap">
      <div className={`content-card hp-card${logged ? " content-card--active" : ""}`}>
        <div className="hp-left">
          <span className="hp-emoji">🌱</span>
          <div>
            <p className="hp-name">30-min walk or exercise</p>
            <p className="hp-streak">{completionCount} total completion{completionCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="hp-card-actions">
          <button className="hp-track-btn" onClick={() => setShowPanel((v) => !v)}>
            {showPanel ? "Hide" : "Start Timer"}
          </button>
          {logged && <span className="hp-done-badge">✓ Done</span>}
        </div>
      </div>

      {showPanel && (
        <div className="habit-panel walk-panel">
          <p className="panel-title">
            {finished ? "🎉 Walk complete! Great job!" : running ? "Keep walking! You've got this 💪" : "Set your 30-minute walk timer"}
          </p>

          {/* Ring timer */}
          <div className="walk-timer-stage">
            <svg className="walk-ring-svg" viewBox="0 0 200 200">
              {/* Background track */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="#E8F5E9" strokeWidth="10" />
              {/* Progress arc */}
              <circle
                cx="100" cy="100" r="80"
                fill="none"
                stroke={finished ? "#2E7D32" : running ? "#4CAF50" : "#A5D6A7"}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
              {/* Walking figure */}
              <text x="100" y="88" textAnchor="middle" fontSize="32" className="walk-emoji-text">
                {finished ? "🏆" : running ? "🚶" : "🧍"}
              </text>
              {/* Time display */}
              <text x="100" y="118" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1A1A1A" fontFamily="Poppins, sans-serif">
                {mm}:{ss}
              </text>
              <text x="100" y="134" textAnchor="middle" fontSize="11" fill="#616161" fontFamily="DM Sans, sans-serif">
                remaining
              </text>
            </svg>
          </div>

          {/* Stats row */}
          <div className="walk-stats-row">
            <div className="walk-stat">
              <span className="walk-stat-val">{Math.round(progress * 30)}</span>
              <span className="walk-stat-lbl">min elapsed</span>
            </div>
            <div className="walk-stat">
              <span className="walk-stat-val">{Math.round(progress * 100)}%</span>
              <span className="walk-stat-lbl">complete</span>
            </div>
            <div className="walk-stat">
              <span className="walk-stat-val">{Math.round(progress * 150)}</span>
              <span className="walk-stat-lbl">est. calories</span>
            </div>
          </div>

          {/* Controls */}
          <div className="walk-controls">
            <button className="med-btn med-btn--reset" onClick={reset} disabled={timeLeft === WALK_DURATION && !running}>
              Reset
            </button>
            {!finished && (
              <button
                className={`med-btn med-btn--primary${running ? " med-btn--pause" : ""}`}
                onClick={() => setRunning((v) => !v)}
              >
                {running ? "⏸ Pause" : timeLeft < WALK_DURATION ? "▶ Resume" : "▶ Start"}
              </button>
            )}
            {finished && (
              <button className="med-btn med-btn--primary" onClick={reset}>Start Again</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}