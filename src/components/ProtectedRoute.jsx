import { Navigate, useLocation } from "react-router-dom";

import { getAccessToken, getStoredUser, normalizeRole } from "../api/client";

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = getAccessToken();
  const user = getStoredUser();
  const userRole = normalizeRole(user?.role || localStorage.getItem("peztz_role"));

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(userRole)) {
    if (userRole === "FACILITY") {
      return <Navigate to="/facility" replace />;
    }

    if (userRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/owner" replace />;
  }

  return children;
}

export default ProtectedRoute;
