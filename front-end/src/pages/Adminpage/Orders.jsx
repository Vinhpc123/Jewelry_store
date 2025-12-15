import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import formatDateTime from "../../components/Admin/FormatDateTime";
import instance from "../../lib/api";

const STATUS_LABELS = {
  processing: "Đang xử lý",
  paid: "Đã thanh toán",
  shipped: "Đang giao hàng",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const SOURCE_LABELS = {
  pos: "Bán tại quầy",
  online: "Online",
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "processing", label: STATUS_LABELS.processing },
  { value: "paid", label: STATUS_LABELS.paid },
  { value: "shipped", label: STATUS_LABELS.shipped },
  { value: "completed", label: STATUS_LABELS.completed },
  { value: "cancelled", label: STATUS_LABELS.cancelled },
];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

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
        setError(err?.response?.data?.message || err.message || "Không thể tải đơn hàng.");
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
      window.alert(err?.response?.data?.message || "Cập nhật trạng thái thất bại.");
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

  const handleViewDetail = async (orderId) => {
    if (!orderId) return;
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await instance.get(`/api/orders/${orderId}`);
      setDetail(res?.data || null);
    } catch (err) {
      setDetailError(err?.response?.data?.message || err.message || "Không thể tải chi tiết đơn.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">Quản lý đơn hàng</h1>
                <p className="text-sm text-zinc-500">Xem, lọc và thay đổi trạng thái đơn.</p>
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
                  placeholder="Tìm theo mã đơn/khách"
                  className="w-48 rounded border border-zinc-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={fetchOrders}
                  className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Làm mới
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                <tr>
                  <th className="px-3 py-3 text-left">Mã đơn</th>
                  <th className="px-3 py-3 text-left">Khách</th>
                  <th className="px-3 py-3 text-left">Ngày</th>
                  <th className="px-3 py-3 text-left">Số SP</th>
                  <th className="px-3 py-3 text-left">Tổng</th>
                  <th className="px-3 py-3 text-left">Trạng thái</th>
                  <th className="px-3 py-3 text-left">Chi tiết</th>
                  <th className="px-3 py-3 text-left">Kênh</th>
                  <th className="px-3 py-3 text-left">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-zinc-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : null}
                {!loading && error ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : null}
                {!loading && !error && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-zinc-500">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  !error &&
                  filtered.map((order) => (
                    <tr key={order._id} className="hover:bg-zinc-50">
                      <td className="px-3 py-3 font-semibold text-zinc-900">{order._id}</td>
                      <td className="px-3 py-3">
                        {(() => {
                          const isPos = order.source === "pos";
                          const displayName = isPos ? order.shipping?.fullName || "Khách POS" : order.user?.name || "Khách";
                          const subText = isPos
                            ? order.shipping?.phone || order.shipping?.address || ""
                            : order.user?.email || "";
                          return (
                            <>
                              <div className="text-zinc-900">{displayName}</div>
                              <div className="text-xs text-zinc-500">{subText}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        {order.createdAt ? formatDateTime(order.createdAt) : "Chưa cập nhật"}
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{order.items?.length || 0}</td>
                      <td className="px-3 py-3 text-zinc-900 font-semibold">
                        {(Number(order.total) || 0).toLocaleString("vi-VN")} VND
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        <select
                          value={(order.status === "pending" ? "processing" : order.status) || "processing"}
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
                        <button
                          type="button"
                          onClick={() => handleViewDetail(order._id)}
                          className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                        >
                          Xem
                        </button>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        {SOURCE_LABELS[order.source] || "Online"}
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{order.paymentMethod === "online" ? "Online" : "COD"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {(detailLoading || detail || detailError) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Chi tiết đơn</h2>
                  {detail?.createdAt ? (
                    <p className="text-xs text-zinc-500">Ngày: {new Date(detail.createdAt).toLocaleString()}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Đóng
                </button>
              </div>

              {detailLoading ? <p className="mt-4 text-sm text-zinc-600">Đang tải chi tiết...</p> : null}
              {detailError ? <p className="mt-4 text-sm text-red-600">{detailError}</p> : null}

              {!detailLoading && detail && !detailError ? (
                <div className="mt-4 space-y-4 text-sm text-zinc-700">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Mã đơn</p>
                      <p className="font-semibold text-zinc-900">{detail._id}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Khách</p>
                      <p className="font-semibold text-zinc-900">
                        {detail.source === "pos" ? detail.shipping?.fullName || "Khách POS" : detail.user?.name || "Khách"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {detail.source === "pos" ? detail.shipping?.phone || detail.shipping?.address || "" : detail.user?.email || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Kênh</p>
                      <p className="font-semibold text-zinc-900">{SOURCE_LABELS[detail.source] || "Online"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Trạng thái</p>
                      <p className="font-semibold text-zinc-900">
                        {STATUS_LABELS[detail.status === "pending" ? "processing" : detail.status] || detail.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-zinc-500">Thanh toán</p>
                      <p className="font-semibold text-zinc-900">
                        {detail.paymentMethod === "online" ? "Online" : "COD"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200">
                    <div className="border-b border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900">
                      Sản phẩm
                    </div>
                    <ul className="divide-y divide-zinc-200">
                      {detail.items?.map((it, idx) => (
                        <li key={`${it.productId || idx}-${idx}`} className="flex items-center justify-between px-3 py-2">
                          <div>
                            <p className="font-semibold text-zinc-900">{it.name}</p>
                            <p className="text-xs text-zinc-500">SL: {it.quantity}</p>
                          </div>
                          <div className="text-sm font-semibold text-amber-700">
                            {(Number(it.price) * Number(it.quantity) || 0).toLocaleString("vi-VN")} VND
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-zinc-200">
                    <div className="border-b border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900">
                      Giao hàng
                    </div>
                    <div className="space-y-1 px-3 py-2">
                      <p className="font-semibold text-zinc-900">{detail.shipping?.fullName || "Chưa có tên"}</p>
                      <p>{detail.shipping?.phone || "Chưa có số điện thoại"}</p>
                      <p>{detail.shipping?.address || "Chưa có địa chỉ"}</p>
                      {detail.shipping?.note ? <p className="text-xs text-zinc-500">Ghi chú: {detail.shipping.note}</p> : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
}
