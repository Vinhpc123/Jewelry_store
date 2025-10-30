//trang quản lý người dùng
// trang quản lý đơn hàng
import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";
import instance from "../../lib/api";

export default function Products() {

    return (
        <AdminRoute>
            <AdminLayout>
                
            </AdminLayout>
        </AdminRoute>
    );
}
