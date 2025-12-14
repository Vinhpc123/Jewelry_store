import { useCallback, useEffect, useState } from "react";
import instance, { getStoredToken, setAuthToken } from "../api";

// Hook lay du lieu admin (users, products) cho cac trang quan ly
export default function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [systemStatus, setSystemStatus] = useState("ok");
  const [trends, setTrends] = useState({
    users: { current: 0, prev: 0, pct: 0 },
    products: { current: 0, prev: 0, pct: 0 },
    newUsers7d: { current: 0, prev: 0, pct: 0 },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, prodRes, statsRes] = await Promise.all([
        instance.get("/api/users"),
        instance.get("/api/jewelry"),
        instance.get("/api/admin/stats"),
      ]);

      const stats = statsRes.data || {};
      const pct = (cur, prev) => Math.round(((cur - prev) / Math.max(prev || 1, 1)) * 1000) / 10;

      setUsers(usersRes.data || []);
      setProducts(prodRes.data || []);
      setSystemStatus("ok");
      setTrends({
        users: {
          current: stats.users?.total ?? (usersRes.data || []).length,
          prev: stats.users?.prevTotal ?? 0,
          pct: pct(stats.users?.total ?? (usersRes.data || []).length, stats.users?.prevTotal ?? 0),
        },
        products: {
          current: stats.jewelry?.total ?? (prodRes.data || []).length,
          prev: stats.jewelry?.prevTotal ?? 0,
          pct: pct(stats.jewelry?.total ?? (prodRes.data || []).length, stats.jewelry?.prevTotal ?? 0),
        },
        newUsers7d: {
          current: stats.users?.new7d ?? 0,
          prev: stats.users?.prevNew7d ?? 0,
          pct: pct(stats.users?.new7d ?? 0, stats.users?.prevNew7d ?? 0),
        },
      });
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
    trends,
    refresh: fetchData,
  };
}
