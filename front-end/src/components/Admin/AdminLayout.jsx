import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 overflow-y-auto border-r bg-white lg:block">
          <Sidebar />
        </aside>

        {/* Mobile sidebar drawer */}
        <div
          className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!sidebarOpen}
        >
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-[min(85vw,320px)] overflow-y-auto bg-white shadow-xl transition-transform ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>

        <div className="flex-1">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
