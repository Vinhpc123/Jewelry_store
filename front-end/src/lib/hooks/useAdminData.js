//dùng để gom dữ liệu và trạng thái liên quan đến admin
import { useCallback, useEffect, useState } from "react";
import instance, { getStoredToken, setAuthToken } from "../api";

// Hook chính
export default function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  //dùng để tải lại dữ liệu
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes = await instance.get("/api/users");
      setUsers(usersRes.data || []);

      const prodRes = await instance.get("/api/jewelry");
      setProducts(prodRes.data || []);

      setError(null);
    } catch (err) {
      console.error("useAdminData fetch error", err);
      setError(err?.response?.data?.message || err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);
  // Khởi động hook: lấy token và tải dữ liệu
  useEffect(() => {
    const token = getStoredToken();
    if (token) setAuthToken(token);
    fetchData();
  }, [fetchData]);
  // Trả về dữ liệu và trạng thái
  return {
    loading,
    error,
    users,
    products,
    usersCount: users.length,
    productsCount: products.length,
    refresh: fetchData,
  };
}
