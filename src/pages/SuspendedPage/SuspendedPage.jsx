import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Send, CheckCircle } from "lucide-react";
import { supabase } from "../../supabase";
import AppContext from "../../AppContext";
import "./SuspendedPage.css";

export default function SuspendedPage() {
  const { currentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [suspensionMessage, setSuspensionMessage] = useState(null);

  const [appealStep, setAppealStep] = useState("idle"); // idle | form | submitting | done
  const [appealText, setAppealText] = useState("");
  const [appealError, setAppealError] = useState("");

  useEffect(() => {
    if (!currentUser?.id) return;
    async function fetchSuspensionNotif() {
      const { data } = await supabase
        .from("notifications")
        .select("content, created_at")
        .eq("user_id", currentUser.id)
        .eq("type", "moderation")
        .eq("title", "Account Suspended")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setSuspensionMessage(data.content);
    }
    fetchSuspensionNotif();
  }, [currentUser?.id]);

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const handleSubmitAppeal = async () => {
  if (!appealText.trim()) {
    setAppealError("Please explain your appeal before submitting.");
    return;
  }
  setAppealError("");
  setAppealStep("submitting");

  const { error } = await supabase.from("reports").insert({
    reporter_id: currentUser.id,
    type: "appeal",
    reason: "suspension_appeal",
    details: appealText.trim(),
    status: "pending",
  });

  if (error) {
    console.error("appeal error:", error);
    setAppealError("Submission failed. Please try again.");
    setAppealStep("form");
    return;
  }

  setAppealStep("done");
};

  return (
    <div className="sp-root">
      <div className="sp-card">
        <div className="sp-icon-wrap">
          <ShieldAlert size={40} className="sp-icon" />
        </div>

        <h1 className="sp-title">Account Suspended</h1>
        <p className="sp-sub">
          Your account has been restricted from accessing the platform.
        </p>

        {suspensionMessage && (
          <div className="sp-message-box">
            <p className="sp-message-label">Message from Admin:</p>
            <p className="sp-message-text">{suspensionMessage}</p>
          </div>
        )}

        <div className="sp-actions">
          <button className="sp-btn sp-btn--primary" onClick={handleBackToLogin}>
            Back to Login
          </button>

          {/* ── Appeal states ── */}
          {appealStep === "idle" && (
            <button
              className="sp-btn sp-btn--ghost"
              onClick={() => setAppealStep("form")}
            >
              Appeal Suspension
            </button>
          )}

          {(appealStep === "form" || appealStep === "submitting") && (
            <div className="sp-appeal-form">
              <p className="sp-appeal-title">Submit an Appeal</p>
              <p className="sp-appeal-hint">
                Explain why you believe this suspension should be reviewed.
              </p>
              <textarea
                className="sp-appeal-textarea"
                rows={4}
                placeholder="Write your appeal here..."
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                disabled={appealStep === "submitting"}
              />
              {appealError && (
                <p className="sp-appeal-error">{appealError}</p>
              )}
              <div className="sp-appeal-btns">
                <button
                  className="sp-btn sp-btn--ghost sp-btn--sm"
                  onClick={() => { setAppealStep("idle"); setAppealText(""); setAppealError(""); }}
                  disabled={appealStep === "submitting"}
                >
                  Cancel
                </button>
                <button
                  className="sp-btn sp-btn--submit sp-btn--sm"
                  onClick={handleSubmitAppeal}
                  disabled={appealStep === "submitting"}
                >
                  <Send size={14} />
                  {appealStep === "submitting" ? "Submitting..." : "Submit Appeal"}
                </button>
              </div>
            </div>
          )}

          {appealStep === "done" && (
            <div className="sp-appeal-success">
              <CheckCircle size={20} className="sp-appeal-success-icon" />
              <p>Your appeal has been submitted.</p>
              <p>An administrator will review it shortly.</p>
            </div>
          )}
        </div>

        <p className="sp-footer">
          NEU Wellness Tracker · New Era University
        </p>
      </div>
    </div>
  );
}