import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import instance from "../../lib/api";

export default function DetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
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
        // API co the tra ve object hoac mang, nen lay phan tu dau tien neu la mang
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

  const name = product?.title || product?.name || "San pham";
  const priceText = product?.price || product?.price === 0 ? formatCurrency(product.price) : "";
  const material = product?.material || "Đang cập nhật";
  const description = product?.description || "Mô tả sản phẩm đang được cập nhật.";

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
                    <img
                      src={product.image}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
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
                      <p className="text-xs uppercase tracking-[0.14em] text-[#9c7c61]">Loại đá/đá quý</p>
                      <p className="font-semibold text-[#2f241a]">{product.stone}</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="rounded-full bg-[#2f241a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    Thêm vào giỏ
                  </button>
                  <Link
                    to="/shop"
                    className="rounded-full border border-[#2f241a] px-5 py-2 text-sm font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white"
                  >
                    Tiếp tục xem hàng
                  </Link>
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

