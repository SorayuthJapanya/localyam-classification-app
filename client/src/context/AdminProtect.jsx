import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, authUser }) => {
  if (!authUser) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(authUser.role)) {
    return <Navigate to="/forbidden" />;
  }

  return children;
};

export default ProtectedRoute;