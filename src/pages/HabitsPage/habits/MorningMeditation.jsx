import React, { useState, useEffect, useRef } from "react";
const BREATH_PHASES = [
  { label: "Inhale", duration: 4, scale: 1.35, color: "#A5D6A7" },
  { label: "Hold", duration: 4, scale: 1.35, color: "#FFF176" },
  { label: "Exhale", duration: 6, scale: 1.0, color: "#90CAF9" },
  { label: "Rest", duration: 2, scale: 1.0, color: "#CE93D8" },
];

const TOTAL_CYCLE = BREATH_PHASES.reduce((s, p) => s + p.duration, 0);

export function MeditationPanel({
  habitId,
  logged,
  onToggleLog,
  completionCount,
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds in current cycle
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  // Determine current phase
  let acc = 0;
  let currentPhase = BREATH_PHASES[0];
  let phaseElapsed = 0;
  for (const phase of BREATH_PHASES) {
    if (elapsed < acc + phase.duration) {
      currentPhase = phase;
      phaseElapsed = elapsed - acc;
      break;
    }
    acc += phase.duration;
  }
  const phaseRemaining = currentPhase.duration - phaseElapsed;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          if (next >= TOTAL_CYCLE) {
            setSessions((s) => {
              const ns = s + 1;
              if (ns >= 3 && !logged) onToggleLog(habitId);
              return ns;
            });
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const breathProgress = phaseElapsed / currentPhase.duration;

  return (
    <div className="habit-panel-wrap">
      <div
        className={`content-card hp-card${logged ? " content-card--active" : ""}`}
      >
        <div className="hp-left">
          <span className="hp-emoji">🔥</span>
          <div>
            <p className="hp-name">Morning Meditation (10 min)</p>
            <p className="hp-streak">
              {completionCount} total completion
              {completionCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="hp-card-actions">
          <button
            className="hp-track-btn"
            onClick={() => setShowPanel((v) => !v)}
          >
            {showPanel ? "Hide" : "Meditate"}
          </button>
          {logged && <span className="hp-done-badge">✓ Done</span>}
        </div>
      </div>

      {showPanel && (
        <div className="habit-panel meditation-panel">
          <p className="panel-title">
            Breathing Exercise · {sessions} cycle{sessions !== 1 ? "s" : ""}{" "}
            completed
          </p>

          {/* Animated breathing orb */}
          <div className="breath-stage">
            <div
              className="breath-ring breath-ring--outer"
              style={{
                background: `${currentPhase.color}22`,
                transform: `scale(${running ? currentPhase.scale * 1.1 : 1})`,
              }}
            />
            <div
              className="breath-ring breath-ring--mid"
              style={{
                background: `${currentPhase.color}44`,
                transform: `scale(${running ? currentPhase.scale * 1.05 : 1})`,
              }}
            />
            <div
              className="breath-orb"
              style={{
                background: `radial-gradient(circle at 35% 35%, white, ${currentPhase.color})`,
                transform: `scale(${running ? currentPhase.scale : 1})`,
                boxShadow: running
                  ? `0 0 40px ${currentPhase.color}99`
                  : "none",
              }}
            >
              <span className="breath-phase-label">
                {running ? currentPhase.label : "Ready"}
              </span>
              {running && (
                <span className="breath-countdown">{phaseRemaining}s</span>
              )}
            </div>

            {/* Circular progress arc */}
            {running && (
              <svg className="breath-arc" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="3"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={currentPhase.color}
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - breathProgress)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  style={{
                    transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
                  }}
                />
              </svg>
            )}
          </div>

          {/* Phase guide */}
          <div className="breath-phases-row">
            {BREATH_PHASES.map((p) => (
              <div
                key={p.label}
                className={`breath-phase-chip${currentPhase.label === p.label && running ? " breath-phase-chip--active" : ""}`}
                style={
                  currentPhase.label === p.label && running
                    ? { background: p.color, borderColor: p.color }
                    : {}
                }
              >
                <span>{p.label}</span>
                <span className="chip-dur">{p.duration}s</span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="med-controls">
            <button className="med-btn med-btn--reset" onClick={reset}>
              Reset
            </button>
            <button
              className={`med-btn med-btn--primary${running ? " med-btn--pause" : ""}`}
              onClick={() => setRunning((v) => !v)}
            >
              {running ? "⏸ Pause" : "▶ Start"}
            </button>
          </div>

          <p className="med-hint">
            Complete 3 breathing cycles to mark as done
          </p>
        </div>
      )}
    </div>
  );
}
