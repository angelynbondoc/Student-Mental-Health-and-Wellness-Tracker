import "./AdminDashboard.css";
import { useAdminDashboard } from "../../hooks/useAdminDashboard"
import { StatCard } from "../../components/admin/UI"
import AdminTopbar from "../../components/admin/AdminTopbar"
import AdminSidebar from "../../components/admin/AdminSidebar";
import ReportedPostsTab from "../../components/admin/ReportedPostsTab"
import ReportedUsersTab from "../../components/admin/ReportedUserTab"
import UserManagementTab from "../../components/admin/UserManagementTab"
import PostReportModal from "../../components/admin/PostReportModal";
import UserReportModal from "../../components/admin/UserReportModal";

export default function AdminDashboard() {
  const {
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
  } = useAdminDashboard();

  return (
    <div className="admin-root">

      <AdminTopbar
        pendingPosts={pendingPosts}
        pendingUsers={pendingUsers}
        onMenuClick={() => setSidebarOpen((o) => !o)}
      />

      <div className="admin-body">

        <AdminSidebar
          tab={tab}
          setTab={setTab}
          sidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
          pendingPosts={pendingPosts}
          pendingUsers={pendingUsers}
          resolved={resolved}
          suspended={suspended}
        />

        <main className="admin-main">

          {/* Stats row */}
          <div className="admin-stats-grid">
            <StatCard label="Pending Post Reports" value={pendingPosts} sub="Awaiting review" accent="var(--warn)" />
            <StatCard label="Pending User Reports" value={pendingUsers} sub="Awaiting review" accent="#E65100" />
            <StatCard label="Resolved Reports"     value={resolved}     sub="All time"        accent="var(--primary)" />
            <StatCard label="Suspended Users"      value={suspended}    sub="Currently restricted" accent="var(--danger)" />
          </div>

          {tab === "reports" && (
            <ReportedPostsTab
              reports={reports}
              filter={filter}
              setFilter={setFilter}
              setSelReport={setSelReport}
              setPostModal={setPostModal}
            />
          )}

          {tab === "userreports" && (
            <ReportedUsersTab
              userReports={userReports}
              urFilter={urFilter}
              setUrFilter={setUrFilter}
              setSelUserReport={setSelUserReport}
              setUserModal={setUserModal}
            />
          )}

          {tab === "users" && (
            <UserManagementTab
              users={users}
              search={search}
              setSearch={setSearch}
              toggleUser={toggleUser}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      <PostReportModal
        report={selReport}
        mode={postModal}
        note={note}
        setNote={setNote}
        onClose={() => { setPostModal(null); setSelReport(null); setNote(""); }}
        onResolve={resolvePost}
      />

      <UserReportModal
        report={selUserReport}
        mode={userModal}
        note={note}
        setNote={setNote}
        onClose={() => { setUserModal(null); setSelUserReport(null); setNote(""); }}
        onResolve={resolveUserReport}
      />

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}

    </div>
  );
}