import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import instance from "../../lib/api";
import { blogPosts } from "../../data/blogPosts";

function StorySection({ story }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid items-stretch gap-10 md:grid-cols-[2fr_1.1fr]">
        <div className="h-full overflow-hidden bg-slate-100 shadow-sm">
          <img
            src={story.largeImage}
            alt={story.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex h-full flex-col gap-6 md:items-start">
          <div className="w-full overflow-hidden bg-slate-100 shadow-sm flex-[0.6]">
            <img
              src={story.smallImage}
              alt={`${story.title} - detail`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="w-full flex-[0.4] flex items-center md:items-start">
            <div className="max-w-sm">
              <h2 className="text-2xl font-semibold text-amber-800 sm:text-3xl">
                {story.title}
              </h2>
              <p className="mt-3 text-sm text-slate-700 sm:text-base">
                {story.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Storefront() {
  const heroSlides = [
    {
      title: "Bộ Sưu Tập Năm 2025: Golden Heritage",
      description:
        "Khám phá vẻ đẹp tinh khôi và sức sống động của thiên nhiên trong từng thiết kế trang sức độc đáo.",
      cta: "Khám Phá Ngay",
      image: "/banner/banner1.jpg",
    },
    {
      title: "Nét Đẹp Thanh Lịch",
      description:
        "Tinh tuyển chất liệu cao cấp, tạo nên những đường nét mềm mại và sang trọng cho mọi khoảnh khắc.",
      cta: "Xem Bộ Sưu Tập",
      image: "banner/banner2.jpg",
    },
    {
      title: "Vòng Sáng Ngọc Trai",
      description:
        "Những thiết kế đậm chất nghệ thuật, tôn vinh vẻ đẹp dịu dàng và kiêu sa của phái đẹp.",
      cta: "Khám Phá BST",
      image: "banner/banner3.png",
    },
    {
      title: "Ánh Kim Hiện Đại",
      description:
        "Kết hợp thủ công tinh xảo và phong cách tối giản, mang lại sự tinh tế trong từng chi tiết.",
      cta: "Đặt Lịch Thử",
      image: "banner/banner4.jpeg",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [newProducts, setNewProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const formatCurrency = useMemo(
    () => (value) => {
      if (value === null || value === undefined || value === "") return "";
      const num =
        typeof value === "number"
          ? value
          : Number(String(value).replace(/[^0-9.-]+/g, ""));
      if (Number.isNaN(num)) return "";
      return `${num.toLocaleString("vi-VN")} VND`;
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(
      () => setActiveSlide((prev) => (prev + 1) % heroSlides.length),
      8000
    );
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const res = await instance.get("/api/jewelry");
        if (ignore) return;
        const items = Array.isArray(res.data) ? res.data : [];
        setNewProducts(items.slice(0, 8));
      } catch (err) {
        if (ignore) return;
        setProductsError(
          err?.response?.data?.message ||
            err.message ||
            "Không thể tải sản phẩm."
        );
      } finally {
        if (!ignore) setProductsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const currentSlide = heroSlides[activeSlide];

  const story = {
    title: "Đeo trang sức là cách thể hiện bản thân không cần một lời nói nào.",
    description:
      "Cuộc sống có bao lâu mà chờ chứ, hãy đeo trang sức như chưa từng được đeo nhé.",
    largeImage: "story/story1.png",
    smallImage: "story/story2.webp",
  };

  const featuredCollections = [
    {
      title: "Nhẫn",
      image: "bosuutap/nhẫn.webp",
      path: "/Nhan",
    },
    {
      title: "Dây Chuyền",
      image: "bosuutap/daychuyen.png",
      path: "/Daychuyen",
    },
    {
      title: "Vòng Tay",
      image: "bosuutap/vongtay.png",
      path: "/Vongtay",
    },
    {
      title: "Bông Tai",
      image: "bosuutap/bongtai.png",
      path: "/Bongtai",
    },
  ];

  const blogTips = blogPosts.slice(0, 3);

  return (
    <>
      <Header />
      <main className="bg-white text-slate-900">
        <section className="relative isolate overflow-hidden bg-white">
          <div className="absolute inset-0 overflow-hidden">
            {heroSlides.map((slide, idx) => (
              <img
                key={`${slide.title}-${idx}`}
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  idx === activeSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10" />
          </div>
          <div className="relative flex min-h-[100vh] flex-col items-center justify-center px-4 py-24 text-center sm:px-10">
            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {currentSlide.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 sm:text-base">
              {currentSlide.description}
            </p>
            <button className="mt-6 rounded-full bg-white/85 px-6 py-2 text-sm font-semibold text-amber-800 shadow-md transition hover:bg-white">
              {currentSlide.cta}
            </button>
            <div className="mt-6 flex items-center gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    idx === activeSlide
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Chuyển đến banner ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <StorySection story={story} />

        <section className="mx-auto max-w-7xl px-6 pb-28 pt-10 sm:px-5 lg:px-10">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
              Lookbook
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Phong cách thời trang theo xu hướng
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Link
              to="/about"
              className="group relative block h-[520px] overflow-hidden rounded-3xl shadow-lg ring-1 ring-slate-100 transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src="banner/banner3.jpg"
                alt="Lookbook hero"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                  Ritual of Shine
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  Thanh lịch & Tinh tế
                </h3>
                <p className="mt-2 max-w-md text-sm text-white/85">
                  Chọn nét tinh tế, tôn lên da và phong cách
                </p>
                <span className="mt-4 inline-flex rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-amber-800">
                  Về chúng tôi
                </span>
              </div>
            </Link>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredCollections.map((item) => {
                const subtitleMap = {
                  "/Nhan": "Nét đẹp vĩnh cửu",
                  "/Daychuyen": "Vẻ đẹp tinh tế",
                  "/Vongtay": "Phong cách thời thượng",
                  "/Bongtai": "Tỏa sáng mọi ánh nhìn",
                };
                const subtitle = subtitleMap[item.path] || "";
                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="group relative block h-[245px] overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-100 transition duration-500 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-white/80">{subtitle}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-5 lg:px-10">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
              Sản phẩm mới
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Những sản phẩm nổi bật
            </h2>
          </div>

          {productsError ? (
            <p className="mt-6 text-center text-sm text-red-600">{productsError}</p>
          ) : null}

          {productsLoading ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
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

          {!productsLoading && !productsError && newProducts.length === 0 ? (
            <div className="mt-12 flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-[#eadfce]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2e6d7] text-[#9c7c61]">
                :)
              </div>
              <p className="mt-4 text-sm font-semibold text-[#2f241a]">
                Chưa có sản phẩm để hiển thị.
              </p>
              <p className="mt-1 text-xs text-[#7b6654]">
                Quay lại sau để xem các mẫu mới nhất.
              </p>
            </div>
          ) : null}

          {!productsLoading && !productsError && newProducts.length > 0 ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {newProducts.map((item) => {
                const name = item.title || item.name || "Sản phẩm chưa đặt tên";
                const priceText =
                  item.price || item.price === 0
                    ? formatCurrency(item.price)
                    : "";
                return (
                  <article
                    key={item._id || item.id || name}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#eadfce] transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      to={`/detail/${item._id || item.id}`}
                      className="relative block overflow-hidden bg-[#fff]"
                    >
                      <div className="aspect-square w-full">
                        {item.image ? (
                          <img src={item.image} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#7b6654]">
                            Chưa có ảnh
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    </Link>                    
                    <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f241a]">
                        {name}
                      </p>
                      {priceText ? (
                        <p className="text-base font-semibold text-[#9a785d]">
                          {priceText}
                        </p>
                      ) : null}
                      <p className="text-xs text-[#7b6654] line-clamp-2">
                        {item.description ||
                          "Thiết kế tinh xảo, phù hợp nhiều phong cách."}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="rounded-full bg-[#f8f1e7] px-3 py-1 text-[11px] font-semibold text-[#9c7c61]">
                          {item.material || "Alloy / Gold"}
                        </div>
                        <Link
                          to={`/detail/${item._id || item.id}`}
                          className="rounded-full border border-[#2f241a] px-4 py-2 text-[11px] font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white"
                        >
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

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
              Blog & Tips
            </p>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Cảm Hứng & Kiến Thức Trang Sức
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {blogTips.map((post) => (
              <article
                key={post.slug}
                className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="block overflow-hidden bg-slate-100"
                  aria-label={post.title}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-[250px] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-2 px-4 py-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600">{post.excerpt}</p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-auto w-fit text-sm font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Đọc thêm →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="h-full">
                <img
                  src="chetacthucong/chetac1.jpg"
                  alt="Chế tác thủ công"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center gap-4 px-8 py-10 sm:px-12">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
                  Nghệ Thuật Chế Tác Thủ Công
                </p>
                <h3 className="text-3xl font-bold leading-tight sm:text-4xl">
                  Tỉ Mỉ Trong Từng Đường Nét
                </h3>
                <p className="text-base leading-relaxed text-slate-600">
                  Mỗi thiết kế đều được chế tác bởi bàn tay tinh xảo của nghệ nhân, kết hợp giữa kỹ thuật truyền
                  thống và cảm hứng hiện đại. Chúng tôi cam kết chất lượng và sự độc đáo trong từng sản phẩm, mang
                  đến cho bạn những tuyệt tác mang dấu ấn riêng.
                </p>
                <Link
                  to="/about"
                  className="w-fit rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
                >
                  Tìm Hiểu Thêm
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
