import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import { useCart } from "../../context/CartContext";
import instance from "../../lib/api";
import { useToast } from "../../components/ui/ToastContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipping, setShipping] = useState({ fullName: "", phone: "", address: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [stockMap, setStockMap] = useState({});
  const [quantityNotice, setQuantityNotice] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0),
    [items]
  );
  const shippingFee = 0;
  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  // Prefill shipping info
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
        // ignore errors; allow manual entry
      }
    };
    fetchProfile();
  }, []);

  // Fetch latest stock numbers for items in cart
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

  // nếu subtotal thay đổi thì reset coupon
  useEffect(() => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponError("");
  }, [subtotal]);

  const handleQuantityChange = (item, rawValue) => {
    const parsed = Math.max(1, Math.floor(Number(rawValue) || 1));
    const max = stockMap[item.productId];
    if (Number.isFinite(max) && parsed > max) {
      setQuantityNotice(`Chỉ còn ${max} sản phẩm trong kho cho "${item.name}".`);
      toast.warning("Vượt quá số lượng tồn kho", { description: `Chỉ còn ${max} sản phẩm.` });
      updateQuantity(item.productId, max);
      return;
    }
    setQuantityNotice("");
    updateQuantity(item.productId, parsed);
    toast.success("Cập nhật số lượng giỏ hàng thành công");
  };
  const incrementQuantity = (item) => {
    const current = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const max = stockMap[item.productId];
    if (Number.isFinite(max) && current >= max) {
      setQuantityNotice(`Chi con ${max} san pham trong kho cho "${item.name}".`);
      toast.warning("Vuot qua so luong ton kho", { description: `Chi con ${max} san pham.` });
      return;
    }
    setQuantityNotice("");
    handleQuantityChange(item, current + 1);
  };

  const decrementQuantity = (item) => {
    const current = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const next = Math.max(1, current - 1);
    if (next === current) return;
    setQuantityNotice("");
    handleQuantityChange(item, next);
  };

  const handleRemoveItem = async (item) => {
    await removeItem(item.productId);
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const applyCoupon = async () => {
    setCouponError("");
    setCouponDiscount(0);
    setCouponApplied(false);
    const code = couponCode.trim();
    if (!code) {
      setCouponError("Vui lòng nhập mã.");
      return;
    }
    setApplyingCoupon(true);
    try {
      const res = await instance.post("/api/coupons/validate", { code, subtotal });
      const discount = res?.data?.discount || 0;
      setCouponDiscount(discount);
      setCouponApplied(true);
    } catch (err) {
      setCouponError(err?.response?.data?.message || err.message || "Không áp dụng được mã.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!items.length) {
      setMessage("Giỏ hàng trống.");
      toast.error("Giỏ hàng trống.");
      return;
    }
    if (!shipping.fullName || !shipping.phone || !shipping.address) {
      setMessage("Vui lòng nhập họ tên, số điện thoại và địa chỉ.");
      toast.error("Vui lòng nhập họ tên, số điện thoại và địa chỉ.");
      return;
    }
    const trimmedPhone = String(shipping.phone || "").trim();
    if (!phoneRegex.test(trimmedPhone)) {
      setMessage("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03,05,07,08,09).");
      toast.error("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03,05,07,08,09).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await instance.post("/api/orders", {
        shipping,
        paymentMethod,
        shippingFee,
        couponCode: couponApplied ? couponCode : "",
      });
      const orderId = res.data?._id;
      if (!orderId) {
        throw new Error("Không nhận được mã đơn.");
      }
      await clearCart();

      if (paymentMethod === "online") {
      toast.info("Đang chuyển đến trang thanh toán VNPAY...");
        const payRes = await instance.post("/api/payments/vnpay/create", { orderId });
        const payUrl = payRes?.data?.paymentUrl;
        if (!payUrl) {
          throw new Error("Không nhận được đường dẫn thanh toán.");
        }
        window.location.href = payUrl;
        return;
      }

      toast.success("Đặt hàng thành công.");
      navigate("/orders", { replace: true });
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Đặt hàng thất bại.");
      toast.error(err?.response?.data?.message || err.message || "Đặt hàng thất bại.");
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

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
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
                    <li key={item.productId} className="flex gap-3 px-5 py-3">
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
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-[#7b6654]">{item.material || "Chat lieu: cap nhat sau"}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="text-xs text-[#7b6654]">SL:</label>
                          <div className="flex items-center rounded-full border border-[#eadfce] bg-white px-1 py-0.5">
                            <button
                              type="button"
                              aria-label="Giam so luong"
                              className="h-6 w-6 rounded-full text-sm text-[#7b6654] hover:bg-[#f8f1e7]"
                              onClick={() => decrementQuantity(item)}
                            >
                              -
                            </button>
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
                              className="w-12 appearance-none border-none bg-transparent text-center text-sm focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              aria-label="Tang so luong"
                              className="h-6 w-6 rounded-full text-sm text-[#7b6654] hover:bg-[#f8f1e7]"
                              onClick={() => incrementQuantity(item)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                            onClick={() => handleRemoveItem(item)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      <div className="min-w-[110px] text-right text-sm font-semibold text-[#9a785d]">
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
                type="tel"
                className="rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                placeholder="Số điện thoại"
                value={shipping.phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setShipping((s) => ({ ...s, phone: digitsOnly }));
                }}
                inputMode="numeric"
                pattern="^(03|05|07|08|09)[0-9]{8}$"
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
                  Thanh toán online qua VNPAY
                </label>
                <p className="text-xs text-[#7b6654]">
                  Chọn VNPAY để chuyển sang trang thanh toán an toàn sau khi đặt đơn.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-[#eadfce] bg-[#f9f3ea] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7b6654]">Mã giảm giá</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="NHAPMA"
                    className="h-9 flex-1 rounded-lg border border-[#eadfce] px-3 text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="h-9 rounded-lg bg-[#2f241a] px-3 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {applyingCoupon ? "Đang áp..." : "Áp dụng mã"}
                  </button>
                </div>
                {couponError ? <p className="mt-1 text-xs text-red-600">{couponError}</p> : null}
                {couponApplied && !couponError ? <p className="mt-1 text-xs text-emerald-700">Đã áp dụng mã.</p> : null}
              </div>

              <div className="space-y-2 rounded-2xl bg-[#fdf7ef] px-4 py-3 text-sm text-[#4b3d30]">
                <div className="flex justify-between">
                  <span>Thành tiền</span>
                  <span className="font-semibold text-[#9a785d]">{subtotal.toLocaleString("vi-VN")} VND</span>
                </div>
                {couponApplied ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Giảm giá</span>
                    <span>-{couponDiscount.toLocaleString("vi-VN")} VND</span>
                  </div>
                ) : null}
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
                className="w-full rounded-full bg-[#2f241a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
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


