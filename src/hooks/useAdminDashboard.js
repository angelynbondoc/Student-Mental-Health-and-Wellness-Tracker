// src/hooks/useAdminDashboard.js
// Added: crisisCount — count of auto-flagged crisis posts awaiting review.
// Added: fetchUsers now actually joins program names and counts posts/reports.

import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function useAdminDashboard() {
  const [tab, setTab] = useState("reports");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [urFilter, setUrFilter] = useState("pending");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [selReport, setSelReport] = useState(null);
  const [postModal, setPostModal] = useState(null);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [pendingCommunities, setPendingCommunities] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id, reason, details, status, resolution, created_at, post_id, reporter_id,
          posts_view (
            id, content, author_id, is_flagged, created_at
          ),
          reporter:profiles!reports_reporter_id_fkey (
            id, display_name, email
          )
        `)
        .eq('type', 'post')
        .order('created_at', { ascending: false });

      if (error) { console.error('fetch reports error:', error); return; }

      const normalized = data.map(r => ({
        id: r.id,
        reason: r.reason, 
        description: r.reason === 'crisis_auto_flagged'
          ? (r.details || 'Auto-flagged: potential crisis content detected by keyword system.')
          : (r.details || ''),
        status: r.status || (r.posts_view?.is_flagged ? 'pending' : 'resolved'),
        resolution: r.resolution || null,
        adminNote: '',
        reportedAt: r.created_at,
        post: {
          id: r.post_id,
          content: r.posts_view?.content ?? '[Post unavailable]',
          author: {
            name: r.posts_view?.author_id ?? 'Anonymous',
            avatar: 'A',
            program: '',
          },
          likes: 0,
          comments: 0,
          postedAt: r.posts_view?.created_at,
        },
        reporter: {
          name: r.reporter?.display_name ?? r.reporter?.email ?? 'System (Auto-flag)',
          avatar: (r.reporter?.display_name?.[0] ?? 'S').toUpperCase(),
          program: '',
        },
      }));

      setReports(normalized);
    }
    fetchReports();
  }, []);

  useEffect(() => {
    async function fetchPendingCommunities() {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          id, name, category, emoji, status, created_at,
          creator:profiles!communities_created_by_fkey (
            id, display_name, moderation_strikes
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) { console.error('fetch pending communities error:', error); return; }
      setPendingCommunities(data ?? []);
    }
    fetchPendingCommunities();
  }, []);

  useEffect(() => {
    async function fetchPendingResources() {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          id, title, year, key_idea, findings, citation, url, created_at,
          submitter:profiles!resources_submitted_by_fkey (
            id, display_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) { console.error('fetch pending resources error:', error); return; }
      setPendingResources(data ?? []);
    }
    fetchPendingResources();
  }, []);

  const approveResource = async (id) => {
    const resource = pendingResources.find(r => r.id === id);
    const { error } = await supabase.from('resources').update({ status: 'approved' }).eq('id', id);
    if (error) { console.error(error); return; }
    setPendingResources(prev => prev.filter(r => r.id !== id));
    if (resource?.submitter?.id) {
      await supabase.from('notifications').insert({
        user_id: resource.submitter.id,
        type: 'system',
        title: 'Resource Approved',
        content: `Your resource submission "${resource.title}" has been approved and is now public!`,
      });
    }
    showToast('Resource approved!');
  };

  const rejectResource = async (id) => {
    const resource = pendingResources.find(r => r.id === id);
    const { error } = await supabase.from('resources').update({ status: 'rejected' }).eq('id', id);
    if (error) { console.error(error); return; }
    setPendingResources(prev => prev.filter(r => r.id !== id));
    if (resource?.submitter?.id) {
      await supabase.from('notifications').insert({
        user_id: resource.submitter.id,
        type: 'moderation',
        title: 'Resource Rejected',
        content: `Your resource submission "${resource.title}" was not approved by the admin.`,
      });
    }
    showToast('Resource rejected.', 'danger');
  };

  const approveCommunity = async (id) => {
    const { error } = await supabase
      .from('communities')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { console.error(error); return; }
    setPendingCommunities(prev => prev.filter(c => c.id !== id));
    showToast('Community approved!');
  };

  const rejectCommunity = async (id, reason) => {
    const { error } = await supabase
      .from('communities')
      .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { console.error(error); return; }
    const community = pendingCommunities.find(c => c.id === id);
    setPendingCommunities(prev => prev.filter(c => c.id !== id));
    if (community?.creator?.id) {
      await supabase.from('notifications').insert({
        user_id: community.creator.id,
        type: 'moderation',
        title: 'Community Proposal Rejected',
        content: reason?.trim()
          ? `Your community "${community.name}" was rejected. Reason: ${reason.trim()}`
          : `Your community "${community.name}" was rejected by an administrator.`,
      });
    }
    showToast('Community rejected.', 'danger');
  };

  useEffect(() => {
    async function fetchUsers() {
      // Parallel fetch to gather profiles, post references, and report references
      const [
        { data: profilesData, error },
        { data: postsData },
        { data: reportsData }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, email, role, created_at, program:program_id(name)')
          .order('created_at', { ascending: false }),
        supabase.from('posts').select('id, author_id'),
        supabase.from('reports').select('target_user_id, type, post_id')
      ]);

      if (error) { console.error('fetch users error:', error); return; }

      // Map out who authored which post, and tally up their total posts
      const postAuthors = {};
      const postCounts = {};
      postsData?.forEach(p => {
        if (p.id && p.author_id) {
          postAuthors[p.id] = p.author_id;
          postCounts[p.author_id] = (postCounts[p.author_id] || 0) + 1;
        }
      });

      // Tally up reports. If it's a post report, trace it back to the author.
      const reportCounts = {};
      reportsData?.forEach(r => {
        let target = r.target_user_id;
        if (r.type === 'post' && r.post_id) {
          target = postAuthors[r.post_id];
        }
        if (target) {
          reportCounts[target] = (reportCounts[target] || 0) + 1;
        }
      });

      const normalized = profilesData.map(u => ({
        id: u.id,
        name: u.display_name ?? u.email,
        avatar: (u.display_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase(),
        program: u.program?.name || '—',
        postCount: postCounts[u.id] || 0,
        reportCount: reportCounts[u.id] || 0,
        joinedAt: u.created_at,
        status: u.role === 'suspended' ? 'suspended' : 'active',
        role: u.role,
      }));

      setUsers(normalized);
    }
    fetchUsers();
  }, []);

  const [userReports, setUserReports] = useState([]);
  const [selUserReport, setSelUserReport] = useState(null);
  const [userModal, setUserModal] = useState(null);

  useEffect(() => {
    async function fetchUserReports() {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id, reason, details, created_at, reporter_id, target_user_id,
          status, resolution,
          reporter:profiles!reports_reporter_id_fkey (
            id, display_name
          ),
          target:profiles!reports_target_user_id_fkey (
            id, display_name
          )
        `)
        .eq('type', 'profile')
        .order('created_at', { ascending: false });

      if (error) { console.error('fetch user reports error:', error); return; }

      const normalized = data.map(r => ({
        id: r.id,
        reason: r.reason,
        details: r.details,
        status: r.status ?? 'pending',
        resolution: r.resolution ?? null,
        reportedAt: r.created_at,
        reporter: {
          name: r.reporter?.display_name ?? 'Unknown',
          avatar: (r.reporter?.display_name?.[0] ?? 'U').toUpperCase(),
        },
        reportedUser: {
          id: r.target_user_id,
          name: r.target?.display_name ?? 'Unknown',
          avatar: (r.target?.display_name?.[0] ?? 'U').toUpperCase(),
        },
      }));

      setUserReports(normalized);
    }
    fetchUserReports();
  }, []);

  // ── Appeals ──
  const [appeals, setAppeals] = useState([]);

  useEffect(() => {
    async function fetchAppeals() {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id, details, created_at, status, reporter_id,
          appellant:profiles!reports_reporter_id_fkey (
            id, display_name
          )
        `)
        .eq('type', 'appeal')
        .order('created_at', { ascending: false });

      if (error) { console.error('fetch appeals error:', error); return; }

      const normalized = data.map(r => ({
        id: r.id,
        details: r.details,
        status: r.status ?? 'pending',
        createdAt: r.created_at,
        appellant: {
          id: r.reporter_id,
          name: r.appellant?.display_name ?? 'Unknown',
          avatar: (r.appellant?.display_name?.[0] ?? 'U').toUpperCase(),
        },
      }));
      setAppeals(normalized);
    }
    fetchAppeals();
  }, []);

  const resolveAppeal = async (appealId, userId) => {
    await supabase.from('profiles').update({ role: 'student' }).eq('id', userId);
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', appealId);
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'moderation',
      title: 'Appeal Approved',
      content: 'Your suspension appeal has been approved. Your account has been restored.',
    });
    setAppeals(prev => prev.map(a => a.id === appealId ? { ...a, status: 'resolved' } : a));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active', role: 'student' } : u));
    showToast('Suspension lifted. User restored.');
  };

  const rejectAppeal = async (appealId) => {
    await supabase.from('reports').update({ status: 'rejected' }).eq('id', appealId);
    setAppeals(prev => prev.map(a => a.id === appealId ? { ...a, status: 'rejected' } : a));
    showToast('Appeal rejected.', 'danger');
  };

  const resolvePost = async (id, res) => {
    const report = reports.find(r => r.id === id);
    if (res === 'removed' && report?.post?.id) {
      await supabase.from('posts').delete().eq('id', report.post.id);
    } else {
      await supabase.from('posts').update({ is_flagged: false }).eq('id', report?.post?.id);
    }
    setReports(prev =>
      prev.map(r => r.id === id
        ? { ...r, status: 'resolved', resolution: res, adminNote: note }
        : r
      )
    );
    setPostModal(null);
    setSelReport(null);
    setNote("");
    showToast(
      res === 'removed' ? 'Post removed.' : 'Report dismissed.',
      res === 'removed' ? 'danger' : 'success'
    );
  };

  const toggleUser = async (uid, status) => {
    const newRole = status === 'suspended' ? 'suspended' : 'student';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', uid);
    if (error) { console.error('toggle user error:', error); return; }
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, status } : u));
    showToast(
      status === 'suspended' ? 'User suspended.' : 'User reactivated.',
      status === 'suspended' ? 'danger' : 'success'
    );
  };

  const resolveUserReport = async (id, resolution) => {
    if (resolution === "suspended") {
      const report = userReports.find(r => r.id === id);
      const uid = report?.reportedUser?.id;
      if (uid) {
        const { error } = await supabase.from("profiles").update({ role: "suspended" }).eq("id", uid);
        if (error) console.error("suspend profile error:", error);
        else {
          setUsers(prev =>
            prev.map(u => u.id === uid ? { ...u, status: "suspended", role: "suspended" } : u)
          );
          await supabase.from("notifications").insert({
            user_id: uid,
            type: "moderation",
            title: "Account Suspended",
            content: note?.trim()
              ? `Your account has been suspended. Reason: ${note.trim()}`
              : "Your account has been suspended by an administrator.",
          });
        }
      }
    }
    const { error } = await supabase.from("reports").update({ status: "resolved", resolution }).eq("id", id);
    if (error) console.error("resolve report error:", error);
    setUserReports(prev =>
      prev.map(r => r.id === id ? { ...r, status: "resolved", resolution, adminNote: note } : r)
    );
    setUserModal(null);
    setSelUserReport(null);
    setNote("");
    showToast(
      resolution === "suspended" ? "User suspended." : "Report dismissed.",
      resolution === "suspended" ? "danger" : "success"
    );
  };

  const broadcastNotification = async ({ title, message, targetType, selectedUserIds }) => {
    if (!message.trim()) { showToast('Message cannot be empty.', 'danger'); return false; }
    let recipientIds = [];
    if (targetType === 'all') {
      const { data, error } = await supabase.from('profiles').select('id').neq('role', 'suspended');
      if (error) { showToast('Failed to fetch users.', 'danger'); return false; }
      recipientIds = data.map(u => u.id);
    } else {
      recipientIds = selectedUserIds ?? [];
    }
    if (recipientIds.length === 0) { showToast('No recipients selected.', 'danger'); return false; }
    const rows = recipientIds.map(uid => ({
      user_id: uid,
      type: 'announcement',
      title: title.trim() || 'Admin Announcement',
      message: message.trim(),
      is_read: false,
    }));
    const { error } = await supabase.from('notifications').insert(rows);
    if (error) { showToast('Broadcast failed. Check console.', 'danger'); return false; }
    showToast(`Announcement sent to ${recipientIds.length} user(s)!`);
    return true;
  };

  const createAdminPost = async (content) => {
    if (!content.trim()) { showToast('Post content cannot be empty.', 'danger'); return false; }
    const { data: userData } = await supabase.auth.getSession();
    const userId = userData.session?.user?.id;
    if (!userId) { showToast('Authentication error.', 'danger'); return false; }
    const { data: general, error: genError } = await supabase
      .from('communities').select('id').eq('is_general', true).single();
    if (genError || !general) { showToast('General community not found.', 'danger'); return false; }
    const { error } = await supabase.from('posts').insert({
      author_id: userId,
      community_id: general.id,
      content: `[Admin Broadcast]\n ${content.trim()}`,
      is_anonymous: false,
      is_flagged: false,
    });
    if (error) { showToast('Failed to create post.', 'danger'); console.error(error); return false; }
    showToast('Posted to General Community!');
    return true;
  };

  const closeSidebar = () => setSidebarOpen(false);

  const pendingPosts  = reports.filter(r => r.status === 'pending').length;
  const resolved      = reports.filter(r => r.status === 'resolved').length;
  const suspended     = users.filter(u => u.status === 'suspended').length;
  const pendingUsers  = userReports.filter(r => r.status === 'pending').length;
  const appealCount   = appeals.filter(a => a.status === 'pending').length;

  // ── NEW: crisis count from auto-flagged reports ──────────────────────────
  const crisisCount = reports.filter(
    r => r.reason === 'crisis_auto_flagged' && r.status === 'pending'
  ).length;

  return {
    tab, setTab,
    sidebarOpen, setSidebarOpen, closeSidebar,
    filter, setFilter,
    urFilter, setUrFilter,
    reports, userReports, users,
    selReport, setSelReport,
    selUserReport, setSelUserReport,
    postModal, setPostModal,
    userModal, setUserModal,
    note, setNote,
    toast,
    search, setSearch,
    pendingPosts, pendingUsers, resolved, suspended,
    resolvePost, resolveUserReport, toggleUser,
    pendingCommunities,
    approveCommunity, rejectCommunity,
    pendingCommunityCount: pendingCommunities.length,
    pendingResources,
    approveResource,
    rejectResource,
    pendingResourceCount: pendingResources.length,
    broadcastNotification,
    createAdminPost,
    appeals, resolveAppeal, rejectAppeal, appealCount,
    crisisCount,
  };
}