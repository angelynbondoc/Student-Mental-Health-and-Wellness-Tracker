import "./SigningInPage.css";

export default function SigningInPage() {
  return (
    <div className="si-shell">
      <div className="si-card">
        {/* Logo */}
        {/* Logo */}
        <div className="si-logo-ring">
          <img src="/NEULogo1.png" alt="NEU Logo" className="si-logo-img" />
        </div>

        {/* Badge */}
        <span className="si-badge">New Era University</span>

        {/* Title */}
        <h1 className="si-title">MindSpace</h1>
        <p className="si-sub">Signing you in…</p>

        {/* Bouncing dots */}
        <div className="si-dots">
          <div className="si-dot si-dot--green" />
          <div className="si-dot si-dot--gold" />
          <div className="si-dot si-dot--faded" />
        </div>

        {/* Progress bar */}
        <div className="si-bar-wrap">
          <div className="si-bar" />
        </div>

        <p className="si-hint">Verifying your NEU account</p>
      </div>
    </div>
  );
}
