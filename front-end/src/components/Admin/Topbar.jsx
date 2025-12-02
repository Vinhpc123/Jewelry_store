import React from "react";
import { getUser } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const user = getUser();
  const navigate = useNavigate();
  const displayName = user?.name || user?.email || "Admin";

  function handleLogout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (err) {
      console.warn("logout clear error", err);
    }
    navigate("/");
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
      <div className="text-sm text-zinc-600">Welcome back 🎉</div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-zinc-700">{displayName}</div>
        <button onClick={handleLogout} className="text-sm text-red-600">
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
