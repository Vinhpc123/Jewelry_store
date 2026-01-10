import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Customer/Header";
import Footer from "../../components/Customer/Footer";
import instance, { setAuthToken, setUser } from "../../lib/api";
import { useToast } from "../../components/ui/ToastContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
  });
  const fileInputRef = React.useRef(null);

  const initialLetter = useMemo(() => {
    const source = form.name?.trim() || form.email?.trim() || "";
    return source.charAt(0).toUpperCase() || "?";
  }, [form.name, form.email]);

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (form.password && form.password !== form.confirm) return false;
    return true;
  }, [form]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await instance.get("/api/auth/profile");
        const user = res?.data || {};
        setForm((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          avatar: user.avatar || "",
          phone: user.phone || "",
          address: user.address || "",
        }));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          setAuthToken(null);
          setUser(null);
          navigate("/login", { replace: true });
          return;
        }
        toast.error(err?.response?.data?.message || err.message || "Khong the tai ho so.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, toast]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await instance.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res?.data?.url;
      if (url) {
        setForm((prev) => ({ ...prev, avatar: url }));
        toast.success("Tải avatar thành công. Nhấn Lưu để cập nhật.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneVal = form.phone.trim();
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (phoneVal && !phoneRegex.test(phoneVal)) {
      toast.error("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03,05,07,08,09).");
      return;
    }
    if (!canSubmit) {
      toast.error("Vui lòng kiểm tra lại thông tin.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        avatar: form.avatar,
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      if (form.password) payload.password = form.password;
      const res = await instance.patch("/api/auth/profile", payload);
      const updated = res?.data || {};
      setUser(updated);
      toast.success("Cập nhật thành công.");
      setForm((prev) => ({ ...prev, password: "", confirm: "" }));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setAuthToken(null);
        setUser(null);
        navigate("/login", { replace: true });
        return;
      }
      toast.error(err?.response?.data?.message || err.message || "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-white text-[#2f241a]">
        <section className="bg-[#f6f0e8]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 lg:px-10">
            <nav className="text-xs uppercase tracking-[0.2em] text-[#7b6654]">
              <span className="text-[#2f241a] font-semibold">Hồ sơ của tôi</span>
            </nav>
            <h1 className="text-3xl font-bold text-[#2f241a] sm:text-4xl">Hồ sơ</h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-full animate-pulse rounded bg-[#f2e6d7]" />
                ))}
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                <div className="h-24 w-24 rounded-full bg-[#f2e6d7] animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]"
              >
                <div>
                  <label className="text-sm font-semibold text-[#2f241a]">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="mt-1 w-full rounded-lg border border-[#eadfce] bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#2f241a]">Họ tên</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    className="mt-1 w-full rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-[#2f241a]">Số điện thoại</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      className="mt-1 w-full rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#2f241a]">Địa chỉ</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={handleChange("address")}
                      className="mt-1 w-full rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-[#2f241a]">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={handleChange("password")}
                      className="mt-1 w-full rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                      placeholder="Mật khẩu mới"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#2f241a]">Nhập lại mật khẩu</label>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={handleChange("confirm")}
                      className="mt-1 w-full rounded-lg border border-[#eadfce] px-3 py-2 text-sm"
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!canSubmit || saving}
                    className="rounded-full bg-[#2f241a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eadfce]">
                <div className="flex flex-col items-center gap-3">
                  {form.avatar ? (
                    <img
                      src={form.avatar}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-[#eadfce]"
                    />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-zinc-900 text-lg font-semibold text-white">
                      {initialLetter}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#2f241a]">{form.name || "Khách hàng"}</p>
                    <p className="text-xs text-[#7b6654]">{form.email || "Chưa có email"}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFileSelect}
                      disabled={uploading}
                      className="rounded-full border border-[#eadfce] px-4 py-2 text-xs font-semibold text-[#2f241a] transition hover:bg-[#2f241a] hover:text-white disabled:opacity-60"
                    >
                      {uploading ? "Đang tải..." : "Chọn ảnh"}
                    </button>
                    <p className="text-xs text-[#7b6654]">Chọn ảnh từ máy và nhấn Lưu để cập nhật.</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
