import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LogPage/LoginPage";
import AdminPage from "./pages/Adminpage/Dashboard";
import NotFound from "./pages/NotFoundPage/NotFound";
import RegisterPage from "./pages/LogPage/RegisterPage";
import Products from "./pages/Adminpage/Products";
import User from "./pages/Adminpage/User";
import OrdersAdmin from "./pages/Adminpage/Orders";
import Messenger from "./pages/Adminpage/Messenger";
import Chat from "./pages/Customerpage/Chat";
import Storefront from "./pages/Customerpage/HomePage";
import RingPage from "./pages/Customerpage/Nhan";
import NecklacesPage from "./pages/Customerpage/Daychuyen";
import BraceletsPage from "./pages/Customerpage/Vongtay";
import EarringsPage from "./pages/Customerpage/Bongtai";
import AboutPage from "./pages/Customerpage/AboutPage";
import DetailPage from "./pages/Customerpage/Detail";
import ScrollToTop from "./components/ScrollToTop";
import CartPage from "./pages/Customerpage/Cart";
import OrdersPage from "./pages/Customerpage/Orders";
import OrderDetailPage from "./pages/Customerpage/OrderDetail";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Login and Register Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Routes */}
        <Route path="/shop" element={<Storefront />} />
        <Route path="/Nhan" element={<RingPage />} />
        <Route path="/Daychuyen" element={<NecklacesPage />} />
        <Route path="/Vongtay" element={<BraceletsPage />} />
        <Route path="/Bongtai" element={<EarringsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/detail/:id" element={<DetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/users" element={<User />} />
        <Route path="/admin/orders" element={<OrdersAdmin />} />
        <Route path="/admin/messages" element={<Messenger />} />

        {/* NotFound Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
