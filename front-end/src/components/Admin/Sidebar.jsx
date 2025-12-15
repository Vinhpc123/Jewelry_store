import React from "react";
import { NavLink } from "react-router-dom";
import { getUser } from "../../lib/api";

function LinkItem({ to, end = false, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block px-4 py-3 hover:bg-zinc-100 ${isActive ? "bg-zinc-100 font-semibold" : ""}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  const user = getUser();
  const role = user?.role || "customer";
  const isAdmin = role === "admin";
  const roleLabel = isAdmin ? "Admin" : role === "staff" ? "Staff" : "User";

  return (
    <div className="p-4">
      <div className="mb-6 px-2">
        <div className="text-lg font-bold">{roleLabel}</div>
        <div className="text-sm text-zinc-500">Jewelry Store</div>
      </div>

      <nav className="space-y-1">
        <LinkItem to="/admin" end>Trang chủ</LinkItem>
        <LinkItem to="/admin/users">Quản lý người dùng</LinkItem>
        <LinkItem to="/admin/products">Quản lý sản phẩm</LinkItem>
        <LinkItem to="/admin/orders">Đơn hàng</LinkItem>
        <LinkItem to="/admin/pos">POS tại quầy</LinkItem>
        <LinkItem to="/admin/messages">Tin nhắn</LinkItem>
        {isAdmin ? <LinkItem to="/admin/coupons">Phiếu giảm giá</LinkItem> : null}
      </nav>
    </div>
  );
}
