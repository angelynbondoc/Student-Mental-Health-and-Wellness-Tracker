// ── Avatar ─────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 36, bg = "#E8F5E9", color = "#2E7D32" }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: bg, color, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, type = "default" }) {
  return <span className={`badge badge--${type}`}>{children}</span>;
}

// ── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent }}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

// ── FilterBar ──────────────────────────────────────────────────────────────
export function FilterBar({ value, onChange }) {
  return (
    <div className="filter-bar">
      {["pending", "resolved"].map((f) => (
        <button
          key={f}
          className={`filter-btn ${value === f ? "active" : ""}`}
          onClick={() => onChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}