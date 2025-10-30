import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r">
          <Sidebar />
        </aside>

        <div className="flex-1">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
