import React from "react";
import { getUser, setAuthToken, setUser } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/ToastContext";
import { LogOut, Menu } from "lucide-react";

export default function Topbar({ onOpenSidebar }) {
  const user = getUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const displayName = user?.name || user?.email || "Admin";

  function handleLogout() {
    try {
      setAuthToken(null);
      setUser(null);
      window.dispatchEvent(new Event("auth:changed"));
    } catch (err) {
      console.warn("logout clear error", err);
    }
    toast.success("Đăng xuất thành công.");
    navigate("/");
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-3 py-2 shadow-sm sm:px-6 sm:py-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
          aria-label="Mở menu"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden text-sm text-zinc-600 sm:block">Welcome back 🎉</div>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <div className="max-w-[45vw] truncate text-sm font-medium text-zinc-700 sm:max-w-none">
          {displayName}
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 sm:px-3"
          aria-label="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
