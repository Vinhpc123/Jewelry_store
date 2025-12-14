import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import { getBlogPostBySlug, blogPosts } from "../../data/blogPosts";

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-lg font-semibold text-slate-800">
            Bài viết không tồn tại.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-full border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-800 hover:text-white"
          >
            Quay lại
          </button>
        </main>
        <Footer />
      </>
    );
  }

  const related = blogPosts.filter((item) => item.slug !== slug).slice(0, 2);

  const renderContent = (block, idx) => {
    if (typeof block === "string") {
      return (
        <p key={idx} className="text-base leading-7 text-slate-800">
          {block}
        </p>
      );
    }

    const { title, text, bullets } = block;
    return (
      <div key={idx} className="space-y-2 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-100">
        {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
        {text ? <p className="text-base leading-7 text-slate-700">{text}</p> : null}
        {Array.isArray(bullets) && bullets.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-base leading-7 text-slate-700">
            {bullets.map((item, bIdx) => (
              <li key={bIdx}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="bg-white text-slate-900">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={post.image}
              alt={post.title}
              className="h-64 w-full object-cover opacity-80 sm:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-white" />
          </div>
          <div className="relative mx-auto flex max-w-4xl flex-col gap-3 px-4 py-16 sm:px-6">
            <Link
              to="/ "
              className="w-fit text-sm font-semibold text-amber-200 hover:text-white"
            >
              ← Quay về trang chủ
            </Link>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {post.title}
            </h1>
            <p className="max-w-2xl text-sm text-white/80 sm:text-base">
              {post.excerpt}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="space-y-4">
            {post.content.map((block, idx) => renderContent(block, idx))}
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Bài viết khác</h3>
              <Link
                to="/"
                className="text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Về trang chủ
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  to={`/blog/${item.slug}`}
                  key={item.slug}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-20 w-28 rounded-lg object-cover"
                  />
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {item.excerpt}
                    </p>
                    <span className="text-sm font-semibold text-amber-700">
                      Đọc thêm →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
