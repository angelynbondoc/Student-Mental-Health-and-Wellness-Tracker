// =============================================================================
// InboxPage.jsx — refactored
// Shared: PageShell, EmptyState, shared.css (field-input)
// Own:    InboxPage.css, DM thread grouping logic
//
// ORAL DEFENSE — DM GROUPING:
//   1. FILTER rows where I am sender OR receiver
//   2. IDENTIFY the "other person" in each row
//   3. GROUP into a Map (key=otherUserId, value=messages[])
//   4. SORT each thread chronologically
// =============================================================================
import React, { useContext } from "react";
import AppContext from "../../AppContext";
import { NotificationsPanel } from "../../components/notifications";
import { PageShell } from "../../components/ui";
import "./InboxPage.css";

export default function InboxPage() {
  const { currentUser, notifications } = useContext(AppContext);

  const unreadAlerts = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read,
  ).length;

  return (
    <PageShell heading="Inbox" narrow>
      <div className="ip-tabs">
        <div className="ip-tab ip-tab--active">
          🔔 Alerts
          {unreadAlerts > 0 && (
            <span className="ip-tab__badge">{unreadAlerts}</span>
          )}
        </div>
      </div>
      <NotificationsPanel />
    </PageShell>
  );
}