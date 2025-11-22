import React from "react";
import { NavLink } from "react-router-dom";

function LinkItem({ to, end = false, children }) {
  return (
    <NavLink
      to={to}
      end={end}
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
        <LinkItem to="/admin" end>Trang chủ</LinkItem>
        <LinkItem to="/admin/users">Quản lý người dùng</LinkItem>
        <LinkItem to="/admin/products">Quản lý sản phẩm</LinkItem>
        <LinkItem to="/admin/orders">Đơn hàng</LinkItem>
        <LinkItem to="/admin/messages">Tin nhắn</LinkItem>
        <LinkItem to="">Quản lý nội dung</LinkItem>
        <LinkItem to="">Thanh toán</LinkItem>
        <LinkItem to="/admin/settings">Cài đặt</LinkItem>

      </nav>
    </div>
  );
}

