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
import React, { useContext, useState } from "react";
import AppContext from "../../AppContext";
import { NotificationsPanel } from "../../components/notifications";
import { generateUUID } from "../../Mockdata";
import { PageShell, EmptyState } from "../../components/ui";
import "./InboxPage.css";

export default function InboxPage() {
  const {
    currentUser,
    profiles,
    directMessages,
    setDirectMessages,
    notifications,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("dms");
  const [openThreadId, setOpenThreadId] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const unreadAlerts = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read,
  ).length;

  // ── Build thread map ───────────────────────────────────────────────────────
  const getThreads = () => {
    const myMessages = directMessages.filter(
      (dm) =>
        dm.sender_id === currentUser.id || dm.receiver_id === currentUser.id,
    );
    const threadMap = new Map();
    myMessages.forEach((dm) => {
      const otherId =
        dm.sender_id === currentUser.id ? dm.receiver_id : dm.sender_id;
      if (!threadMap.has(otherId)) threadMap.set(otherId, []);
      threadMap.get(otherId).push(dm);
    });
    threadMap.forEach((msgs, key) => {
      threadMap.set(
        key,
        msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      );
    });
    return threadMap;
  };

  const threads = getThreads();
  const lastMsg = (msgs) => msgs[msgs.length - 1];
  const unreadInThread = (msgs) =>
    msgs.filter((dm) => dm.receiver_id === currentUser.id && !dm.is_read)
      .length;
  const getProfile = (id) => profiles.find((p) => p.id === id);

  // INSERT INTO direct_messages (id, sender_id, receiver_id, message_text, is_read, created_at)
  const handleSend = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !openThreadId) return;
    setDirectMessages((prev) => [
      ...prev,
      {
        id: generateUUID(),
        sender_id: currentUser.id,
        receiver_id: openThreadId,
        message_text: trimmed,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]);
    setMessageInput("");
  };

  const openThread = (otherId) => {
    setOpenThreadId(otherId);
    setDirectMessages((prev) =>
      prev.map((dm) =>
        dm.sender_id === otherId &&
        dm.receiver_id === currentUser.id &&
        !dm.is_read
          ? { ...dm, is_read: true }
          : dm,
      ),
    );
  };

  // ── Thread list ────────────────────────────────────────────────────────────
  const renderThreadList = () => (
    <div className="ip-thread-list">
      {threads.size === 0 ? (
        <EmptyState message="No messages yet." />
      ) : (
        [...threads.entries()].map(([otherId, messages]) => {
          const other = getProfile(otherId);
          const last = lastMsg(messages);
          const unread = unreadInThread(messages);
          return (
            <div
              key={otherId}
              className={`ip-thread${unread > 0 ? " ip-thread--unread" : ""}`}
              onClick={() => openThread(otherId)}
            >
              <div className="ip-avatar">
                {(other?.display_name ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="ip-thread-preview">
                <div className="ip-thread-row">
                  <span className="ip-thread-name">
                    {other?.display_name ?? otherId}
                  </span>
                  <span className="ip-thread-time">
                    {new Date(last.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="ip-thread-snippet">
                  {last.sender_id === currentUser.id ? "You: " : ""}
                  {last.message_text.length > 50
                    ? last.message_text.slice(0, 50) + "…"
                    : last.message_text}
                </p>
              </div>
              {unread > 0 && <span className="ip-unread-badge">{unread}</span>}
            </div>
          );
        })
      )}
    </div>
  );

  // ── Chat thread ────────────────────────────────────────────────────────────
  const renderChatThread = () => {
    const messages = threads.get(openThreadId) ?? [];
    const otherUser = getProfile(openThreadId);
    return (
      <div className="ip-chat">
        <button className="ip-back-btn" onClick={() => setOpenThreadId(null)}>
          ← Back
        </button>
        <p className="ip-chat-header">
          Chat with <strong>{otherUser?.display_name ?? openThreadId}</strong>
        </p>
        <div className="ip-bubble-list">
          {messages.map((dm) => {
            const isMine = dm.sender_id === currentUser.id;
            return (
              <div
                key={dm.id}
                className="ip-bubble-row"
                style={{ justifyContent: isMine ? "flex-end" : "flex-start" }}
              >
                <div
                  className={`ip-bubble${isMine ? " ip-bubble--mine" : " ip-bubble--theirs"}`}
                >
                  <p className="ip-bubble__text">{dm.message_text}</p>
                  <p className="ip-bubble__time">
                    {new Date(dm.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMine && (dm.is_read ? " · Read" : " · Sent")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="ip-compose">
          <input
            className="field-input"
            type="text"
            placeholder="Type a message…"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="ip-send-btn" onClick={handleSend}>
            Send 
          </button>
        </div>
      </div>
    );
  };

  return (
    <PageShell heading="Inbox" narrow>
      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="ip-tabs">
        <button
          className={`ip-tab${activeTab === "dms" ? " ip-tab--active" : ""}`}
          onClick={() => {
            setActiveTab("dms");
            setOpenThreadId(null);
          }}
        >
          Messages
        </button>
        <button
          className={`ip-tab${activeTab === "alerts" ? " ip-tab--active" : ""}`}
          onClick={() => setActiveTab("alerts")}
        >
          Alerts
          {unreadAlerts > 0 && (
            <span className="ip-tab__badge">{unreadAlerts}</span>
          )}
        </button>
      </div>

      {activeTab === "dms" &&
        (openThreadId ? renderChatThread() : renderThreadList())}
      {activeTab === "alerts" && <NotificationsPanel />}
    </PageShell>
  );
}
