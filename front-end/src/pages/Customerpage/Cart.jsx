import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import { useCart } from "../../context/CartContext";
import instance from "../../lib/api";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({ fullName: "", phone: "", address: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [stockMap, setStockMap] = useState({});
  const [quantityNotice, setQuantityNotice] = useState("");

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0),
    [items]
  );
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instance.get("/api/auth/profile");
        const user = res?.data || {};
        setShipping((prev) => ({
          ...prev,
          fullName: user.name || prev.fullName,
          phone: user.phone || prev.phone,
          address: user.address || prev.address,
        }));
      } catch (_err) {
        // ignore errors; fallback to manual entry
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const idsToFetch = [...new Set(items.map((it) => it.productId).filter(Boolean))];
    if (!idsToFetch.length) {
      setStockMap({});
      return;
    }
    let ignore = false;
    const fetchStocks = async () => {
      try {
        const results = await Promise.all(
          idsToFetch.map(async (pid) => {
            try {
              const res = await instance.get(`/api/jewelry/${pid}`);
              return { pid, data: res?.data };
            } catch (_err) {
              return { pid, data: null };
            }
          })
        );
        if (ignore) return;
        const nextMap = results.reduce((acc, { pid, data }) => {
          const qty = Number(data?.quantity);
          if (Number.isFinite(qty)) acc[pid] = Math.max(0, qty);
          return acc;
        }, {});
        setStockMap(nextMap);
      } catch (_err) {
        // ignore stock fetch errors
      }
    };
    fetchStocks();
    return () => {
      ignore = true;
    };
  }, [items]);

  const handleQuantityChange = (item, rawValue) => {
    const parsed = Math.max(1, Math.floor(Number(rawValue) || 1));
    const max = stockMap[item.productId];
    if (Number.isFinite(max) && parsed > max) {
      setQuantityNotice(`Chỉ còn ${max} sản phẩm trong kho cho "${item.name}".`);
      updateQuantity(item.productId, max);
      return;
    }
    setQuantityNotice("");
    updateQuantity(item.productId, parsed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!items.length) {
      setMessage("Giỏ hàng trống.");
      return;
    }
    if (!shipping.fullName || !shipping.phone || !shipping.address) {
      setMessage("Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await instance.post("/api/orders", {
        shipping,
        paymentMethod,
        shippingFee,
      });
      await clearCart();
      navigate(`/orders/${res.data?._id || ""}`, { replace: true });
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Đặt hàng thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-white text-[#2f241a]">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#7b6654]">
            <Link to="/shop" className="hover:text-[#2f241a]">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#2f241a]">Giỏ hàng</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-[#eadfce]">
              <div className="border-b border-[#eadfce] px-5 py-4">
                <h2 className="text-lg font-semibold">Sản phẩm ({itemCount})</h2>
              </div>
              {quantityNotice ? <p className="px-5 pt-3 text-sm text-red-600">{quantityNotice}</p> : null}
              {items.length === 0 ? (
                <div className="p-6 text-sm text-[#7b6654]">Giỏ hàng trống.</div>
              ) : (
                <ul className="divide-y divide-[#eadfce]">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4 px-5 py-4">
                      <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[#f8f1e7 ]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#7b6654]">
                            Không ảnh
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-[#7b6654]">{item.material || "Chất liệu: cập nhật"}</p>
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-[#7b6654]">SL:</label>
                          <input
                            type="number"
                            min="1"
                            max={
                              Number.isFinite(stockMap[item.productId]) && stockMap[item.productId] > 0
                                ? stockMap[item.productId]
                                : undefined
                            }
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item, e.target.value)}
                            className="w-16 rounded border border-[#eadfce] px-2 py-1 text-sm"
                          />
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() => removeItem(item.productId)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#9a785d]">
                        {(Number(item.price) || 0).toLocaleString("vi-VN")} VND
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]"
              onSubmit={handleSubmit}
            >
              <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
              <input
                className="rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                placeholder="Họ và tên"
                value={shipping.fullName}
                onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
              />
              <input
                className="rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                placeholder="Số điện thoại"
                value={shipping.phone}
                onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
              />
              <input
                className="rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                placeholder="Địa chỉ"
                value={shipping.address}
                onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
              />
              <textarea
                className="rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                placeholder="Ghi chú (không bắt buộc)"
                value={shipping.note}
                onChange={(e) => setShipping((s) => ({ ...s, note: e.target.value }))}
              />

              <div className="space-y-2">
                <p className="text-sm font-semibold">Phương thức thanh toán</p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Thanh toán khi nhận hàng (COD)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Thanh toán online (chưa kích hoạt)
                </label>
              </div>

              <div className="space-y-1 text-sm text-[#4b3d30]">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#9a785d]">{subtotal.toLocaleString("vi-VN")} VND</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-[#9a785d]">{shippingFee.toLocaleString("vi-VN")} VND</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#2f241a]">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString("vi-VN")} VND</span>
                </div>
              </div>

              {message ? <p className="text-sm text-red-600">{message}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#2f241a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
              >
                {submitting ? "Đang đặt..." : "Đặt hàng"}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
