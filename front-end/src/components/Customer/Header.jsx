import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Diamond, Search, ShoppingBag, User } from "lucide-react";
import { getUser, setAuthToken, setUser } from "../../lib/api";
import useSearchPage from "../../lib/hooks/useSearchPage";
import { useCart } from "../../context/CartContext";

const navLinks = [
  { href: "/shop", label: "Trang chủ" },
  { href: "/Nhan", label: "Nhẫn" },
  { href: "/Daychuyen", label: "Dây Chuyền" },
  { href: "/Vongtay", label: "Vòng Tay" },
  { href: "/Bongtai", label: "Bông Tai" },
  { href: "/about", label: "Về Chúng Tôi" },
  { href: "/chat", label: "Liên Hệ" },
];

export default function Header() {
  const navigate = useNavigate();
  const [me, setMe] = React.useState(() => getUser());
  const [openSearch, setOpenSearch] = React.useState(false);
  const [openAccount, setOpenAccount] = React.useState(false);
  const accountRef = React.useRef(null);
  const { itemCount } = useCart();
  const { searchTerm, setSearchTerm, results, loading } = useSearchPage({
    endpoint: "/api/jewelry",
    minLength: 2,
  });

  React.useEffect(() => {
    const handleStorage = () => setMe(getUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setOpenAccount(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = (me?.name || me?.fullName || me?.username || me?.email || "").charAt(0).toUpperCase();

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setMe(null);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/shop" className="flex items-center gap-2 text-zinc-900">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-white shadow-sm">
              <Diamond className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold tracking-wide">JEWELUX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-700">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="group relative transition hover:text-zinc-900"
                >
                  {link.label}
                  <span className="absolute inset-x-0 -bottom-2 h-0.5 origin-center scale-x-0 bg-zinc-900 transition group-hover:scale-x-100" />
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group relative transition hover:text-zinc-900"
                >
                  {link.label}
                  <span className="absolute inset-x-0 -bottom-2 h-0.5 origin-center scale-x-0 bg-zinc-900 transition group-hover:scale-x-100" />
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-4 text-zinc-800">
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="rounded-full p-2 transition hover:bg-zinc-100"
              onClick={() => setOpenSearch((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/cart"
              aria-label="Giỏ hàng"
              className="relative rounded-full p-2 transition hover:bg-zinc-100"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-[#2f241a] px-1 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>
            {me ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-label="Tài khoản"
                  onClick={() => setOpenAccount((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-200"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-white">
                    {userInitial || <User className="h-4 w-4" />}
                  </span>
                  <span className="hidden sm:inline">
                    {me.name || me.fullName || me.username || me.email || "Tài khoản"}
                  </span>
                </button>
                {openAccount ? (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-zinc-200">
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-900 text-white">
                        {userInitial || <User className="h-5 w-5" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {me.name || me.fullName || me.username || "Khách hàng"}
                        </p>
                        <p className="text-xs text-zinc-500">{me.email || me.phone || "Chưa có email"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/customer/profile"
                        className="block px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                      >
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 border-t border-zinc-100"
                      >
                        Đơn hàng của tôi
                      </Link>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                to="/"
                aria-label="Dang nh?p"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <SearchPanel
        open={openSearch}
        onClose={() => setOpenSearch(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        results={results}
        loading={loading}
      />
    </>
  );
}

function SearchPanel({ open, onClose, searchTerm, setSearchTerm, results, loading }) {
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
    if (Number.isNaN(num)) return "";
    return `${num.toLocaleString("vi-VN")} VND`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"} flex items-start justify-center`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`mt-20 w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200 transition-transform ${
          open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3">
          <Search className="h-5 w-5 text-zinc-500" />
          <input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm trang sức, bộ sưu tập..."
            className="w-full border-none bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200"
          >
            Đóng
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto px-4 py-3 text-sm">
          {loading ? <p className="text-zinc-500">Đang tìm kiếm...</p> : null}
          {!loading && searchTerm.trim().length >= 2 && results.length === 0 ? (
            <p className="text-zinc-500">Không tìm thấy kết quả.</p>
          ) : null}
          {!loading && results.length > 0 ? (
            <ul className="divide-y divide-zinc-100">
              {results.map((item) => {
                const id = item._id || item.id || item.productId;
                return (
                  <li key={id || item.name} className="py-2">
                    {id ? (
                      <Link
                        to={`/detail/${id}`}
                        onClick={onClose}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-1 transition hover:bg-zinc-50"
                      >
                        <div>
                          <p className="font-medium text-zinc-900">{item.name || item.title || "Không có tên"}</p>
                          {item.price ? <p className="text-xs text-zinc-500">{formatCurrency(item.price)}</p> : null}
                        </div>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name || item.title || "Item"}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : null}
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1">
                        <div>
                          <p className="font-medium text-zinc-900">{item.name || item.title || "Không có tên"}</p>
                          {item.price ? (
                            <p className="text-xs text-zinc-500">{formatCurrency(item.price)}</p>
                          ) : null}
                        </div>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name || item.title || "Item"}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
          {searchTerm.trim().length < 2 ? (
            <p className="text-zinc-500">Nhập tối thiểu 2 ký tự để tìm kiếm.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
