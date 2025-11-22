import { useCallback, useEffect, useState } from "react";
import instance, { getStoredToken, setAuthToken } from "../api";

// Hook lay du lieu admin (users, products) cho cac trang quan ly
export default function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [systemStatus, setSystemStatus] = useState("ok");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, prodRes] = await Promise.all([
        instance.get("/api/users"),
        instance.get("/api/jewelry"),
      ]);

      setUsers(usersRes.data || []);
      setProducts(prodRes.data || []);
      setSystemStatus("ok");
      setError(null);
    } catch (err) {
      console.error("useAdminData fetch error", err);
      setError(err?.response?.data?.message || err.message || "Loi khi tai du lieu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) setAuthToken(token);
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    users,
    products,
    usersCount: users.length,
    productsCount: products.length,
    systemStatus,
    refresh: fetchData,
  };
}
