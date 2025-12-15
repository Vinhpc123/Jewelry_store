import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../../lib/api";

export default function AdminRoute({ children, allowedRoles = ["admin", "staff"] }) {
  const user = getUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
