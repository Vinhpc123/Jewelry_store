import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";
import useSearchPage from "../../lib/hooks/useSearchPage";
import usePagination from "../../lib/hooks/usePagination";
import Pagination from "../../components/Admin/Pagination";
import formatDateTime from "../../components/Admin/FormatDateTime";
import instance, { getUser, fetchUserById, updateUserById } from "../../lib/api";

const ROLE_LABELS = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  customer: "Khách hàng",
};

const getRoleLabel = (role) => ROLE_LABELS[role] || role;


export default function Users() {
  const { loading, error, users = [], refresh } = useAdminData();
  const currentUser = getUser();
  const [page, setPage] = React.useState(5);
  const [pageSize, setPageSize] = React.useState(5);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "staff",
    password: "",
    confirmPassword: "",
  });
  const [editMeta, setEditMeta] = React.useState({});
  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState(null);
  const [editSaving, setEditSaving] = React.useState(false);
  const {
    searchTerm,
    setSearchTerm,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchPage({ endpoint: "/api/users", debounceMs: 400, minLength: 1 });
  const trimmedSearch = searchTerm.trim();
  const searchActive = Boolean(trimmedSearch);
  const shouldUseSearchResults = searchActive && !searchError;
  const rawSource = shouldUseSearchResults ? searchResults : users;

  //lọc bỏ user hiện tại (admin)
  const filteredSource = React.useMemo(() => {
    if (!currentUser) return rawSource;
    return rawSource.filter((user) => user._id !== currentUser._id); // hoặc user.role !== "admin"
  }, [rawSource, currentUser]);

  //lọc theo vai trò
  const dataSource = React.useMemo(() => {
    if (roleFilter === "all") return filteredSource;
    return filteredSource.filter((user) => user.role === roleFilter);
  }, [filteredSource, roleFilter]);

  //dùng để hiển thị trạng thái khi xóa, khóa user
  const [deletingId, setDeletingId] = React.useState(null);
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Xóa ${user.email}?`)) return;
    setDeletingId(user._id);
    try {
      await instance.delete(`/api/users/${user._id}`);
      await refreshWithSearch();
    } finally {
      setDeletingId(null);
    }
  };
  const handleToggleLock = async (user) => {
    const actionLabel = user.isActive ? "Khóa" : "Mở khóa";
    if (!window.confirm(`${actionLabel} ${user.email}?`)) return;

    await instance.patch(`/api/users/${user._id}/status`, {
      isActive: !user.isActive,
    });
    await refreshWithSearch();
  };


  //chọn loading, error hiển thị
  const listLoading = shouldUseSearchResults ? searchLoading : loading;
  const listError = shouldUseSearchResults ? searchError : error;
  React.useEffect(() => {
    setPage(1); // cài lại trang khi thay đổi bộ lọc
  }, [trimmedSearch, roleFilter]);
  // phân trang
  const { paginated, totalItems, totalPages, offset } = usePagination(
    dataSource,
    page,
    pageSize
  );
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, pageSize, totalPages]);
  // thống kê vai trò
  const totalUsers = users.length;
  const roleStats = React.useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        if (user.isActive) acc.active += 1;
        return acc;
      },
      { admin: 0, staff: 0, customer: 0, active: 0 }
    );
  }, [users]);
  // trạng thái tìm kiếm
  const searchStatusText = React.useMemo(() => {
    if (!searchActive) return "";
    if (listLoading) return "Đang tìm...";
    if (listError) return String(listError);
    if (totalItems === 0) return "Không tìm thấy người dùng phù hợp.";
    return `Tìm thấy ${totalItems} người dùng phù hợp.`;
  }, [searchActive, listLoading, listError, totalItems]);
  // xử lý thay đổi ô tìm kiếm
  const handleSearchChange = React.useCallback(
    (event) => setSearchTerm(event.target.value),
    [setSearchTerm]
  );
  const refreshWithSearch = React.useCallback(async () => {
    await refresh();
    if (searchActive) {
      await refetchSearch();
    }
  }, [refresh, refetchSearch, searchActive]);
  const handleEditUser = async (user) => {
    if (!user || !user._id) return;
    setEditModalOpen(true);
    setEditError(null);
    setEditSaving(false);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "staff",
      password: "",
      confirmPassword: "",
    });
    setEditMeta({
      id: user._id,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
    setEditLoading(true);
    try {
      const response = await fetchUserById(user._id);
      const data = response.data;
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        role: data.role || "staff",
        password: "",
        confirmPassword: "",
      });
      setEditMeta({
        id: data._id,
        isActive: data.isActive,
        createdAt: data.createdAt,
      });
    } catch (err) {
      setEditError(
        err?.response?.data?.message || err.message || "Không tải được người dùng."
      );
    } finally {
      setEditLoading(false);
    }
  };
  const handleEditFieldChange = (field) => (event) => {
    const value = event.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditError(null);
    setEditMeta({});
    setEditForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "staff",
      password: "",
      confirmPassword: "",
    });
    setEditLoading(false);
  };
  const handleUpdateUser = async (event) => {
    event.preventDefault();
    if (!editMeta.id) return;
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setEditError("Mat khau nhap lai khong khop");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      delete payload.confirmPassword;
      await updateUserById(editMeta.id, payload);
      await refreshWithSearch();
      closeEditModal();
    } catch (err) {
      setEditError(
        err?.response?.data?.message || err.message || "Không thể cập nhật người dùng."
      );
    } finally {
      setEditSaving(false);
    }
  };
  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          <UserHeader
            total={totalUsers}
            adminCount={roleStats.admin}
            staffCount={roleStats.staff}
            customerCount={roleStats.customer}
            activeCount={roleStats.active}
            onRefresh={refreshWithSearch}
            refreshing={loading}
          />
          <UserToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchStatus={searchStatusText}
            searchActive={searchActive}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            paginationProps={{
              page,
              setPage,
              pageSize,
              setPageSize,
              totalPages,
              totalItems,
              offset,
            }}
            
          />
          <UserTable
            items={paginated}
            startIndex={offset}
            loading={listLoading}
            error={listError}
            searchActive={searchActive}
            totalItems={totalItems}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleLock={handleToggleLock}
            deletingId={deletingId}
          />
          <EditUserModal
            open={editModalOpen}
            onClose={closeEditModal}
            formValues={editForm}
            onFieldChange={handleEditFieldChange}
            onSubmit={handleUpdateUser}
            loading={editLoading}
            error={editError}
            saving={editSaving}
            meta={editMeta}
          />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
function UserHeader({
  total,
  adminCount,
  staffCount,
  customerCount,
  activeCount,
  onRefresh,
  refreshing,
}) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Quản lý người dùng</h1>
          <p className="text-sm text-zinc-500">
            Theo dõi danh sách tài khoản, trạng thái hoạt động và vai trò.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Làm mới
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
        <StatCard label="Tổng user" value={total} />
        <StatCard label="Admin" value={adminCount} />
        <StatCard label="Nhân viên" value={staffCount} />
        <StatCard label="Khách hàng" value={customerCount} />
        <StatCard label="Đang hoạt động" value={activeCount}  />
      </div>
    </div>
  );
}
function StatCard({ label, value, className = "" }) {
  return (
    <div className={`rounded border border-zinc-200 bg-zinc-50 p-3 ${className}`}>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
function UserToolbar({
  paginationProps,
  searchTerm,
  onSearchChange,
  searchStatus,
  searchActive,
  roleFilter,
  onRoleFilterChange,
}) {
  const { page, setPage, pageSize, setPageSize, totalPages, totalItems, offset } =
    paginationProps;

  const roleOptions = [
    { value: "all", label: "Tất cả" },
    { value: "staff", label: "Nhân viên" },
    { value: "customer", label: "Khách hàng" },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Chế độ xem
          </label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-0"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:justify-center">
          <input
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Tìm tên hoặc email..."
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-0 sm:w-64"
          />
          {searchActive && searchStatus ? (
            <span className="text-xs text-zinc-500">{searchStatus}</span>
          ) : null}
        </div>

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
  );
}
function UserTable({ 
  items,
  startIndex,
  loading,
  error,
  searchActive,
  totalItems,
  onEdit = () => {},
  onDelete = () => {},
  onToggleLock = () => {},
  deletingId, }) {
  if (loading) {
    return <div>Đang tải danh sách người dùng...</div>;
  }
  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        Lỗi: {error}
      </div>
    );
  }
  if (totalItems === 0) {
    return (
      <div className="rounded border border-zinc-200 bg-white p-6 text-center text-zinc-600">
        {searchActive ? "Không tìm thấy người dùng phù hợp." : "Hiện chưa có người dùng nào."}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full table-fixed divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-100 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
          <tr>
            <th className="w-12 px-3 py-2 text-center">STT</th>
            <th className="w-48 px-3 py-2">Tên</th>
            <th className="w-64 px-3 py-2">Email</th>
            <th className="w-24 px-3 py-2 text-center">Vai trò</th>
            <th className="w-24 px-3 py-2 text-center">Trạng thái</th>
            <th className="w-40 px-3 py-2 text-center">Ngày tạo</th>
            <th className="w-40 px-3 py-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {items.map((user, idx) => (
            <tr key={user._id || idx} className="hover:bg-zinc-50">
              <td className="px-3 py-2 text-center">{startIndex + idx + 1}</td>
              <td className="px-3 py-2 font-medium text-zinc-900">
                <p>{user.name || "Khong ten"}</p>
                <p className="text-xs text-zinc-500">ID: {user._id || "-"}</p>
              </td>
              <td className="px-3 py-2 text-sm text-zinc-700">{user.email}</td>
              <td className="px-3 py-2 text-center capitalize text-zinc-700">
                {getRoleLabel(user.role)}
              </td>
              <td className="px-3 py-2 text-center">
                <UserStatusBadge active={user.isActive} />
              </td>
              <td className="px-3 py-2 text-center text-zinc-600">
                {formatDateTime(user.createdAt)}
              </td>
              <td className="px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="rounded border border-blue-500 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    onClick={() => onEdit(user)}
                  >
                    Sửa
                  </button>
                  <button
                    className="rounded border border-red-500 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    onClick={() => onDelete(user)}
                    disabled={deletingId === user._id}
                  >
                    {deletingId === user._id ? "Đang xóa..." : "Xóa"}
                  </button>
                  <button
                    className="rounded border border-amber-500 px-2 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                    onClick={() => onToggleLock(user)}
                  >
                    {user.isActive ? "Khóa" : "Mở khóa"}
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function UserStatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        active
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {active ? "Hoạt động" : "Tạm khóa"}
    </span>
  );
}
function EditUserModal({
  open,
  onClose,
  formValues,
  onFieldChange,
  onSubmit,
  loading,
  error,
  saving,
  meta = {},
}) {
  if (!open) return null;
  const statusBadge =
    typeof meta.isActive === "boolean" ? <UserStatusBadge active={meta.isActive} /> : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500">Cập nhật thông tin tài khoản</p>
            <h2 className="text-xl font-semibold text-zinc-900">Chỉnh sửa người dùng</h2>
            {meta.createdAt || statusBadge ? (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {meta.createdAt ? `Tạo lúc: ${formatDateTime(meta.createdAt)}` : null}
                {statusBadge}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="text-zinc-500 transition hover:text-zinc-700"
            onClick={onClose}
            aria-label="Đóng"
          >
            ?
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            Đang tải thông tin người dùng...
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error ? (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">Tên</span>
                <input
                  type="text"
                  className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-0"
                  value={formValues.name}
                  onChange={onFieldChange("name")}
                  required
                />
              </label>
              <label className="space-y-1 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">Email</span>
                <input
                  type="email"
                  className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-0"
                  value={formValues.email}
                  onChange={onFieldChange("email")}
                  required
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">Số điện thoại</span>
                <input
                  type="tel"
                  className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-0"
                  value={formValues.phone}
                  onChange={onFieldChange("phone")}
                  placeholder="Nhập số điện thoại"
                />
              </label>
              <label className="space-y-1 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">Địa chỉ</span>
                <input
                  type="text"
                  className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-0"
                  value={formValues.address}
                  onChange={onFieldChange("address")}
                  placeholder="Nhập địa chỉ"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">Mat khau moi</span>
                <input
                  type="password"
                  className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-0"
                  value={formValues.password}
                  onChange={onFieldChange("password")}
                  placeholder="Nhap mat khau moi (bo qua neu khong doi)"
                />
              </label>
              <label className="space-y-1 text-sm text-zinc-600">
                <span className="font-medium text-zinc-800">Nhap lai moi</span>
                <input
                  type="password"
                  className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-0"
                  value={formValues.confirmPassword}
                  onChange={onFieldChange("confirmPassword")}
                  placeholder="Nhap lai mat khau"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-zinc-600">
              <span className="font-medium text-zinc-800">Vai trò</span>
              <select
                className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-0 md:w-64 ml-2"
                value={formValues.role}
                onChange={onFieldChange("role")}
              >
                <option value="staff">Nhân viên</option>
                <option value="customer">Khách hàng</option>
              </select>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                onClick={onClose}
                disabled={saving}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
