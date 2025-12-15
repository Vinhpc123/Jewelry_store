import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
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

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [printed, setPrinted] = useState(false);
  const payStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("payStatus");
  }, [location.search]);

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
      setError("Không tìm thấy đơn hàng.");
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
        setError(err?.response?.data?.message || err.message || "Không thể tải đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order?._id || actionLoading) return;
    setActionError("");
    const confirmCancel = window.confirm("Hủy đơn này? Hàng chưa giao sẽ được trả lại kho.");
    if (!confirmCancel) return;
    setActionLoading(true);
    try {
      const res = await instance.put(`/api/orders/${order._id}/cancel`);
      setOrder(res?.data || order);
    } catch (err) {
      setActionError(err?.response?.data?.message || err.message || "Hủy đơn thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!order?._id || paying) return;
    setActionError("");
    setPaying(true);
    try {
      const res = await instance.post("/api/payments/vnpay/create", { orderId: order._id });
      const url = res?.data?.paymentUrl;
      if (!url) {
        throw new Error("Không nhận được link thanh toán.");
      }
      window.location.href = url;
    } catch (err) {
      setActionError(err?.response?.data?.message || err.message || "Thanh toán online thất bại.");
    } finally {
      setPaying(false);
    }
  };

  const subtotal = (order?.items || []).reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );

  // In hóa đơn khi thanh toán online thành công
  const printReceipt = React.useCallback(
    (o) => {
      if (!o) return;
      try {
        const win = window.open("", "_blank", "width=600,height=800");
        if (!win) return;
        const rows = (o.items || [])
          .map(
            (it, idx) =>
              `<tr>
                <td style="padding:4px;border:1px solid #e5e7eb;text-align:center;">${idx + 1}</td>
                <td style="padding:4px;border:1px solid #e5e7eb;">${it.name}</td>
                <td style="padding:4px;border:1px solid #e5e7eb;text-align:right;">${(Number(it.price) || 0).toLocaleString("vi-VN")}</td>
                <td style="padding:4px;border:1px solid #e5e7eb;text-align:center;">${it.quantity}</td>
                <td style="padding:4px;border:1px solid #e5e7eb;text-align:right;">${(
                  (Number(it.price) || 0) * (Number(it.quantity) || 0)
                ).toLocaleString("vi-VN")}</td>
              </tr>`
          )
          .join("");
        const createdAtStr = o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : new Date().toLocaleString("vi-VN");
        const discount = Number(o.discount) || 0;
        const shippingFee = Number(o.shippingFee) || 0;
        const totalsHtml = `
          <div class="grid">
            <div class="card"><strong>Tạm tính:</strong> ${(subtotal || 0).toLocaleString("vi-VN")} VND</div>
            <div class="card"><strong>Giảm giá:</strong> -${discount.toLocaleString("vi-VN")} VND</div>
            <div class="card"><strong>Phí vận chuyển:</strong> ${shippingFee.toLocaleString("vi-VN")} VND</div>
            <div class="card"><strong>Tổng cộng:</strong> ${(Number(o.total) || 0).toLocaleString("vi-VN")} VND</div>
          </div>
        `;

        win.document.write(`
          <html>
            <head>
              <title>Hóa đơn thanh toán</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 12px; color: #0f172a; }
                h1 { margin: 0 0 8px; font-size: 18px; }
                h2 { margin: 12px 0 6px; font-size: 15px; }
                table { border-collapse: collapse; width: 100%; font-size: 12px; }
                th { background: #f3f4f6; border:1px solid #e5e7eb; padding:6px; text-align:left; }
                td { border:1px solid #e5e7eb; padding:6px; }
                .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
                .card { border:1px solid #e5e7eb; border-radius:8px; padding:8px; background:#f8fafc; font-size:12px; }
              </style>
            </head>
            <body>
              <h1>HÓA ĐƠN</h1>
              <div class="grid">
                <div class="card"><strong>Mã đơn:</strong> ${o._id}</div>
                <div class="card"><strong>Ngày:</strong> ${createdAtStr}</div>
                <div class="card"><strong>Khách:</strong> ${o.shipping?.fullName || ""}</div>
                <div class="card"><strong>Thanh toán:</strong> ${o.paymentMethod === "online" ? "Online (VNPAY)" : "COD"}</div>
              </div>
              <h2>Sản phẩm</h2>
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên</th>
                    <th>Đơn giá</th>
                    <th>SL</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
              <h2>Tổng cộng</h2>
              ${totalsHtml}
              <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); };</script>
            </body>
          </html>
        `);
        win.document.close();
      } catch (err) {
        console.error("Print receipt error", err);
      }
    },
    [subtotal]
  );

  React.useEffect(() => {
    if (payStatus === "success" && order && order.paymentMethod === "online" && !printed) {
      printReceipt(order);
      setPrinted(true);
    }
  }, [payStatus, order, printed, printReceipt]);

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
              <Link to="/orders" className="hover:text-[#2f241a]">
                Đơn hàng
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#2f241a] font-semibold">Chi tiết</span>
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-[#2f241a] px-3 py-1 text-xs font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white"
              >
                Quay lại
              </button>
              <h1 className="text-3xl font-bold text-[#2f241a]">Đơn {id}</h1>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
          {error ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
          ) : null}

          {payStatus === "success" ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Thanh toán online thành công.
            </div>
          ) : null}
          {payStatus === "fail" ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-100">
              Thanh toán online thất bại. Vui lòng thử lại hoặc chọn COD.
            </div>
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
                    <p className="text-sm text-[#7b6654]">Mã đơn</p>
                    <p className="text-lg font-semibold text-[#2f241a]">{order._id}</p>
                    <p className="text-xs text-[#7b6654]">
                      Ngày: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
                      STATUS_STYLE[order.status === "pending" ? "processing" : order.status] ||
                      "bg-zinc-50 text-zinc-700 ring-zinc-100"
                    }`}
                  >
                    {STATUS_LABEL[order.status === "pending" ? "processing" : order.status] ||
                      order.status ||
                      "Chưa cập nhật"}
                  </div>
                </div>
                {order.status === "processing" || order.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {order.paymentMethod === "online" ? (
                      <button
                        type="button"
                        onClick={handlePayOnline}
                        disabled={paying || actionLoading}
                        className="rounded-full border border-[#0f9d58] px-4 py-2 text-sm font-semibold text-[#0f9d58] transition hover:bg-emerald-50 disabled:opacity-60"
                      >
                        {paying ? "Đang chuyển..." : "Thanh toán VNPAY"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {actionLoading ? "Đang hủy..." : "Hủy đơn"}
                    </button>
                    {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                  <h2 className="text-lg font-semibold text-[#2f241a]">Sản phẩm</h2>
                  <ul className="divide-y divide-[#eadfce]">
                    {order.items?.map((item, idx) => (
                      <li key={`${item.productId || idx}-${idx}`} className="flex gap-4 py-4">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#f8f1e7 ]">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] text-[#7b6654]">
                              Không có ảnh
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
                  <h2 className="text-lg font-semibold text-[#2f241a]">Thông tin giao hàng</h2>
                  <div className="space-y-2 text-sm text-[#4b3d30]">
                    <p className="font-semibold text-[#2f241a]">{order.shipping?.fullName || "Chưa có tên"}</p>
                    <p>{order.shipping?.phone || "Chưa có số điện thoại"}</p>
                    <p>{order.shipping?.address || "Chưa có địa chỉ"}</p>
                    {order.shipping?.note ? <p className="text-[#7b6654]">Ghi chú: {order.shipping.note}</p> : null}
                  </div>

                  <div className="space-y-2 border-t border-[#eadfce] pt-4 text-sm text-[#4b3d30]">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span className="font-semibold text-[#9a785d]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="font-semibold text-[#9a785d]">
                        {formatCurrency(order.shippingFee || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-[#2f241a]">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                    <p className="text-xs text-[#7b6654]">
                      Phương thức: {order.paymentMethod === "online" ? "Online (VNPAY)" : "COD"}
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
