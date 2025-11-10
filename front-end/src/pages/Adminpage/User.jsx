import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";
import useSearchPage from "../../lib/hooks/useSearchPage";
import usePagination from "../../lib/hooks/usePagination";
import Pagination from "../../components/Admin/Pagination";
import formatDateTime from "../../components/Admin/FormatDateTime";
export default function Users() {
  const { loading, error, users = [], refresh } = useAdminData();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);
  const [roleFilter, setRoleFilter] = React.useState("all");
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
  const dataSource = React.useMemo(() => {
    if (roleFilter === "all") return rawSource;
    return rawSource.filter((user) => user.role === roleFilter);
  }, [rawSource, roleFilter]);
  const listLoading = shouldUseSearchResults ? searchLoading : loading;
  const listError = shouldUseSearchResults ? searchError : error;
  React.useEffect(() => {
    setPage(1); // reset pagination when search/filter changes
  }, [trimmedSearch, roleFilter]);
  const { paginated, totalItems, totalPages, offset } = usePagination(
    dataSource,
    page,
    pageSize
  );
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, pageSize, totalPages]);
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
  const searchStatusText = React.useMemo(() => {
    if (!searchActive) return "";
    if (listLoading) return "Dang tim...";
    if (listError) return String(listError);
    if (totalItems === 0) return "Khong tim thay nguoi dung phu hop.";
    return `Tim thay ${totalItems} nguoi dung`;
  }, [searchActive, listLoading, listError, totalItems]);
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
    { value: "admin", label: "Admin" },
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
function UserTable({ items, startIndex, loading, error, searchActive, totalItems }) {
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
              <td className="px-3 py-2 text-center capitalize text-zinc-700">{user.role}</td>
              <td className="px-3 py-2 text-center">
                <UserStatusBadge active={user.isActive} />
              </td>
              <td className="px-3 py-2 text-center text-zinc-600">
                {formatDateTime(user.createdAt)}
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
