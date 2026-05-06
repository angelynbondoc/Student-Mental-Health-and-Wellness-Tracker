import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { supabase } from "../../supabase";
import AppContext from "../../AppContext";
import "./SuspendedPage.css";

export default function SuspendedPage() {
  const { currentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [suspensionMessage, setSuspensionMessage] = useState(null);
  const [appealClicked, setAppealClicked] = useState(false);

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

          {!appealClicked ? (
            <button
              className="sp-btn sp-btn--ghost"
              onClick={() => setAppealClicked(true)}
            >
              Appeal Suspension
            </button>
          ) : (
            <div className="sp-appeal-placeholder">
              <p>Appeal functionality coming soon.</p>
              <p>Please contact <strong>wellness@neu.edu.ph</strong> for now.</p>
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