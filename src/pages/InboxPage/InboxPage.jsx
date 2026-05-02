// =============================================================================
// InboxPage.jsx — Notification feed with filter tabs
// Shared: PageShell, shared.css
// Own:    InboxPage.css
// =============================================================================
import React, { useContext, useState, useEffect } from "react";
import AppContext from "../../AppContext";
import { PageShell } from "../../components/ui";
import "./InboxPage.css";

// ── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

const AVATAR_COLORS = [
  "#2E7D32", "#F5C400", "#185FA5", "#0F6E56",
  "#C62828", "#854F0B", "#533AB7",
];

function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Tag config ────────────────────────────────────────────────────────────────
const TAG_MAP = {
  like:      { label: "Like",      className: "ip-tag--like" },
  comment:   { label: "Comment",   className: "ip-tag--comment" },
  reply:     { label: "Reply",     className: "ip-tag--comment" },
  community: { label: "Community", className: "ip-tag--community" },
  join:      { label: "Joined",    className: "ip-tag--community" },
  report:    { label: "Report",    className: "ip-tag--report" },
  mood:      { label: "Mood",      className: "ip-tag--mood" },
  system:    { label: "System",    className: "ip-tag--community" },
};

function resolveType(notification) {
  const t = (notification.type || "").toLowerCase();
  if (t.includes("like"))    return "like";
  if (t.includes("comment")) return "comment";
  if (t.includes("reply"))   return "reply";
  if (t.includes("join"))    return "join";
  if (t.includes("report"))  return "report";
  if (t.includes("mood"))    return "mood";
  if (t.includes("community") || t.includes("discussion")) return "community";
  return "system";
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",       label: "All" },
  { key: "unread",    label: "Unread" },
  { key: "like",      label: "Likes" },
  { key: "comment",   label: "Comments" },
  { key: "community", label: "Community" },
];

// ── NotificationCard ──────────────────────────────────────────────────────────
function NotificationCard({ notif, onMarkRead }) {
  const type    = resolveType(notif);
  const tag     = TAG_MAP[type] || TAG_MAP.system;
  const initials = getInitials(notif.actor_name || notif.title || "MindSpace");
  const color    = avatarColor(notif.actor_name || notif.title || "");
  const isUnread = !notif.is_read;

  return (
    <div
      className={`ip-notif-card${isUnread ? " ip-notif-card--unread" : ""}`}
      onClick={() => onMarkRead(notif.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onMarkRead(notif.id)}
    >
      <div
        className="ip-notif-avatar"
        style={{ background: color, color: color === "#F5C400" ? "#1A1A1A" : "#fff" }}
      >
        {initials}
      </div>

      <div className="ip-notif-body">
        <div className="ip-notif-top">
          <span className="ip-notif-name">{notif.actor_name || "MindSpace"}</span>
          <span className="ip-notif-time">{timeAgo(notif.created_at)}</span>
        </div>
        <p
          className="ip-notif-text"
          dangerouslySetInnerHTML={{ __html: notif.message || notif.body || "" }}
        />
        <span className={`ip-notif-tag ${tag.className}`}>{tag.label}</span>
      </div>

      {isUnread && <div className="ip-notif-dot" aria-label="Unread" />}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyNotifs({ filter }) {
  const messages = {
    all:       "You're all caught up! No notifications yet.",
    unread:    "No unread notifications.",
    like:      "No likes yet. Share a post to get started!",
    comment:   "No comments yet.",
    community: "No community activity yet.",
  };
  return (
    <div className="ip-notif-empty">
      <p>{messages[filter] || "No notifications."}</p>
    </div>
  );
}

// ── InboxPage ─────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const { currentUser, notifications = [], markNotificationRead, markAllNotificationsRead } =
    useContext(AppContext);

  const [activeFilter, setActiveFilter] = useState("all");

  // Notifications that belong to current user, newest first
  const myNotifs = [...(notifications || [])]
    .filter((n) => n.user_id === currentUser?.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = myNotifs.filter((n) => !n.is_read).length;

  const filtered = myNotifs.filter((n) => {
    if (activeFilter === "all")     return true;
    if (activeFilter === "unread")  return !n.is_read;
    const type = resolveType(n);
    if (activeFilter === "like")    return type === "like";
    if (activeFilter === "comment") return type === "comment" || type === "reply";
    if (activeFilter === "community") return type === "community" || type === "join";
    return true;
  });

  function handleMarkRead(id) {
    if (typeof markNotificationRead === "function") markNotificationRead(id);
  }

  function handleMarkAll() {
    if (typeof markAllNotificationsRead === "function") markAllNotificationsRead();
  }

  return (
    <PageShell narrow>
      <div className="ip-notif-page">
        {/* Header */}
        <div className="ip-notif-header">
          <h1 className="ip-notif-heading">Notifications</h1>
          {unreadCount > 0 && (
            <button className="ip-mark-all-btn" onClick={handleMarkAll}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="ip-tabs" role="tablist">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeFilter === key}
              className={`ip-tab${activeFilter === key ? " ip-tab--active" : ""}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
              {key === "unread" && unreadCount > 0 && (
                <span className="ip-tab__badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="ip-notif-list" role="list">
          {filtered.length === 0 ? (
            <EmptyNotifs filter={activeFilter} />
          ) : (
            filtered.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onMarkRead={handleMarkRead}
              />
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}