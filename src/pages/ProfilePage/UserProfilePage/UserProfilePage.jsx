// =============================================================================
// UserProfilePage.jsx — adds Report Profile button
// =============================================================================
import React, { useContext, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppContext from "../../../AppContext";
import PostCard from "../../../components/postcard/PostCard/PostCard";
import ReportModal from "../../../components/ui/ReportModal/ReportModal";
import "./UserProfilePage.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatJoinDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
}

function StatPill({ label, value }) {
  return (
    <div className="up-stat">
      <span className="up-stat-value">{value}</span>
      <span className="up-stat-label">{label}</span>
    </div>
  );
}

function HabitCard({ habit }) {
  return (
    <div className="up-habit-card">
      <div className="up-habit-icon">{habit.emoji ?? "🌱"}</div>
      <div className="up-habit-info">
        <p className="up-habit-name">{habit.name}</p>
        <p className="up-habit-meta">
          {habit.frequency ?? "Daily"} · {habit.streak ?? 0}-day streak
        </p>
      </div>
      <div
        className="up-habit-badge"
        data-status={habit.active ? "active" : "paused"}
      >
        {habit.active ? "Active" : "Paused"}
      </div>
    </div>
  );
}

const TABS = ["Posts", "Habits", "Shared"];

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { profiles, posts, habits = [], currentUser } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("Posts");
  const [showReport, setShowReport] = useState(false);

  const profile = useMemo(
    () => profiles.find((p) => p.id === userId),
    [profiles, userId],
  );

  const userPosts = useMemo(
    () =>
      posts
        .filter(
          (p) =>
            p.author_id === userId &&
            !p.is_anonymous &&
            !p.content.startsWith("[Shared Post]:"),
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [posts, userId],
  );

  const sharedPosts = useMemo(
    () =>
      posts
        .filter(
          (p) =>
            p.author_id === userId &&
            !p.is_anonymous &&
            p.content.startsWith("[Shared Post]:"),
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [posts, userId],
  );

  const userHabits = useMemo(
    () => habits.filter((h) => h.user_id === userId),
    [habits, userId],
  );
  const isOwnProfile = currentUser?.id === userId;

  if (!profile) {
    return (
      <div className="up-not-found">
        <p>User not found.</p>
        <button className="up-back-btn" onClick={() => navigate(-1)}>
          ← Go back
        </button>
      </div>
    );
  }

  function renderTabContent() {
    if (activeTab === "Posts") {
      if (!userPosts.length)
        return <p className="up-empty">No public posts yet.</p>;
      return userPosts.map((post) => <PostCard key={post.id} post={post} />);
    }
    if (activeTab === "Habits") {
      if (!userHabits.length)
        return <p className="up-empty">No habits tracked yet.</p>;
      return userHabits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ));
    }
    if (activeTab === "Shared") {
      if (!sharedPosts.length)
        return <p className="up-empty">No shared posts yet.</p>;
      return sharedPosts.map((post) => <PostCard key={post.id} post={post} />);
    }
  }

  return (
    <>
      <div className="up-page">
        <button className="up-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="up-header-card">
          <div className="up-avatar" aria-hidden="true">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} />
            ) : (
              <span>{getInitials(profile.display_name)}</span>
            )}
          </div>

          <div className="up-identity">
            <h1 className="up-display-name">{profile.display_name}</h1>
            {profile.program && <p className="up-program">{profile.program}</p>}
            {profile.bio && <p className="up-bio">{profile.bio}</p>}
            <p className="up-joined">
              Joined {formatJoinDate(profile.created_at)}
            </p>
          </div>

          <div className="up-stats-row">
            <StatPill label="Posts" value={userPosts.length} />
            <StatPill label="Shared" value={sharedPosts.length} />
            <StatPill label="Habits" value={userHabits.length} />
          </div>

          {!isOwnProfile && (
            <button
              className="up-report-btn"
              onClick={() => setShowReport(true)}
              aria-label="Report this profile"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              Report profile
            </button>
          )}
        </div>

        <div className="up-tab-bar" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`up-tab ${activeTab === tab ? "up-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="up-tab-content" role="tabpanel">
          {renderTabContent()}
        </div>
      </div>

      {showReport && (
        <ReportModal
          type="profile"
          targetId={userId}
          onClose={() => setShowReport(false)}
          onSubmit={() => setShowReport(false)} // ← frontend only
        />
      )}
    </>
  );
}
