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
import Coupons from "./pages/Adminpage/Coupons";
import POS from "./pages/Adminpage/POS";
import AdminRoute from "./components/Admin/AdminRoute";
import Chat from "./pages/Customerpage/Chat";
import Storefront from "./pages/Customerpage/HomePage";
import RingPage from "./pages/Customerpage/Nhan";
import NecklacesPage from "./pages/Customerpage/Daychuyen";
import BraceletsPage from "./pages/Customerpage/Vongtay";
import EarringsPage from "./pages/Customerpage/Bongtai";
import AboutPage from "./pages/Customerpage/AboutPage";
import DetailPage from "./pages/Customerpage/Detail";
import ScrollToTop from "./components/Customer/ScrollToTop";
import CartPage from "./pages/Customerpage/Cart";
import OrdersPage from "./pages/Customerpage/Orders";
import OrderDetailPage from "./pages/Customerpage/OrderDetail";
import BlogDetail from "./pages/Customerpage/BlogDetail";
import ProfilePage from "./pages/Customerpage/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
      {/* Customer first */}
      <Route path="/" element={<Storefront />} />
      <Route path="/shop" element={<Storefront />} />

      {/* Login / Register */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer Routes */}
      <Route path="/Nhan" element={<RingPage />} />
      <Route path="/Daychuyen" element={<NecklacesPage />} />
      <Route path="/Vongtay" element={<BraceletsPage />} />
      <Route path="/Bongtai" element={<EarringsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/detail/:id" element={<DetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/customer/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/products" element={<Products />} />
      <Route path="/admin/users" element={<User />} />
      <Route path="/admin/orders" element={<OrdersAdmin />} />
      <Route path="/admin/messages" element={<Messenger />} />
      <Route
        path="/admin/pos"
        element={
          <AdminRoute allowedRoles={["admin", "staff"]}>
            <POS />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/coupons"
        element={
          <AdminRoute allowedRoles={["admin"]}>
            <Coupons />
          </AdminRoute>
        }
      />

      {/* NotFound */}
      <Route path="*" element={<NotFound />} />
    </Routes>

    </BrowserRouter>
  );
}
