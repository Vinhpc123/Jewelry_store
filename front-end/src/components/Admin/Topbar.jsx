import React from "react";
import { getUser } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    try {
      // kiểm tra và xóa localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (err) {
      console.warn("logout clear error", err);
    }
    navigate("/");
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
      <div className="text-sm text-zinc-600">Welcome back</div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-zinc-700">{user?.name || user?.email || 'Admin'}</div>
        <button onClick={handleLogout} className="text-sm text-red-600">Sign out</button>
      </div>
    </div>
  );
}
