import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import instance from "../../lib/api";

const normalizeText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

export default function DetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

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
    let ignore = false;

    if (!id) {
      setError("Không tìm thấy sản phẩm.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await instance.get(`/api/jewelry/${id}`);
        if (ignore) return;
        const data = res?.data;
        // API có thể trả về object hoặc mảng, nên lấy phần tử đầu tiên nếu là mảng
        const item = Array.isArray(data) ? data[0] : data;
        if (!item) {
          setError("Không tìm thấy dữ liệu sản phẩm.");
        } else {
          setProduct(item);
        }
      } catch (err) {
        if (ignore) return;
        setError(err?.response?.data?.message || err.message || "Không thể tải chi tiết sản phẩm.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      ignore = true;
    };
  }, [id]);

  // Fetch related products by category
  useEffect(() => {
    let ignore = false;
    if (!product) return;

    const targetCategory = normalizeText(product?.category?.name || product?.category || "");
    const currentIds = [id, product?._id, product?.id].filter(Boolean).map((v) => v.toString());

    const fetchRelated = async () => {
      setRelatedLoading(true);
      setRelatedError(null);
      try {
        const res = await instance.get("/api/jewelry");
        if (ignore) return;
        const items = Array.isArray(res.data) ? res.data : [];

        const isCurrent = (item) => {
          const itemId = item?._id || item?.id;
          if (!itemId) return false;
          return currentIds.includes(itemId.toString());
        };

        const filtered = items.filter((item) => {
          const cat = normalizeText(item?.category?.name || item?.category || "");
          const sameCategory = targetCategory ? cat === targetCategory : false;
          return !isCurrent(item) && sameCategory;
        });

        const withoutCurrent = items.filter((item) => !isCurrent(item));

        // Fallback: nếu không tìm thấy cùng category, hiển thị sản phẩm khác bất kỳ
        const listToShow = filtered.length > 0 ? filtered : withoutCurrent;
        setRelated(listToShow.slice(0, 4));
      } catch (err) {
        if (ignore) return;
        setRelatedError(err?.response?.data?.message || err.message || "Không thể tải sản phẩm liên quan.");
      } finally {
        if (!ignore) setRelatedLoading(false);
      }
    };

    fetchRelated();
    return () => {
      ignore = true;
    };
  }, [product]);

  const name = product?.title || product?.name || "Sản phẩm";
  const priceText = product?.price || product?.price === 0 ? formatCurrency(product.price) : "";
  const description = product?.description || "Mô tả sản phẩm đang được cập nhật.";
  const quantity = product?.quantity ?? 0;
  const categoryPath = useMemo(() => {
    const cat = normalizeText(product?.category?.name || product?.category || "");
    if (cat.includes("nhan")) return "/Nhan";
    if (cat.includes("day chuyen") || cat.includes("daychuyen")) return "/Daychuyen";
    if (cat.includes("vong tay") || cat.includes("vongtay")) return "/Vongtay";
    if (cat.includes("bong tai") || cat.includes("bongtai")) return "/Bongtai";
    return "/shop";
  }, [product]);

  return (
    <>
      <Header />
      <main className="bg-white text-slate-900">
        <section className="bg-[#f6f0e8]">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-10">
            <nav className="text-xs uppercase tracking-[0.2em] text-[#7b6654]">
              <Link to="/shop" className="hover:text-[#2f241a]">
                Trang chủ
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#2f241a] font-semibold">Chi tiết</span>
            </nav>
            <h1 className="text-3xl font-bold text-[#2f241a] sm:text-4xl">{name}</h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
          {error ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
          ) : null}

          {loading ? (
            <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
              <div className="aspect-square animate-pulse rounded-3xl bg-[#f2e6d7]" />
              <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                <div className="h-6 w-1/2 animate-pulse rounded bg-[#f2e6d7]" />
                <div className="h-5 w-1/3 animate-pulse rounded bg-[#f2e6d7]" />
                <div className="h-20 w-full animate-pulse rounded bg-[#f2e6d7]" />
                <div className="h-10 w-1/3 animate-pulse rounded bg-[#f2e6d7]" />
              </div>
            </div>
          ) : null}

          {!loading && !error && product ? (
            <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
              <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#eadfce]">
                <div className="relative aspect-square">
                  {product.image ? (
                    <img src={product.image} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-[#7b6654]">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                <h2 className="text-2xl font-semibold text-[#2f241a]">{name}</h2>
                {priceText ? <p className="text-xl font-bold text-[#9a785d]">{priceText}</p> : null}
                <div className="text-sm text-[#5f4a38]">
                  {quantity > 0 ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Còn hàng: {quantity}</span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Hết hàng</span>
                  )}
                </div>
                <p className="text-sm text-[#5f4a38] leading-relaxed whitespace-pre-line">{description}</p>

                <div className="grid grid-cols-1 gap-3 text-sm text-[#4b3d30] sm:grid-cols-2">
                  {product.weight ? (
                    <div className="rounded-2xl bg-[#f8f1e7] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#9c7c61]">Trọng lượng</p>
                      <p className="font-semibold text-[#2f241a]">{product.weight}</p>
                    </div>
                  ) : null}
                  {product.stone ? (
                    <div className="rounded-2xl bg-[#f8f1e7] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#9c7c61]">Loại đá/quý</p>
                      <p className="font-semibold text-[#2f241a]">{product.stone}</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="rounded-full bg-[#2f241a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                    onClick={() => addToCart(product, 1)}
                    disabled={quantity <= 0}
                  >
                    {quantity <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                  </button>
                  <Link
                    to={categoryPath}
                    className="rounded-full border border-[#2f241a] px-5 py-2 text-sm font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white"
                  >
                    Tiếp tục xem hàng
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Sản phẩm liên quan */}
        {!loading && !error && product ? (
          <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9c7c61]">Sản phẩm liên quan</p>
                <h3 className="text-2xl font-bold text-[#2f241a]">Sản phẩm liên quan</h3>
              </div>
              <Link to={categoryPath} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
                Xem thêm &gt;
              </Link>
            </div>

            {relatedError ? <p className="mt-4 text-sm text-red-600">{relatedError}</p> : null}

            {relatedLoading ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#eadfce]"
                  >
                    <div className="aspect-square rounded-xl bg-[#f2e6d7]" />
                    <div className="mt-3 h-3 w-3/4 rounded bg-[#f2e6d7]" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-[#f2e6d7]" />
                  </div>
                ))}
              </div>
            ) : null}

            {!relatedLoading && !relatedError && related.length === 0 ? (
              <p className="mt-4 text-sm text-[#eadfce]">Chưa có sản phẩm liên quan.</p>
            ) : null}

            {!relatedLoading && !relatedError && related.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => {
                  const rName = item.title || item.name || "Sản phẩm";
                  const rPrice = item.price || item.price === 0 ? formatCurrency(item.price) : "";
                  return (
                    <Link
                      key={item._id || item.id || rName}
                      to={`/detail/${item._id || item.id}`}
                      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfce] transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#eadfce ]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={rName}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#eadfce]">
                            Chưa có ảnh
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3 opacity-0 transition duration-200 group-hover:opacity-100">
                          <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#2f241a] shadow-sm">
                            Xem chi tiết
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                        <p className="text-sm font-semibold text-[#2f241a] line-clamp-2">{rName}</p>
                        {rPrice ? <p className="text-sm font-bold text-[#9a785d]">{rPrice}</p> : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
