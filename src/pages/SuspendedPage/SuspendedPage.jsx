import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Send, CheckCircle, AlertCircle } from "lucide-react";
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

        {/* Icon */}
        <div className="sp-icon-wrap">
          <ShieldAlert size={32} className="sp-icon" />
        </div>

        {/* Heading */}
        <h1 className="sp-title">Account Suspended</h1>
        <p className="sp-sub">
          Your account has been restricted from accessing MindSpace.
          If you believe this is a mistake, you may submit an appeal below.
        </p>

        <hr className="sp-divider" />

        {/* Admin message */}
        {suspensionMessage && (
          <div className="sp-message-box">
            <p className="sp-message-label">Message from Admin</p>
            <p className="sp-message-text">{suspensionMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="sp-actions">

          {/* Back to login — always visible */}
          <button className="sp-btn sp-btn--primary" onClick={handleBackToLogin}>
            Back to Login
          </button>

          {/* Appeal: idle */}
          {appealStep === "idle" && (
            <button
              className="sp-btn sp-btn--ghost"
              onClick={() => setAppealStep("form")}
            >
              Appeal Suspension
            </button>
          )}

          {/* Appeal: form / submitting */}
          {(appealStep === "form" || appealStep === "submitting") && (
            <div className="sp-appeal-form">
              <p className="sp-appeal-title">Submit an Appeal</p>
              <p className="sp-appeal-hint">
                Describe why you believe this suspension should be reviewed. Be specific and honest — the admin team reads every appeal.
              </p>
              <textarea
                className="sp-appeal-textarea"
                rows={4}
                placeholder="Explain your situation here..."
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                disabled={appealStep === "submitting"}
              />
              {appealError && (
                <p className="sp-appeal-error">
                  <AlertCircle size={13} />
                  {appealError}
                </p>
              )}
              <div className="sp-appeal-btns">
                <button
                  className="sp-btn sp-btn--ghost sp-btn--sm"
                  onClick={() => {
                    setAppealStep("idle");
                    setAppealText("");
                    setAppealError("");
                  }}
                  disabled={appealStep === "submitting"}
                >
                  Cancel
                </button>
                <button
                  className="sp-btn sp-btn--submit sp-btn--sm"
                  onClick={handleSubmitAppeal}
                  disabled={appealStep === "submitting"}
                >
                  <Send size={13} />
                  {appealStep === "submitting" ? "Submitting…" : "Submit Appeal"}
                </button>
              </div>
            </div>
          )}

          {/* Appeal: done */}
          {appealStep === "done" && (
            <div className="sp-appeal-success">
              <CheckCircle size={22} className="sp-appeal-success-icon" />
              <p>Appeal submitted successfully.</p>
              <p>An administrator will review it shortly.</p>
            </div>
          )}

        </div>

        <p className="sp-footer">NEU MindSpace · New Era University</p>
      </div>
    </div>
  );
}