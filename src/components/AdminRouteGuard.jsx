import { Navigate } from "react-router-dom";

const AdminRouteGuard = ({ children }) => {
  const isAdmin = true; // replace with your actual auth check later

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRouteGuard;
