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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch reports with post and reporter info
  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          reason,
          created_at,
          post_id,
          reporter_id,
          posts_view (
            id,
            content,
            author_id,
            is_flagged,
            created_at
          ),
          reporter:profiles!reports_reporter_id_fkey (
            id,
            display_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('fetch reports error:', error)
        return
      }

      // Normalize to shape the UI expects
      const normalized = data.map(r => ({
        id: r.id,
        reason: r.reason,
        description: '',
        status: r.posts_view?.is_flagged ? 'pending' : 'resolved',
        resolution: null,
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
          name: r.reporter?.display_name ?? r.reporter?.email ?? 'Unknown',
          avatar: (r.reporter?.display_name?.[0] ?? 'U').toUpperCase(),
          program: '',
        }
      }))

      setReports(normalized)
    }

    fetchReports()
  }, [])

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

  // Add these two functions
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
    setPendingCommunities(prev => prev.filter(c => c.id !== id));
    showToast('Community rejected.', 'danger');
  };

  // Fetch all users (profiles)
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, role, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('fetch users error:', error)
        return
      }

      const normalized = data.map(u => ({
        id: u.id,
        name: u.display_name ?? u.email,
        avatar: (u.display_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase(),
        program: '',
        postCount: 0,
        reportCount: 0,
        joinedAt: u.created_at,
        status: u.role === 'suspended' ? 'suspended' : 'active',
        role: u.role,
      }))

      setUsers(normalized)
    }

    fetchUsers()
  }, [])

  // Resolve a post report — dismiss or remove post
  const resolvePost = async (id, res) => {
    const report = reports.find(r => r.id === id)

    if (res === 'removed' && report?.post?.id) {
      // Delete the post from DB
      await supabase
        .from('posts')
        .delete()
        .eq('id', report.post.id)
    } else {
      // Just unflag the post
      await supabase
        .from('posts')
        .update({ is_flagged: false })
        .eq('id', report?.post?.id)
    }

    setReports(prev =>
      prev.map(r => r.id === id
        ? { ...r, status: 'resolved', resolution: res, adminNote: note }
        : r
      )
    )
    setPostModal(null)
    setSelReport(null)
    setNote("")
    showToast(
      res === 'removed' ? 'Post removed.' : 'Report dismissed.',
      res === 'removed' ? 'danger' : 'success'
    )
  }

  // Toggle user suspend/reactivate
  const toggleUser = async (uid, status) => {
    const newRole = status === 'suspended' ? 'suspended' : 'student'

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', uid)

    if (error) {
      console.error('toggle user error:', error)
      return
    }

    setUsers(prev =>
      prev.map(u => u.id === uid ? { ...u, status } : u)
    )
    showToast(
      status === 'suspended' ? 'User suspended.' : 'User reactivated.',
      status === 'suspended' ? 'danger' : 'success'
    )
  }

  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    async function fetchUserReports() {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          reason,
          details,
          created_at,
          reporter_id,
          target_user_id,
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
        status: 'pending',
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

  const closeSidebar = () => setSidebarOpen(false)

  const pendingPosts = reports.filter(r => r.status === 'pending').length
  const resolved = reports.filter(r => r.status === 'resolved').length
  const suspended = users.filter(u => u.status === 'suspended').length
  const pendingUsers = userReports.filter(r => r.status === 'pending').length;

  return {
    tab, setTab,
    sidebarOpen, setSidebarOpen, closeSidebar,
    filter, setFilter,
    urFilter, setUrFilter,
    reports,
    userReports, // user reports coming from reports table filtered by type
    users,
    selReport, setSelReport,
    selUserReport: null, setSelUserReport: () => {},
    postModal, setPostModal,
    userModal: null, setUserModal: () => {},
    note, setNote,
    toast,
    search, setSearch,
    pendingPosts,
    pendingUsers,
    resolved,
    suspended,
    resolvePost,
    resolveUserReport: () => {},
    toggleUser,
    pendingCommunities,
    approveCommunity,
    rejectCommunity,
    pendingCommunityCount: pendingCommunities.length,
  }
}