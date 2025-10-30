import React from "react";
import { NavLink } from "react-router-dom";

function LinkItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-3 hover:bg-zinc-100 ${isActive ? 'bg-zinc-100 font-semibold' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <div className="p-4">
      <div className="mb-6 px-2">
        <div className="text-lg font-bold">Admin</div>
        <div className="text-sm text-zinc-500">Jewelry Store</div>
      </div>

      <nav className="space-y-1">
        <LinkItem to="/admin">Dashboard</LinkItem>
        <LinkItem to="/admin/users">Users</LinkItem>
        <LinkItem to="/admin/products">Products</LinkItem>
        <LinkItem to="/admin/settings">Settings</LinkItem>
      </nav>
    </div>
  );
}
