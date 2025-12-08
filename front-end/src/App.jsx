import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LogPage/LoginPage";
import AdminPage from "./pages/Adminpage/Dashboard";
import NotFound from "./pages/NotFoundPage/NotFound";
import RegisterPage from "./pages/LogPage/RegisterPage";
import Products from "./pages/Adminpage/Products";
import User from "./pages/Adminpage/User";
import Messenger from "./pages/Adminpage/Messenger";
import Chat from "./pages/Customerpage/Chat";
import Storefront from "./pages/Customerpage/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login and Register Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Routes */}
        <Route path="/shop" element={<Storefront />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/users" element={<User />} />
        <Route path="/admin/messages" element={<Messenger />} />

        {/* Customer chat */}
        <Route path="/chat" element={<Chat />} />

        {/* NotFound Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
