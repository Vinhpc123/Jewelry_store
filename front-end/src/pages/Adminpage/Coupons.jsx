import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useCoupons from "../../lib/hooks/useCoupons";
import usePagination from "../../lib/hooks/usePagination";
import Pagination from "../../components/Admin/Pagination";
import CurrencyDisplay from "../../components/Admin/CurrencyDisplay";
import formatDateTime from "../../components/Admin/FormatDateTime";

const emptyCoupon = {
  code: "",
  type: "percent",
  value: 0,
  startDate: "",
  endDate: "",
  minOrder: 0,
  maxDiscount: 0,
  usageLimit: 0,
  active: true,
};

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export default function Coupons() {
  const { coupons, loading, error, saving, deletingId, refresh, createCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const [search, setSearch] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState("create");
  const [editingId, setEditingId] = React.useState(null);
  const [form, setForm] = React.useState(emptyCoupon);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const filtered = React.useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!term) return coupons;
    return coupons.filter((c) => c.code?.toUpperCase().includes(term));
  }, [coupons, search]);

  const { paginated, totalItems, totalPages, offset } = usePagination(filtered, page, pageSize);

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const openCreate = () => {
    setFormMode("create");
    setEditingId(null);
    setForm(emptyCoupon);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setFormMode("edit");
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || "",
      type: coupon.type || "percent",
      value: coupon.value ?? 0,
      startDate: toDateInput(coupon.startDate),
      endDate: toDateInput(coupon.endDate),
      minOrder: coupon.minOrder ?? 0,
      maxDiscount: coupon.maxDiscount ?? 0,
      usageLimit: coupon.usageLimit ?? 0,
      active: coupon.active !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      window.alert("Ma giam gia khong duoc de trong");
      return;
    }
    try {
      if (formMode === "create") {
        await createCoupon(form);
      } else if (editingId) {
        await updateCoupon(editingId, form);
      }
      setShowModal(false);
      setForm(emptyCoupon);
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || "Khong the luu ma giam gia");
    }
  };

  const handleDelete = async (coupon) => {
    const ok = window.confirm(`Xoa ma "${coupon.code}"?`);
    if (!ok) return;
    try {
      await deleteCoupon(coupon._id);
    } catch (err) {
      window.alert(err?.response?.data?.message || err?.message || "Khong the xoa ma giam gia");
    }
  };

  return (
    <AdminRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <header className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Mã giảm giá</p>
              <h1 className="text-2xl font-bold text-zinc-900">Quản lý phiếu giảm giá</h1>
              <p className="text-sm text-zinc-500">Tạo, chỉnh sửa và theo dõi trạng thái mã khuyến mãi.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Làm mới
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              >
                + Thêm mã
              </button>
            </div>
          </header>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-zinc-600">
                Tổng mã: <strong>{coupons.length}</strong>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mã..."
                  className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none sm:w-64"
                />
                <Pagination
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  offset={offset}
                />
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded border border-zinc-200">
              {loading ? (
                <div className="p-4 text-sm text-zinc-600">Đang tải danh sách...</div>
              ) : error ? (
                <div className="p-4 text-sm text-red-600">Lỗi: {error}</div>
              ) : totalItems === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-600">
                  {search.trim() ? "Không tìm thấy mã phù hợp." : "Chưa có mã giảm giá."}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    <tr>
                      <th className="px-3 py-3 text-left">#</th>
                      <th className="px-3 py-3 text-left">Mã</th>
                      <th className="px-3 py-3 text-left">Loại</th>
                      <th className="px-3 py-3 text-left">Giá trị</th>
                      <th className="px-3 py-3 text-left">Giới hạn</th>
                      <th className="px-3 py-3 text-left">Ngày áp dụng</th>
                      <th className="px-3 py-3 text-left">Trạng thái</th>
                      <th className="px-3 py-3 text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {paginated.map((c, idx) => (
                      <tr key={c._id || c.code} className="hover:bg-zinc-50">
                        <td className="px-3 py-2 text-zinc-600">{offset + idx + 1}</td>
                        <td className="px-3 py-2 font-semibold text-zinc-900">{c.code}</td>
                        <td className="px-3 py-2 text-zinc-700">{c.type === "percent" ? "Phần trăm" : "Cố định"}</td>
                        <td className="px-3 py-2 text-zinc-700">
                          {c.type === "percent" ? `${c.value || 0}%` : <CurrencyDisplay value={c.value || 0} />}
                        </td>
                        <td className="px-3 py-2 text-zinc-700">
                          <div className="flex flex-col">
                            <span>Lượt dùng: {c.usedCount ?? 0}/{c.usageLimit ? c.usageLimit : "∞"}</span>
                            <span>ĐH tối thiểu: <CurrencyDisplay value={c.minOrder || 0} /></span>
                            {c.maxDiscount ? <span>Giảm tối đa: <CurrencyDisplay value={c.maxDiscount} /></span> : null}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-zinc-700">
                          <div className="flex flex-col">
                            <span>Từ: {c.startDate ? toDateInput(c.startDate) : "-"}</span>
                            <span>Đến: {c.endDate ? toDateInput(c.endDate) : "-"}</span>
                            <span className="text-xs text-zinc-500">Tạo: {formatDateTime(c.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              c.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                            }`}
                          >
                            {c.active ? "Đang hoạt động" : "Ngừng"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="rounded border border-blue-500 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              disabled={deletingId === c._id}
                              className="rounded border border-red-500 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === c._id ? "Đang xóa..." : "Xóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <CouponModal
          visible={showModal}
          form={form}
          setForm={setForm}
          formMode={formMode}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          submitting={saving}
        />
      </AdminLayout>
    </AdminRoute>
  );
}

function CouponModal({ visible, form, setForm, formMode, onClose, onSubmit, submitting }) {
  if (!visible) return null;

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">{formMode === "create" ? "Thêm mã giảm giá" : "Cập nhật mã giảm giá"}</h2>
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-700">Đóng</button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-zinc-700">Mã</label>
            <input
              value={form.code}
              onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="NHAPMA"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-zinc-700">Loại</label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền (VND)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">Giá trị</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.value}
              onChange={(e) => updateField("value", e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder={form.type === "percent" ? "VD: 10 cho 10%" : "VD: 50000 cho 50.000đ"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Đơn tối thiểu (VND)</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.minOrder}
              onChange={(e) => updateField("minOrder", e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="0 = không giới hạn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">Giảm tối đa (VND)</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.maxDiscount}
              onChange={(e) => updateField("maxDiscount", e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="0 = không giới hạn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Giới hạn lượt dùng</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.usageLimit}
              onChange={(e) => updateField("usageLimit", e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="0 = không giới hạn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">Ngày bắt đầu</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Ngày kết thúc</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-2">
            <input
              id="coupon-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => updateField("active", e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="coupon-active" className="text-sm text-zinc-700">
              Hoạt động
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : formMode === "create" ? "Tạo mã" : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
}
