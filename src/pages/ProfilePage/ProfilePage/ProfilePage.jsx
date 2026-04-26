// =============================================================================
// ProfilePage.jsx — refactored to use PhotoEditorModal for profile pictures
// =============================================================================
import React, { useContext, useState, useRef } from "react";
import AppContext from "../../../AppContext";
import {
  Pencil,
  Trash2,
  LogOut,
  X,
  Check,
  FileText,
  Repeat2,
  Users,
  AlertTriangle,
  Camera,
} from "lucide-react";
import PhotoEditorModal from "../Photoeditormodal/Photoeditormodal";
import "./ProfilePage.css";
import { supabase } from "../../../supabase"; // adjust path if needed

// ── Confirmation Modal ────────────────────────────────────────────────────────
const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};
function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}) {
  return (
    <div className="pp-overlay" onClick={onCancel}>
      <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
        <div
          className={`pp-modal-icon ${danger ? "pp-modal-icon--danger" : "pp-modal-icon--warn"}`}
        >
          <AlertTriangle size={22} />
        </div>
        <h3 className="pp-modal-title">{title}</h3>
        <p className="pp-modal-msg">{message}</p>
        <div className="pp-modal-actions">
          <button className="pp-btn pp-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`pp-btn ${danger ? "pp-btn--danger" : "pp-btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar display ────────────────────────────────────────────────────────────
function Avatar({ profile, size = 88, onClick }) {
  const letter = (profile?.display_name?.[0] ?? "U").toUpperCase();
  const hasPhoto = !!profile?.photo_url;

  // For uploaded photos, apply saved offset/scale
  const imgStyle =
    !profile?.is_preset && profile?.photo_offset
      ? {
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate(${profile.photo_offset.x}px, ${profile.photo_offset.y}px) scale(${profile.photo_offset.scale})`,
          transformOrigin: "center center",
        }
      : { width: "100%", height: "100%", objectFit: "cover" };

  return (
    <div
      className={`pp-avatar${onClick ? " pp-avatar--clickable" : ""}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      title={onClick ? "Change profile picture" : undefined}
    >
      {hasPhoto ? (
        <img
          src={profile.photo_url}
          alt={profile.display_name}
          style={imgStyle}
          draggable={false}
        />
      ) : (
        <span className="pp-avatar-letter" style={{ fontSize: size * 0.38 }}>
          {letter}
        </span>
      )}
      {onClick && (
        <div className="pp-avatar-edit-overlay">
          <Camera size={18} />
        </div>
      )}
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function ProfilePostCard({ post, community, onDelete, isShared }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <div className="pp-post-card">
        <div className="pp-post-meta">
          <span className="pp-post-community">
            {community?.name ?? "Unknown community"}
          </span>
          <span className="pp-post-dot">·</span>
          <span className="pp-post-date">
            {new Date(post.created_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {isShared && (
            <span className="pp-shared-tag">
              <Repeat2 size={11} /> Shared
            </span>
          )}
        </div>
        <p className="pp-post-body">{post.body ?? post.content ?? "—"}</p>
        <div className="pp-post-footer">
          <button
            className="pp-icon-btn pp-icon-btn--danger"
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={14} /> {isShared ? "Remove" : "Delete"}
          </button>
        </div>
      </div>
      {confirming && (
        <ConfirmModal
          danger
          title={isShared ? "Remove shared post?" : "Delete post?"}
          message={
            isShared
              ? "This will remove the shared post from your profile. The original post is unaffected."
              : "This will permanently delete your post. This action cannot be undone."
          }
          confirmLabel={isShared ? "Remove" : "Delete"}
          onConfirm={() => {
            onDelete(post.id);
            setConfirming(false);
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

// ── Community Row ─────────────────────────────────────────────────────────────
function CommunityRow({ community, onLeave }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <div className="pp-community-row">
        <div className="pp-community-avatar">
          {community.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="pp-community-info">
          <span className="pp-community-name">{community.name}</span>
          <span className="pp-community-desc">
            {community.description ?? "Community"}
          </span>
        </div>
        <button
          className="pp-icon-btn pp-icon-btn--danger"
          onClick={() => setConfirming(true)}
        >
          <LogOut size={14} /> Leave
        </button>
      </div>
      {confirming && (
        <ConfirmModal
          title={`Leave "${community.name}"?`}
          message="You will no longer see posts from this community in your feed. You can rejoin anytime."
          confirmLabel="Leave"
          onConfirm={() => {
            onLeave(community.id);
            setConfirming(false);
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

// ── Edit Profile Form (no photo upload here — handled by modal) ───────────────
function EditProfileForm({ profile, onSave, onCancel, onOpenPhotoModal }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");

  return (
    <div className="pp-edit-form">
      {/* Inline photo change button */}
      <div className="pp-field">
        <label className="pp-label">Profile Picture</label>
        <button
          className="pp-change-photo-btn"
          type="button"
          onClick={onOpenPhotoModal}
        >
          <Camera size={15} />
          {profile.photo_url
            ? "Change photo or avatar"
            : "Choose photo or avatar"}
        </button>
      </div>

      <div className="pp-field">
        <label className="pp-label">Display Name</label>
        <input
          className="pp-input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
          placeholder="Your display name"
        />
      </div>

      <div className="pp-field">
        <label className="pp-label">Bio</label>
        <textarea
          className="pp-textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="Tell the community a little about yourself…"
        />
        <span className="pp-char-count">{bio.length}/160</span>
      </div>

      <div className="pp-edit-actions">
        <button className="pp-btn pp-btn--ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
        <button
          className="pp-btn pp-btn--primary"
          onClick={() => {
            if (displayName.trim())
              onSave({ display_name: displayName.trim(), bio: bio.trim() });
          }}
        >
          <Check size={14} /> Save changes
        </button>
      </div>
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
const TABS = [
  { id: "posts", label: "My Posts", icon: FileText },
  { id: "shared", label: "Shared", icon: Repeat2 },
  { id: "communities", label: "Communities", icon: Users },
];

export default function ProfilePage() {
  const {
    currentUser,
    profiles,
    setProfiles,
    posts,
    setPosts,
    communities,
    setCommunities,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

  const profile = profiles.find((p) => p.id === currentUser.id) ?? {
    id: currentUser.id,
    display_name: currentUser.display_name,
    bio: "",
    photo_url: null,
  };

  const myPosts = posts.filter(
    (p) => p.user_id === currentUser.id && !p.is_shared,
  );
  const sharedPosts = posts.filter(
    (p) => p.user_id === currentUser.id && p.is_shared,
  );
  const myCommunities = communities.filter(
    (c) => c.member_ids?.includes(currentUser.id) ?? true,
  );

  // Save text fields only
  const handleSaveProfile = ({ display_name, bio }) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === currentUser.id ? { ...p, display_name, bio } : p,
      ),
    );
    setEditing(false);
  };

  // Save photo from modal
  const handleSavePhoto = ({
    photo_url,
    offsetX = 0,
    offsetY = 0,
    scale = 1,
    is_preset = false,
  }) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === currentUser.id
          ? {
              ...p,
              photo_url,
              is_preset,
              photo_offset: { x: offsetX, y: offsetY, scale },
            }
          : p,
      ),
    );
    setPhotoModal(false);
  };

  const handleDeletePost = (id) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));

  const handleLeave = (communityId) =>
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId
          ? {
              ...c,
              member_ids: (c.member_ids ?? []).filter(
                (id) => id !== currentUser.id,
              ),
            }
          : c,
      ),
    );

  const stats = [
    { label: "Posts", value: myPosts.length },
    { label: "Shared", value: sharedPosts.length },
    { label: "Communities", value: myCommunities.length },
  ];

  return (
    <div className="pp-shell">
      {/* ── Profile Header ─────────────────────────────────────────────────── */}
      <div className="pp-header">
        <div className="pp-header-bg" />
        <div className="pp-header-content">
          <div className="pp-avatar-wrap">
            <Avatar
              profile={profile}
              size={88}
              onClick={() => setPhotoModal(true)}
            />
            {currentUser.role === "admin" && (
              <span className="pp-avatar-badge">Admin</span>
            )}
          </div>

          <div className="pp-header-info">
            {editing ? (
              <EditProfileForm
                profile={profile}
                onSave={handleSaveProfile}
                onCancel={() => setEditing(false)}
                onOpenPhotoModal={() => setPhotoModal(true)}
              />
            ) : (
              <>
                <h1 className="pp-name">{profile.display_name}</h1>
                <p className="pp-bio">{profile.bio || "No bio yet."}</p>
                <div className="pp-stats">
                  {stats.map((s) => (
                    <div className="pp-stat" key={s.label}>
                      <span className="pp-stat-value">{s.value}</span>
                      <span className="pp-stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="pp-profile-actions">
                  <button
                    className="pp-btn pp-btn--outline pp-edit-btn"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil size={14} /> Edit Profile
                  </button>

                  <button
                    className="pp-btn pp-btn--ghost pp-logout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="pp-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`pp-tab${activeTab === id ? " pp-tab--active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="pp-content">
        {activeTab === "posts" && (
          <div className="pp-list">
            {myPosts.length === 0 ? (
              <div className="pp-empty">
                <FileText size={32} className="pp-empty-icon" />
                <p>You haven't posted anything yet.</p>
              </div>
            ) : (
              myPosts.map((post) => (
                <ProfilePostCard
                  key={post.id}
                  post={post}
                  isShared={false}
                  community={communities.find(
                    (c) => c.id === post.community_id,
                  )}
                  onDelete={handleDeletePost}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "shared" && (
          <div className="pp-list">
            {sharedPosts.length === 0 ? (
              <div className="pp-empty">
                <Repeat2 size={32} className="pp-empty-icon" />
                <p>No shared posts yet.</p>
              </div>
            ) : (
              sharedPosts.map((post) => (
                <ProfilePostCard
                  key={post.id}
                  post={post}
                  isShared
                  community={communities.find(
                    (c) => c.id === post.community_id,
                  )}
                  onDelete={handleDeletePost}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "communities" && (
          <div className="pp-list">
            {myCommunities.length === 0 ? (
              <div className="pp-empty">
                <Users size={32} className="pp-empty-icon" />
                <p>You haven't joined any communities.</p>
              </div>
            ) : (
              myCommunities.map((community) => (
                <CommunityRow
                  key={community.id}
                  community={community}
                  onLeave={handleLeave}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Photo Editor Modal ──────────────────────────────────────────────── */}
      {photoModal && (
        <PhotoEditorModal
          current={profile.photo_url}
          onSave={handleSavePhoto}
          onClose={() => setPhotoModal(false)}
        />
      )}
    </div>
  );
}
