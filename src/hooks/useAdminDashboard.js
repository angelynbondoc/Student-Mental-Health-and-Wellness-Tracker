import { useState } from "react";
import { MOCK_REPORTS, MOCK_USER_REPORTS, MOCK_USERS } from "../mockData";

export function useAdminDashboard() {
  const [tab, setTab] = useState("reports");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [urFilter, setUrFilter] = useState("pending");
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [userReports, setUserReports] = useState(MOCK_USER_REPORTS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [selReport, setSelReport] = useState(null);
  const [selUserReport, setSelUserReport] = useState(null);
  const [postModal, setPostModal] = useState(null);
  const [userModal, setUserModal] = useState(null);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resolvePost = (id, res) => {
    setReports((p) =>
      p.map((r) => (r.id === id ? { ...r, status: "resolved", resolution: res, adminNote: note } : r))
    );
    setPostModal(null);
    setSelReport(null);
    setNote("");
    showToast(res === "removed" ? "Post removed." : "Report dismissed.", res === "removed" ? "danger" : "success");
  };

  const resolveUserReport = (id, res) => {
    setUserReports((p) =>
      p.map((r) => (r.id === id ? { ...r, status: "resolved", resolution: res, adminNote: note } : r))
    );
    if (res === "suspended") {
      const rep = userReports.find((r) => r.id === id);
      if (rep) setUsers((p) => p.map((u) => (u.id === rep.reportedUser.id ? { ...u, status: "suspended" } : u)));
    }
    setUserModal(null);
    setSelUserReport(null);
    setNote("");
    showToast(res === "suspended" ? "User suspended." : "User report dismissed.", res === "suspended" ? "danger" : "success");
  };

  const toggleUser = (uid, s) => {
    setUsers((p) => p.map((u) => (u.id === uid ? { ...u, status: s } : u)));
    showToast(s === "suspended" ? "User suspended." : "User reactivated.", s === "suspended" ? "danger" : "success");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const pendingPosts = reports.filter((r) => r.status === "pending").length;
  const pendingUsers = userReports.filter((r) => r.status === "pending").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const suspended = users.filter((u) => u.status === "suspended").length;

  return {
    // state
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
    // computed
    pendingPosts, pendingUsers, resolved, suspended,
    // actions
    resolvePost, resolveUserReport, toggleUser,
  };
}