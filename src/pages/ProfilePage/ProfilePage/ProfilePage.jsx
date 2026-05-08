import React, { useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
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
  MoreVertical,
  GraduationCap,
  Mail,
} from "lucide-react";
import PhotoEditorModal from "../Photoeditormodal/Photoeditormodal";
import "./ProfilePage.css";
import { supabase } from "../../../supabase";

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};

/* ─── Confirm modal ──────────────────────────────────────────────────────── */
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div className="pp-overlay" onClick={onCancel}>
      <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`pp-modal-icon ${danger ? "pp-modal-icon--danger" : "pp-modal-icon--warn"}`}>
          <AlertTriangle size={22} />
        </div>
        <h3 className="pp-modal-title">{title}</h3>
        <p className="pp-modal-msg">{message}</p>
        <div className="pp-modal-actions">
          <button className="pp-btn pp-btn--ghost" onClick={onCancel}>Cancel</button>
          <button className={`pp-btn ${danger ? "pp-btn--danger" : "pp-btn--primary"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
function Avatar({ profile, size = 96, onClick }) {
  const letter = (profile?.display_name?.[0] ?? "U").toUpperCase();
  const hasPhoto = !!profile?.photo_url;

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
        <img src={profile.photo_url} alt={profile.display_name} style={imgStyle} draggable={false} />
      ) : (
        <span className="pp-avatar-letter" style={{ fontSize: size * 0.38 }}>{letter}</span>
      )}
      {onClick && <div className="pp-avatar-edit-overlay"><Camera size={18} /></div>}
    </div>
  );
}

/* ─── Post menu (3-dot dropdown, portal-based) ───────────────────────────── */
function PostMenu({ onEdit, onDelete, isShared }) {
  const [open, setOpen]     = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef          = useRef(null);
  const dropdownRef         = useRef(null);

  // Position the dropdown relative to the trigger when opened
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 180;
    setCoords({
      top:  rect.bottom + 6,
      left: rect.right - dropdownWidth, // right-align with trigger
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleEsc    = (e) => e.key === "Escape" && setOpen(false);
    const handleScroll = () => setOpen(false); // close on scroll to keep position sane
    const handleResize = () => updatePosition();

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <div className="pp-menu">
      <button
        ref={triggerRef}
        type="button"
        className="pp-menu-trigger"
        aria-label="Post options"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="pp-menu-dropdown pp-menu-dropdown--portal"
          role="menu"
          style={{ top: coords.top, left: coords.left }}
        >
          {!isShared && (
            <button
              type="button"
              className="pp-menu-item"
              role="menuitem"
              onClick={() => { setOpen(false); onEdit?.(); }}
            >
              <Pencil size={14} /> Edit post
            </button>
          )}
          <button
            type="button"
            className="pp-menu-item pp-menu-item--danger"
            role="menuitem"
            onClick={() => { setOpen(false); onDelete?.(); }}
          >
            <Trash2 size={14} />
            {isShared ? "Remove shared post" : "Delete post"}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Inline post editor ─────────────────────────────────────────────────── */
function PostEditor({ post, onSave, onCancel }) {
  const [body, setBody] = useState(post.content ?? "");

  return (
    <div className="pp-post-editor">
      <textarea
        className="pp-post-editor-input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        autoFocus
        placeholder="What's on your mind?"
      />
      <div className="pp-post-editor-actions">
        <button className="pp-btn pp-btn--ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
        <button
          className="pp-btn pp-btn--primary"
          onClick={() => onSave(body.trim())}
          disabled={!body.trim() || body.trim() === (post.content ?? "")}
        >
          <Check size={14} /> Save changes
        </button>
      </div>
    </div>
  );
}

/* ─── Profile post card ──────────────────────────────────────────────────── */
function ProfilePostCard({ post, community, onDelete, onEdit, isShared, profile, isAnonymous }) {
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing]       = useState(false);

  const handleSaveEdit = async (newContent) => {
    await onEdit(post.id, newContent);
    setEditing(false);
  };

  const bodyText = isShared
    ? (post.content ?? "").replace(/^\[Shared Post\]:\s*/, "")
    : (post.content ?? "—");

  // Respect is_anonymous — never expose the real name/photo
  const displayName  = isAnonymous ? "Anonymous" : (profile?.display_name ?? "Unknown user");
  const displayPhoto = isAnonymous ? null       : profile?.photo_url;

  return (
    <>
      <article className="pp-post-card">
        <header className="pp-post-meta">
          <div className="pp-post-author-row">
            <div className="pp-post-author-avatar">
              {displayPhoto ? (
                <img src={displayPhoto} alt={displayName} />
              ) : (
                <span>{displayName[0].toUpperCase()}</span>
              )}
            </div>
            <div className="pp-post-author-info">
              <span className="pp-post-author-name">{displayName}</span>
              <span className="pp-post-meta-sub">
                <span className="pp-post-community">
                  {community?.name ?? "Unknown community"}
                </span>
                <span className="pp-post-dot" aria-hidden="true">·</span>
                <span className="pp-post-date">
                  {new Date(post.created_at).toLocaleDateString("en-PH", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
                {isShared && (
                  <span className="pp-shared-tag">
                    <Repeat2 size={11} /> Shared
                  </span>
                )}
              </span>
            </div>
          </div>

          {!editing && (
            <PostMenu
              isShared={isShared}
              onEdit={() => setEditing(true)}
              onDelete={() => setConfirming(true)}
            />
          )}
        </header>

        {editing ? (
          <PostEditor post={post} onSave={handleSaveEdit} onCancel={() => setEditing(false)} />
        ) : (
          <p className="pp-post-body">{bodyText}</p>
        )}
      </article>

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
          onConfirm={() => { onDelete(post.id); setConfirming(false); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

/* ─── Community row ──────────────────────────────────────────────────────── */
function CommunityRow({ community, onLeave }) {
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();
  const isGeneral = community.is_general || community.name === "General";

  return (
    <>
      <div className="pp-community-row">
        <div className="pp-community-avatar" aria-hidden="true">
          {community.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div
          className="pp-community-info"
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/home?community=${community.id}`)}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/home?community=${community.id}`)}
        >
          <span className="pp-community-name">{community.name}</span>
          <span className="pp-community-desc">{community.description ?? "Community"}</span>
        </div>
        {!isGeneral && (
          <button className="pp-icon-btn pp-icon-btn--danger" onClick={() => setConfirming(true)}>
            <LogOut size={14} /> Leave
          </button>
        )}
      </div>

      {!isGeneral && confirming && (
        <ConfirmModal
          title={`Leave "${community.name}"?`}
          message="You will no longer see posts from this community in your feed. You can rejoin anytime."
          confirmLabel="Leave"
          onConfirm={() => { onLeave(community.id); setConfirming(false); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

/* ─── Edit profile form ──────────────────────────────────────────────────── */
function EditProfileForm({ profile, onSave, onCancel, onOpenPhotoModal }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");

  return (
    <div className="pp-edit-form">
      <div className="pp-field">
        <label className="pp-label">Profile Picture</label>
        <button className="pp-change-photo-btn" type="button" onClick={onOpenPhotoModal}>
          <Camera size={15} />
          {profile.photo_url ? "Change photo or avatar" : "Choose photo or avatar"}
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
          onClick={() => { if (displayName.trim()) onSave({ display_name: displayName.trim(), bio: bio.trim() }); }}
        >
          <Check size={14} /> Save changes
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { id: "posts",       label: "My Posts",    icon: FileText },
  { id: "shared",      label: "Shared",      icon: Repeat2  },
  { id: "communities", label: "Communities", icon: Users    },
];

/* ─── Page export ────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const {
    currentUser, setCurrentUser,
    profiles, setProfiles,
    posts, setPosts,
    communities, setCommunities,
  } = useContext(AppContext);

  const [activeTab, setActiveTab]   = useState("posts");
  const [editing, setEditing]       = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

  const [originalAuthors, setOriginalAuthors] = useState({});

  const profile = profiles.find((p) => p.id === currentUser.id) ?? {
    id: currentUser.id,
    display_name: currentUser.display_name,
    bio: currentUser.bio ?? "",
    avatar_url: currentUser.avatar_url ?? null,
  };

  const myPosts = posts.filter(
    (p) =>
      p.author_id === currentUser.id &&
      !p.content?.startsWith("[Shared Post]:") &&
      !p.content?.startsWith("[Admin Broadcast]\n"),
  );
  const sharedPosts = posts.filter(
    (p) => p.author_id === currentUser.id && p.content?.startsWith("[Shared Post]:"),
  );
  const myCommunities = communities;

  useEffect(() => {
    if (sharedPosts.length === 0) return;

    async function fetchOriginalAuthors() {
      const withId    = sharedPosts.filter((p) => p.original_author_id);
      const withoutId = sharedPosts.filter((p) => !p.original_author_id);

      const postMeta = {};
      withId.forEach((sp) => {
        postMeta[sp.id] = { authorId: sp.original_author_id, isAnonymous: sp.is_anonymous ?? false };
      });

      if (withoutId.length > 0) {
        const stripped = withoutId.map((p) => p.content.replace(/^\[Shared Post\]:\s*/, ""));
        const { data: originalPosts } = await supabase
          .from("posts")
          .select("id, author_id, content, is_anonymous")
          .in("content", stripped);

        if (originalPosts) {
          const contentMap = {};
          originalPosts.forEach((op) => { contentMap[op.content] = op; });
          withoutId.forEach((sp) => {
            const key = sp.content.replace(/^\[Shared Post\]:\s*/, "");
            const orig = contentMap[key];
            if (orig) {
              postMeta[sp.id] = { authorId: orig.author_id, isAnonymous: orig.is_anonymous ?? false };
            }
          });
        }
      }

      const authorIds = [
        ...new Set(Object.values(postMeta).map((m) => m.authorId).filter(Boolean)),
      ];

      const profileMap = {};
      if (authorIds.length > 0) {
        const { data: fetchedProfiles } = await supabase
          .from("profiles")
          .select("id, display_name, photo_url")
          .in("id", authorIds);
        if (fetchedProfiles) fetchedProfiles.forEach((p) => { profileMap[p.id] = p; });
      }

      const result = {};
      Object.entries(postMeta).forEach(([postId, { authorId, isAnonymous }]) => {
        result[postId] = {
          profile:     authorId ? (profileMap[authorId] ?? null) : null,
          isAnonymous,
        };
      });

      setOriginalAuthors(result);
    }

    fetchOriginalAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedPosts.length]);

  const handleSaveProfile = async ({ display_name, bio }) => {
    const { error } = await supabase.from("profiles").update({ display_name, bio }).eq("id", currentUser.id);
    if (error) { console.error("save failed:", error); return; }
    setProfiles((prev) => prev.map((p) => p.id === currentUser.id ? { ...p, display_name, bio } : p));
    setCurrentUser((prev) => ({ ...prev, display_name, bio }));
    setEditing(false);
  };

  const handleSavePhoto = async ({ photo_url, offsetX = 0, offsetY = 0, scale = 1, is_preset = false }) => {
    let finalUrl = photo_url;
    if (!is_preset) {
      const res = await fetch(photo_url);
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      const filePath = `${currentUser.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(filePath, blob, { upsert: true, contentType: blob.type });
      if (uploadError) { console.error("upload failed:", uploadError); return; }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      finalUrl = publicUrl;
    }
    const { error } = await supabase.from("profiles").update({ photo_url: finalUrl }).eq("id", currentUser.id);
    if (error) { console.error("photo save failed:", error); return; }
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === currentUser.id
          ? { ...p, photo_url: finalUrl, is_preset, photo_offset: { x: offsetX, y: offsetY, scale } }
          : p,
      ),
    );
    setCurrentUser((prev) => ({ ...prev, photo_url: finalUrl }));
    setPhotoModal(false);
  };

  const handleDeletePost = async (id) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { console.error("delete error:", error); return; }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEditPost = async (id, newContent) => {
    const { error } = await supabase.from("posts").update({ content: newContent }).eq("id", id);
    if (error) { console.error("edit error:", error); return; }
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, content: newContent } : p)));
  };

  const handleLeave = async (communityId) => {
    const { error } = await supabase
      .from("community_members").delete()
      .eq("community_id", communityId).eq("user_id", currentUser.id);
    if (error) { console.error("leave error:", error); return; }
    setCommunities((prev) => prev.filter((c) => c.id !== communityId));
  };

  const stats = [
    { label: "Posts",       value: myPosts.length       },
    { label: "Shared",      value: sharedPosts.length   },
    { label: "Communities", value: myCommunities.length },
  ];

  const activeCount =
    activeTab === "posts"  ? myPosts.length :
    activeTab === "shared" ? sharedPosts.length :
    myCommunities.length;

  return (
    <div className="pp-shell">
      <header className="pp-header">
        <div className="pp-header-bg" aria-hidden="true">
          <div className="pp-header-bg__pattern" aria-hidden="true" />
        </div>

        <div className="pp-header-content">
          <div className="pp-avatar-wrap">
            <Avatar profile={profile} size={104} onClick={() => setPhotoModal(true)} />
            {currentUser.role === "admin" && <span className="pp-avatar-badge">Admin</span>}
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
                <div className="pp-identity">
                  <h1 className="pp-name">{profile.display_name}</h1>
                  {profile.program && (
                    <p className="pp-program">
                      <GraduationCap size={13} strokeWidth={2.2} aria-hidden="true" />
                      <span>{profile.program.name}</span>
                      {profile.program.college?.name && (
                        <>
                          <span className="pp-program-dot" aria-hidden="true">·</span>
                          <span className="pp-program-college">{profile.program.college.name}</span>
                        </>
                      )}
                    </p>
                  )}
                  {currentUser.email && (
                    <p className="pp-email">
                      <Mail size={12} strokeWidth={2.2} aria-hidden="true" />
                      {currentUser.email}
                    </p>
                  )}
                </div>

                <p className={`pp-bio ${!profile.bio ? "pp-bio--empty" : ""}`}>
                  {profile.bio || "No bio yet — click edit to add one."}
                </p>

                <div className="pp-stats">
                  {stats.map((s, i) => (
                    <React.Fragment key={s.label}>
                      <div className="pp-stat">
                        <span className="pp-stat-value">{s.value}</span>
                        <span className="pp-stat-label">{s.label}</span>
                      </div>
                      {i < stats.length - 1 && <div className="pp-stat-divider" aria-hidden="true" />}
                    </React.Fragment>
                  ))}
                </div>

                <div className="pp-profile-actions">
                  <button className="pp-btn pp-btn--outline" onClick={() => setEditing(true)}>
                    <Pencil size={14} /> Edit Profile
                  </button>
                  <button className="pp-btn pp-btn--logout" onClick={handleLogout}>
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="pp-tabs" aria-label="Profile sections">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const count =
            tab.id === "posts"  ? myPosts.length :
            tab.id === "shared" ? sharedPosts.length :
            myCommunities.length;
          return (
            <button
              key={tab.id}
              className={`pp-tab${activeTab === tab.id ? " pp-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <TabIcon size={15} strokeWidth={2} />
              <span>{tab.label}</span>
              <span className="pp-tab-count">{count}</span>
            </button>
          );
        })}
      </nav>

      <div className="pp-content">
        {activeTab === "posts" && (
          <div className="pp-list">
            {myPosts.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon-ring" aria-hidden="true"><FileText size={26} strokeWidth={1.6} /></div>
                <p className="pp-empty-heading">No posts yet</p>
                <p className="pp-empty-body">Share your first thought with the community.</p>
              </div>
            ) : (
              myPosts.map((post) => (
                <ProfilePostCard
                  key={post.id}
                  post={post}
                  isShared={false}
                  isAnonymous={false}
                  profile={profile}
                  community={communities.find((c) => c.id === post.community_id)}
                  onDelete={handleDeletePost}
                  onEdit={handleEditPost}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "shared" && (
          <div className="pp-list">
            {sharedPosts.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon-ring" aria-hidden="true"><Repeat2 size={26} strokeWidth={1.6} /></div>
                <p className="pp-empty-heading">No shared posts yet</p>
                <p className="pp-empty-body">Posts you share from the community will appear here.</p>
              </div>
            ) : (
              sharedPosts.map((post) => {
                const meta        = originalAuthors[post.id];
                const origProfile = meta?.profile ?? null;
                const isAnonymous = meta?.isAnonymous ?? false;

                return (
                  <ProfilePostCard
                    key={post.id}
                    post={post}
                    isShared
                    isAnonymous={isAnonymous}
                    profile={origProfile ?? { display_name: "Unknown user" }}
                    community={communities.find((c) => c.id === post.community_id)}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                  />
                );
              })
            )}
          </div>
        )}

        {activeTab === "communities" && (
          <div className="pp-list">
            {myCommunities.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon-ring" aria-hidden="true"><Users size={26} strokeWidth={1.6} /></div>
                <p className="pp-empty-heading">No communities joined</p>
                <p className="pp-empty-body">Browse communities to find your people.</p>
              </div>
            ) : (
              myCommunities.map((community) => (
                <CommunityRow key={community.id} community={community} onLeave={handleLeave} />
              ))
            )}
          </div>
        )}
      </div>

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