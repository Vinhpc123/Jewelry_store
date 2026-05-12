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

export default function Sidebar({ onNavigate }) {
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
        <div onClick={onNavigate}>
          <LinkItem to="/admin" end>Trang chủ</LinkItem>
        </div>
        <div onClick={onNavigate}>
          <LinkItem to="/admin/users">Quản lý người dùng</LinkItem>
        </div>
        <div onClick={onNavigate}>
          <LinkItem to="/admin/products">Quản lý sản phẩm</LinkItem>
        </div>
        <div onClick={onNavigate}>
          <LinkItem to="/admin/orders">Đơn hàng</LinkItem>
        </div>
        <div onClick={onNavigate}>
          <LinkItem to="/admin/pos">POS tại quầy</LinkItem>
        </div>
        <div onClick={onNavigate}>
          <LinkItem to="/admin/messages">Tin nhắn</LinkItem>
        </div>
        {isAdmin ? (
          <div onClick={onNavigate}>
            <LinkItem to="/admin/coupons">Phiếu giảm giá</LinkItem>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
