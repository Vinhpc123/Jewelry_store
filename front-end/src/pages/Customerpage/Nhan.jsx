// Trang Nhẫn - RingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import instance from "../../lib/api";

const priceRanges = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "under2", label: "Dưới 2.000.000đ", max: 2_000_000 },
  { id: "2to5", label: "2.000.000đ - 5.000.000đ", min: 2_000_000, max: 5_000_000 },
  { id: "over5", label: "Trên 5.000.000đ", min: 5_000_000 },
];

const sortOptions = [
  { id: "newest", label: "Mới nhất" },
  { id: "price-asc", label: "Giá tăng dần" },
  { id: "price-desc", label: "Giá giảm dần" },
];

export default function RingPage() {
  const [rings, setRings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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
    const fetchRings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await instance.get("/api/jewelry", { params: { category: "Nhẫn" } }); 
        if (ignore) return;
        const items = Array.isArray(res.data) ? res.data : [];
        setRings(items);
      } catch (err) {
        if (ignore) return;
        setError(err?.response?.data?.message || err.message || "Không thể tải danh sách nhẫn.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchRings();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredRings = useMemo(() => {
    const range = priceRanges.find((r) => r.id === priceFilter);

    let list = rings;
    if (range?.min !== undefined) {
      list = list.filter((item) => Number(item.price) >= range.min);
    }
    if (range?.max !== undefined) {
      list = list.filter((item) => Number(item.price) <= range.max);
    }

    const sorted = [...list];
    if (sortBy === "price-asc") sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sortBy === "price-desc") sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return sorted;
  }, [rings, priceFilter, sortBy]);

  return (
    <>
      <Header />
      <main className="bg-white text-[#000]">
        <section className="relative isolate overflow-hidden bg-[#ece8e1]">
          <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16 lg:px-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#8a6f58]">Bộ sưu tập Nhẫn</p>
              <h1 className="text-3xl font-bold leading-tight text-[#2f241a] sm:text-4xl">
                Tinh xảo cho riêng phong cách của bạn
              </h1>
              <p className="max-w-xl text-sm text-[#5f4a38] sm:text-base">
                Những mẫu nhẫn thủ công từ chất liệu chọn lọc, kết hợp thiết kế hiện đại và tinh tế, được tạo ra để tôn vinh dấu ấn cá nhân của bạn.              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#9a785d] ring-1 ring-[#e8d9c7]">
                  Chất liệu vàng, bạc, đá quý
                </span>
                <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#9a785d] ring-1 ring-[#e8d9c7]">
                  Bảo hành làm sạch trọn đời
                </span>
              </div>
            </div>
            <div className="relative isolate aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl bg-white/60 shadow-lg ring-1 ring-[#e8d9c7]">
              <img
                src="/nhẫn.jpg"
                alt="Ring collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-[#eadfce] pb-6 text-sm text-[#6d5a48]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em]">
              <span className="text-[#9c7c61]">Trang chủ</span>
              <span>/</span>
              <span className="text-[#2f241a] font-semibold">Nhẫn</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-lg font-semibold uppercase tracking-[0.2em] text-[#2f241a]">
                  Nhẫn cao cấp tại Jewelux
                </p>
                <p className="text-xs text-[#7b6654]">
                  {filteredRings.length} sản phẩm phù hợp lựa chọn của bạn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.14em] text-[#7b6654]">Sắp xếp:</span>
                <div className="flex overflow-hidden rounded-full bg-white ring-1 ring-[#e8d9c7]">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`px-3 py-1.5 text-xs font-semibold transition ${
                        sortBy === opt.id
                          ? "bg-[#2f241a] text-white"
                          : "text-[#6d5a48] hover:bg-[#f4e7d8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {priceRanges.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setPriceFilter(range.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ring-1 ring-[#e8d9c7] ${
                  priceFilter === range.id
                    ? "bg-[#2f241a] text-white"
                    : "bg-white text-[#6d5a48] hover:bg-[#f4e7d8]"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {error ? (
            <p className="mt-6 text-sm text-red-600">{error}</p>
          ) : null}

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-[#eadfce]"
                >
                  <div className="aspect-square rounded-2xl bg-[#f2e6d7]" />
                  <div className="mt-4 h-3 w-3/4 rounded bg-[#f2e6d7]" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-[#f2e6d7]" />
                </div>
              ))}
            </div>
          ) : null}

          {!loading && !error && filteredRings.length === 0 ? (
            <div className="mt-12 flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-[#eadfce]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2e6d7] text-[#9c7c61]">
                ◻
              </div>
              <p className="mt-4 text-sm font-semibold text-[#2f241a]">Chưa có sản phẩm trong tầm giá này.</p>
              <p className="mt-1 text-xs text-[#7b6654]">Thay đổi bộ lọc để xem thêm gợi ý khác.</p>
            </div>
          ) : null}

          {!loading && !error && filteredRings.length > 0 ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {filteredRings.map((item) => {
                const name = item.title || item.name || "Nhẫn chưa đặt tên";
                const priceText = item.price || item.price === 0 ? formatCurrency(item.price) : "";
                return (
                  <article
                    key={item._id || item.id || name}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#eadfce] transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative overflow-hidden bg-[#fff]">
                      <div className="aspect-square w-full">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#7b6654]">
                            Chưa có ảnh
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f241a]">
                        {name}
                      </p>
                      {priceText ? (
                        <p className="text-base font-semibold text-[#9a785d]">{priceText}</p>
                      ) : null}
                      <p className="text-xs text-[#7b6654] line-clamp-2">
                        {item.description || "Thiết kế tinh xảo, phù hợp nhiều phong cách."}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="rounded-full bg-[#f8f1e7] px-3 py-1 text-[11px] font-semibold text-[#9c7c61]">
                          {item.material || "Alloy / Gold"}
                        </div>
                        <Link to={`/detail/${item._id || item.id}`} className="rounded-full border border-[#2f241a] px-4 py-2 text-[11px] font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white">
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}



