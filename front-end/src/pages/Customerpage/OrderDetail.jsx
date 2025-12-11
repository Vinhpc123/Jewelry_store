import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import instance from "../../lib/api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
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
    if (!id) {
      setError("Khong tim thay don hang.");
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await instance.get(`/api/orders/${id}`);
        setOrder(res?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Khong the tai don hang.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const statusStyle = {
    pending: "bg-amber-50 text-amber-700 ring-amber-100",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    shipped: "bg-blue-50 text-blue-700 ring-blue-100",
    cancelled: "bg-red-50 text-red-700 ring-red-100",
  };

  const statusLabel = {
    pending: "Dang xu ly",
    paid: "Da thanh toan",
    shipped: "Da giao",
    cancelled: "Da huy",
  };

  const subtotal = (order?.items || []).reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );

  return (
    <>
      <Header />
      <main className="bg-white text-slate-900">
        <section className="bg-[#f6f0e8]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 lg:px-10">
            <nav className="text-xs uppercase tracking-[0.2em] text-[#7b6654]">
              <Link to="/shop" className="hover:text-[#2f241a]">
                Trang chu
              </Link>
              <span className="mx-2">/</span>
              <Link to="/orders" className="hover:text-[#2f241a]">
                Don hang
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#2f241a] font-semibold">Chi tiet</span>
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-[#2f241a] px-3 py-1 text-xs font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white"
              >
                Quay lai
              </button>
              <h1 className="text-3xl font-bold text-[#2f241a]">Don {id}</h1>
            </div>
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

          {!loading && order ? (
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#7b6654]">Ma don</p>
                    <p className="text-lg font-semibold text-[#2f241a]">{order._id}</p>
                    <p className="text-xs text-[#7b6654]">
                      Ngay: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Chua cap nhat"}
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${statusStyle[order.status] || "bg-zinc-50 text-zinc-700 ring-zinc-100"}`}
                  >
                    {statusLabel[order.status] || order.status || "Chua cap nhat"}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                  <h2 className="text-lg font-semibold text-[#2f241a]">San pham</h2>
                  <ul className="divide-y divide-[#eadfce]">
                    {order.items?.map((item, idx) => (
                      <li key={`${item.productId || idx}-${idx}`} className="flex gap-4 py-4">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#f8f1e7]">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] text-[#7b6654]">
                              Khong anh
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-sm font-semibold text-[#2f241a]">{item.name}</p>
                          <p className="text-xs text-[#7b6654]">SL: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-[#9a785d]">
                          {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                  <h2 className="text-lg font-semibold text-[#2f241a]">Thong tin giao hang</h2>
                  <div className="space-y-2 text-sm text-[#4b3d30]">
                    <p className="font-semibold text-[#2f241a]">{order.shipping?.fullName || "Chua co ten"}</p>
                    <p>{order.shipping?.phone || "Chua co so dien thoai"}</p>
                    <p>{order.shipping?.address || "Chua co dia chi"}</p>
                    {order.shipping?.note ? <p className="text-[#7b6654]">Ghi chu: {order.shipping.note}</p> : null}
                  </div>

                  <div className="space-y-2 border-t border-[#eadfce] pt-4 text-sm text-[#4b3d30]">
                    <div className="flex justify-between">
                      <span>Tam tinh</span>
                      <span className="font-semibold text-[#9a785d]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phi van chuyen</span>
                      <span className="font-semibold text-[#9a785d]">
                        {formatCurrency(order.shippingFee || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-[#2f241a]">
                      <span>Tong cong</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                    <p className="text-xs text-[#7b6654]">
                      Phuong thuc: {order.paymentMethod === "online" ? "Online" : "COD"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
