
import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import formatDateTime from "../../components/Admin/FormatDateTime";
import instance from "../../lib/api";

const STATUS_OPTIONS = [
  { value: "", label: "Tat ca" },
  { value: "pending", label: "Dang xu ly" },
  { value: "paid", label: "Da thanh toan" },
  { value: "shipped", label: "Da giao" },
  { value: "cancelled", label: "Da huy" },
];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);
      try {
        const query = [];
        if (statusFilter) query.push(`status=${encodeURIComponent(statusFilter)}`);
        const url = `/api/orders${query.length ? `?${query.join("&")}` : ""}`;
        const res = await instance.get(url);
        setOrders(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Khong the tai don hang.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;
    setUpdatingId(orderId);
    try {
      await instance.put(`/api/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      window.alert(err?.response?.data?.message || "Cap nhat trang thai that bai.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((ord) => {
      const id = String(ord._id || "").toLowerCase();
      const name = (ord.user?.name || ord.user?.email || "").toLowerCase();
      return id.includes(term) || name.includes(term);
    });
  }, [orders, search]);

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Quan ly don hang</h1>
                <p className="text-sm text-zinc-500">Xem, loc va thay doi trang thai don.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded border border-zinc-300 px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tim theo ma don/khach"
                  className="w-48 rounded border border-zinc-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={fetchOrders}
                  className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Lam moi
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                <tr>
                  <th className="px-3 py-3 text-left">Ma don</th>
                  <th className="px-3 py-3 text-left">Khach</th>
                  <th className="px-3 py-3 text-left">Ngay</th>
                  <th className="px-3 py-3 text-left">So SP</th>
                  <th className="px-3 py-3 text-left">Tong</th>
                  <th className="px-3 py-3 text-left">Trang thai</th>
                  <th className="px-3 py-3 text-left">Thanh toan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-zinc-500">
                      Dang tai...
                    </td>
                  </tr>
                ) : null}
                {!loading && error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : null}
                {!loading && !error && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-zinc-500">
                      Khong co don hang nao.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  !error &&
                  filtered.map((order) => (
                    <tr key={order._id} className="hover:bg-zinc-50">
                      <td className="px-3 py-3 font-semibold text-zinc-900">{order._id}</td>
                      <td className="px-3 py-3">
                        <div className="text-zinc-900">{order.user?.name || "Khach"}</div>
                        <div className="text-xs text-zinc-500">{order.user?.email || ""}</div>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        {order.createdAt ? formatDateTime(order.createdAt) : "Chua cap nhat"}
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{order.items?.length || 0}</td>
                      <td className="px-3 py-3 text-zinc-900 font-semibold">
                        {(Number(order.total) || 0).toLocaleString("vi-VN")} VND
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        <select
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm"
                        >
                          {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        {order.paymentMethod === "online" ? "Online" : "COD"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
