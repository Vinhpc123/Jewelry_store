import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../../lib/api";

export default function AdminRoute({ children }) {
  const user = getUser();
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
