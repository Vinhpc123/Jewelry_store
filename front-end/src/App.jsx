import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LogPage/LoginPage";
import AdminPage from "./pages/Adminpage/Dashboard";
import NotFound from "./pages/NotFoundPage/NotFound";
import RegisterPage from "./pages/LogPage/RegisterPage";
import Products from "./pages/Adminpage/Products";
import User from "./pages/Adminpage/User";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        //Login and Register Routes
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        //Admin Routes
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/users" element={<User />} />

        //NotFound Route
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
