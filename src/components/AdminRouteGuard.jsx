import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AppContext from "../AppContext";

const AdminRouteGuard = ({ children }) => {
  const { currentUser } = useContext(AppContext)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return <Navigate to="/home" replace />
  }

  return children;
};

export default AdminRouteGuard;