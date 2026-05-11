import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import "./LoginPage.css";

// ─── Floating particle ────────────────────────────────────────────────────────
function Particle({ style }) {
  return <span className="particle" style={style} aria-hidden="true" />;
}

// ─── Non-NEU Warning Modal ────────────────────────────────────────────────────
function NonNEUWarningModal({ onClose, onTryAgain }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 10, 10, 0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 9998,
          animation: "fadeInBackdrop 0.2s ease",
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "420px",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            overflow: "hidden",
            animation: "slideUpModal 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Red accent bar */}
          <div
            style={{
              height: "5px",
              background: "linear-gradient(90deg, #C62828 0%, #E53935 100%)",
            }}
          />

          <div style={{ padding: "32px 32px 28px" }}>
            {/* Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(198, 40, 40, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2.625L25.375 22.75H2.625L14 2.625Z"
                  stroke="#C62828"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11.375V15.75"
                  stroke="#C62828"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="14" cy="19.25" r="1.25" fill="#C62828" />
              </svg>
            </div>

            {/* Title */}
            <h2
              id="modal-title"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "20px",
                fontWeight: 600,
                color: "#1A1A1A",
                margin: "0 0 10px",
                lineHeight: 1.3,
              }}
            >
              Access Restricted
            </h2>

            {/* Description */}
            <p
              id="modal-desc"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                color: "#616161",
                lineHeight: 1.6,
                margin: "0 0 20px",
              }}
            >
              Only official{" "}
              <strong style={{ color: "#1A1A1A" }}>
                New Era University accounts
              </strong>{" "}
              are permitted to access this platform.
            </p>

            {/* Domain pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#F2F2F2",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(46, 125, 50, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="1.5"
                    y="4.5"
                    width="15"
                    height="10.5"
                    rx="2"
                    stroke="#2E7D32"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M1.5 7.5L9 12L16.5 7.5"
                    stroke="#2E7D32"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "11px",
                    color: "#616161",
                    margin: "0 0 2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}
                >
                  Required email domain
                </p>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#2E7D32",
                    margin: 0,
                  }}
                >
                  @neu.edu.ph
                </p>
              </div>
            </div>

            {/* Help text */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
                background: "rgba(245, 196, 0, 0.08)",
                border: "1px solid rgba(245, 196, 0, 0.3)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "24px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0, marginTop: "1px" }}
              >
                <circle cx="8" cy="8" r="6.5" stroke="#F5C400" strokeWidth="1.5" />
                <path
                  d="M8 5v3.5M8 10v1"
                  stroke="#F5C400"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  color: "#616161",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                If you are a student or faculty at NEU, please sign in using
                your university-issued Google account. Contact your IT
                department if you need assistance.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: "10px",
                  border: "1.5px solid #E0E0E0",
                  background: "transparent",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#616161",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F2F2F2";
                  e.currentTarget.style.color = "#1A1A1A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#616161";
                }}
              >
                Dismiss
              </button>
              <button
                onClick={onTryAgain}
                style={{
                  flex: 2,
                  padding: "11px 0",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #256427 0%, #2E7D32 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(46, 125, 50, 0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(46, 125, 50, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Try a Different Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNonNEUModal, setShowNonNEUModal] = useState(false);
  const [particles, setParticles] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Show modal if redirected back from AuthCallback with ?error=non_neu
  useEffect(() => {
    if (searchParams.get("error") === "non_neu") {
      setShowNonNEUModal(true);
      setSearchParams({}, { replace: true }); // clean the URL
    }
  }, []);

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

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await supabase.auth.signOut();

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          prompt: "select_account consent",
          hd: "neu.edu.ph",
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

  const handleTryAgain = () => {
    setShowNonNEUModal(false);
    handleGoogleLogin();
  };

  return (
    <div className="login-root">
      {/* Non-NEU Warning Modal */}
      {showNonNEUModal && (
        <NonNEUWarningModal
          onClose={() => setShowNonNEUModal(false)}
          onTryAgain={handleTryAgain}
        />
      )}

      {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
      <div className="login-left">
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

        <div className="left-circle" />
        <div className="left-circle-2" />

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

        <h1 className="left-headline">
          Your wellbeing
          <br />
          <em>matters here.</em>
        </h1>

        <p className="left-sub">
          A safe, supportive space for NEU students to track their mental
          health, connect with peers, and discover coping strategies together.
        </p>

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

          {error && (
            <div className="error-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ marginTop: 1, flexShrink: 0 }}
              >
                <circle cx="8" cy="8" r="6.5" stroke="#C62828" strokeWidth="1.5" />
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

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-label">
              Continue with your institutional account
            </span>
            <div className="divider-line" />
          </div>

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