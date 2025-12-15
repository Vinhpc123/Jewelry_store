import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";
import CurrencyDisplay from "../../components/Admin/CurrencyDisplay";
import formatDateTime from "../../components/Admin/FormatDateTime";
import instance from "../../lib/api";

export default function POS() {
  const { products = [], loading } = useAdminData();
  const [search, setSearch] = React.useState("");
  const [cart, setCart] = React.useState([]);
  const [customer, setCustomer] = React.useState({ name: "", phone: "", address: "Tại cửa hàng" });
  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => (p.title || "").toLowerCase().includes(term));
  }, [products, search]);

  const addToCart = (product) => {
    if (!product?._id) return;
    setCart((prev) => {
      const existing = prev.find((it) => it.productId === product._id);
      if (existing) {
        const nextQty = existing.quantity + 1;
        const clamped = Math.min(nextQty, product.quantity || nextQty);
        return prev.map((it) => (it.productId === product._id ? { ...it, quantity: clamped } : it));
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.title,
          price: Number(product.price) || 0,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  };

  const updateQty = (id, qty, stock) => {
    const parsed = Math.max(1, Math.floor(Number(qty) || 1));
    const clamped = Math.min(parsed, stock ?? parsed);
    setCart((prev) => prev.map((it) => (it.productId === id ? { ...it, quantity: clamped } : it)));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((it) => it.productId !== id));

  const subtotal = cart.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const total = subtotal; // shippingFee = 0 cho POS

  // Khi quay lại từ VNPAY với payStatus=success, tự in hóa đơn POS
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payStatus = params.get("payStatus");
    const orderId = params.get("orderId");
    if (payStatus === "success" && orderId) {
      (async () => {
        try {
          const res = await instance.get(`/api/orders/${orderId}`);
          const order = res?.data;
          printReceipt(order, order?.items);
          setMessage("Thanh toán online POS thành công, đã in hóa đơn.");
        } catch (err) {
          setMessage(err?.response?.data?.message || err.message || "Thanh toán online thành công nhưng không in được hóa đơn.");
        } finally {
          params.delete("payStatus");
          params.delete("orderId");
          const qs = params.toString();
          const cleanUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
          window.history.replaceState({}, "", cleanUrl);
        }
      })();
    }
  }, []);

  const handleSubmit = async () => {
    setMessage("");
    if (!cart.length) {
      setMessage("Chưa có sản phẩm.");
      return;
    }
    if (!customer.name.trim()) {
      setMessage("Nhập tên khách.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await instance.post("/api/orders/pos", {
        items: cart,
        shipping: {
          fullName: customer.name,
          phone: customer.phone || "N/A",
          address: customer.address || "Tại cửa hàng",
        },
        paymentMethod,
      });
      const order = res?.data;
      if (paymentMethod === "online" && order?._id) {
        const payRes = await instance.post("/api/payments/vnpay/create", { orderId: order._id });
        const payUrl = payRes?.data?.paymentUrl;
        if (payUrl) {
          window.open(payUrl, "_blank");
          setMessage("Đã tạo đơn POS, mở trang thanh toán VNPAY.");
        } else {
          setMessage("Không nhận được link thanh toán VNPAY.");
        }
      } else {
        printReceipt(order, order?.items);
        setMessage("Tạo đơn POS thành công!");
      }
      setCart([]);
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Không thể tạo đơn POS");
    } finally {
      setSubmitting(false);
    }
  };

  const printReceipt = (order, sourceItems) => {
    try {
      const win = window.open("", "_blank", "width=600,height=800");
      if (!win) return;
      const rows = cart
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
      const createdAt = order?.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : new Date().toLocaleString("vi-VN");
      const orderId = order?._id || "N/A";
      win.document.write(`
        <html>
          <head>
            <title>Hóa đơn POS</title>
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
            <h1>HÓA ĐƠN POS</h1>
            <div class="grid">
              <div class="card"><strong>Mã đơn:</strong> ${orderId}</div>
              <div class="card"><strong>Ngày:</strong> ${createdAt}</div>
              <div class="card"><strong>Khách:</strong> ${customer.name}</div>
              <div class="card"><strong>Thanh toán:</strong> ${paymentMethod === "online" ? "Thẻ/Online" : "Tiền mặt"}</div>
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
            <div class="card"><strong>Tổng:</strong> ${total.toLocaleString("vi-VN")} VND</div>
            <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); };</script>
          </body>
        </html>
      `);
      win.document.close();
    } catch (err) {
      console.error("Print receipt error", err);
    }
  };

  return (
    <AdminRoute allowedRoles={["admin", "staff"]}>
      <AdminLayout>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h1 className="text-2xl font-bold text-zinc-900">POS tại quầy</h1>
            <p className="text-sm text-zinc-600">Bán nhanh cho khách tới cửa hàng.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  <div className="text-sm text-zinc-500">Đang tải...</div>
                ) : filtered.length === 0 ? (
                  <div className="text-sm text-zinc-500">Không có sản phẩm.</div>
                ) : (
                  filtered.map((p) => (
                    <button
                      type="button"
                      key={p._id}
                      onClick={() => addToCart(p)}
                      className="flex flex-col items-start gap-2 rounded-lg border border-zinc-200 p-3 text-left hover:border-indigo-400"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-zinc-900 line-clamp-1">{p.title}</span>
                        <span className="text-xs text-zinc-500">Kho: {p.quantity ?? 0}</span>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">
                        <CurrencyDisplay value={p.price} />
                      </span>
                      <span className="text-xs text-zinc-500">{p.category?.name || p.category || "-"}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">Giỏ hàng</h2>
                {cart.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-500">Chưa có sản phẩm.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {cart.map((item) => {
                      const stock = products.find((p) => p._id === item.productId)?.quantity;
                      return (
                        <div key={item.productId} className="flex items-start justify-between gap-2 rounded border border-zinc-200 p-2">
                          <div className="flex-1">
                            <p className="font-semibold text-zinc-900">{item.name}</p>
                            <p className="text-xs text-zinc-500">
                              <CurrencyDisplay value={item.price} /> | Kho: {stock ?? "?"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQty(item.productId, e.target.value, stock)}
                              className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
                            />
                            <button onClick={() => removeItem(item.productId)} className="text-xs text-red-600">
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">Khách / thanh toán</h2>
                <div className="mt-3 space-y-2">
                  <input
                    value={customer.name}
                    onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Tên khách"
                  />
                  <input
                    value={customer.phone}
                    onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Số điện thoại (tuỳ chọn)"
                  />
                  <input
                    value={customer.address}
                    onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))}
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Địa chỉ"
                  />
                  <div className="flex gap-3 pt-2">
                    {[
                      { value: "cod", label: "Tiền mặt" },
                      { value: "online", label: "Thẻ/Online" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          name="pay"
                          value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span className="font-semibold text-indigo-700">
                        <CurrencyDisplay value={subtotal} />
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-zinc-900">
                      <span>Tổng</span>
                      <span className="text-indigo-700">
                        <CurrencyDisplay value={total} />
                      </span>
                    </div>
                  </div>
                  {message ? <p className="text-sm text-red-600">{message}</p> : null}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || cart.length === 0}
                    className="w-full rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {submitting ? "Đang tạo đơn..." : "Tạo đơn POS"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
