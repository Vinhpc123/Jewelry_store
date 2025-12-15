import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import instance from "../../lib/api";

const STATUS_STYLE = {
  processing: "bg-amber-50 text-amber-700 ring-amber-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  shipped: "bg-blue-50 text-blue-700 ring-blue-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

const STATUS_LABEL = {
  processing: "Đang xử lý",
  paid: "Đã thanh toán",
  shipped: "Đang giao hàng",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = useMemo(
    () => (value) => {
      if (value === null || value === undefined || value === "") return "";
      const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
      if (Number.isNaN(num)) return "";
      return `${num.toLocaleString("vi-VN")} VND`;
    },
    []
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await instance.get("/api/orders/my");
        setOrders(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Không thể lấy danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <>
      <Header />
      <main className="bg-white text-slate-900">
        <section className="bg-[#f6f0e8]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 lg:px-10">
            <nav className="text-xs uppercase tracking-[0.2em] text-[#7b6654]">
              <Link to="/shop" className="hover:text-[#2f241a]">
                Trang chủ
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#2f241a] font-semibold">Đơn hàng của tôi</span>
            </nav>
            <h1 className="text-3xl font-bold text-[#2f241a]">Đơn hàng</h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
          {error ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
          ) : null}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#f2e6d7]" />
              ))}
            </div>
          ) : null}

          {!loading && orders.length === 0 ? (
            <div className="rounded-2xl border border-[#eadfce] bg-white p-6 text-sm text-[#7b6654]">
              Chưa có đơn hàng nào.{" "}
              <Link to="/shop" className="font-semibold text-[#2f241a] hover:underline">
                Tiếp tục mua sắm.
              </Link>
            </div>
          ) : null}

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#eadfce] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#2f241a]">Mã đơn: {order._id}</p>
                  <p className="text-xs text-[#7b6654]">
                    Ngày: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Chưa cập nhật"}
                  </p>
                  <p className="text-sm text-[#4b3d30]">
                    {order.items?.length || 0} sản phẩm · Tổng:{" "}
                    <span className="font-semibold text-[#9a785d]">{formatCurrency(order.total)}</span>
                  </p>
                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                      STATUS_STYLE[order.status === "pending" ? "processing" : order.status] ||
                      "bg-zinc-50 text-zinc-700 ring-zinc-100"
                    }`}
                  >
                    {STATUS_LABEL[order.status === "pending" ? "processing" : order.status] ||
                      order.status ||
                      "Chưa cập nhật"}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="rounded-full border border-[#2f241a] px-4 py-2 text-sm font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
