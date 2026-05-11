import { useState, useEffect } from "react";
import { supabase } from "../../supabase"; // Note: Adjust the path depending on where supabase.js is located!
import "./LoginPage.css";

// ─── Supabase client ───────────────────────────────────────────────────────────
// Replace with your actual project values or set in .env

// ─── Floating particle ────────────────────────────────────────────────────────
function Particle({ style }) {
  return <span className="particle" style={style} aria-hidden="true" />;
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If redirected back after a rejected non-NEU login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !session.user.email?.endsWith('@neu.edu.ph')) {
        supabase.auth.signOut();
        setError("Access denied. Please use your @neu.edu.ph account.");
      }
    });
  }, []);
  const [particles, setParticles] = useState([]);

  // Generate decorative floating particles once on mount
  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      width: Math.random() * 8 + 4,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 8 + 8,
      opacity: Math.random() * 0.25 + 0.08,
    }));
    setParticles(generated);
  }, []);

  // ── Google OAuth (institutional domain restricted) ──────────────────────────
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      
      await supabase.auth.signOut()

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          prompt: 'select_account consent',
          hd: "neu.edu.ph", // restrict to NEU accounts
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(
        err.message ||
          "Sign-in failed. Please use your NEU institutional account.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <div className="login-left">
        {/* Decorative floating gold dots */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            style={{
              width: p.width,
              height: p.width,
              top: `${p.top}%`,
              left: `${p.left}%`,
              "--op": p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        {/* Decorative concentric rings */}
        <div className="left-circle" />
        <div className="left-circle-2" />

        {/* NEU branding */}
        <div className="left-logo">
          <img
            src="/NEULogo1.png"
            alt="New Era University Logo"
            className="logo-img"
          />
          <div className="logo-text-block">
            <div className="logo-text-top">New Era University</div>
            <div className="logo-text-btm">Quezon City, Philippines</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="left-headline">
          Your wellbeing
          <br />
          <em>matters here.</em>
        </h1>

        {/* Description */}
        <p className="left-sub">
          A safe, supportive space for NEU students to track their mental
          health, connect with peers, and discover coping strategies together.
        </p>

        {/* Feature list */}
        <div className="left-pills">
          {[
            "Track daily mood and wellness habits",
            "Connect with peer support communities",
            "Access curated mental health resources",
            "Share experiences in safe discussion groups",
          ].map((text) => (
            <div className="left-pill" key={text}>
              <span className="pill-dot" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="login-right">
        <div className="card">
          <p className="card-eyebrow">Student Portal</p>
          <h2 className="card-title">Welcome back</h2>
          <p className="card-sub">
            Sign in to access your wellness dashboard and community.
          </p>

          {/* Institutional domain notice */}
          <div className="domain-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59
                   14.5 8 11.59 1.5 8 1.5zm0 2.25a2.25 2.25 0 110 4.5 2.25 2.25
                   0 010-4.5zm0 9c-1.88 0-3.54-.95-4.5-2.4.02-1.49 3-2.31
                   4.5-2.31s4.48.82 4.5 2.31c-.96 1.45-2.62 2.4-4.5 2.4z"
                fill="#2E7D32"
              />
            </svg>
            Restricted to <strong style={{ marginLeft: 4 }}>@neu.edu.ph</strong>
            &nbsp;accounts only
          </div>

          {/* Error message */}
          {error && (
            <div className="error-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ marginTop: 1, flexShrink: 0 }}
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="#C62828"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 4.5v4M8 10.5v1"
                  stroke="#C62828"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-label">
              Continue with your institutional account
            </span>
            <div className="divider-line" />
          </div>

          {/* Google sign-in button */}
          <button
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-label="Sign in with Google institutional account"
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <svg
                className="btn-google-icon"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04
                         2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23
                         1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53
                         7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43
                         8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12
                         1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {loading ? "Redirecting to Google…" : "Sign in with Google"}
          </button>

          {/* Legal note */}
          <p className="login-note">
            By signing in, you agree to NEU's <a href="#">Privacy Policy</a> and{" "}
            <a href="#">Terms of Use</a>. Your mental health data is
            confidential and never shared without your consent.
          </p>
        </div>

        <p className="bottom-brand">
          NEU Wellness Tracker · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
