import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";

const getTimestamp = (date) => {
  const time = date ? new Date(date).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

const getInitial = (text) => {
  if (!text || typeof text !== "string") return "?";
  return text.trim().charAt(0).toUpperCase() || "?";
};

const roleLabel = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  customer: "Khách hàng",
};

const productStatusLabel = {
  active: "Còn hàng",
  completed: "Hết hàng",
};

const productStatusStyle = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  completed: "bg-zinc-100 text-zinc-700 border border-zinc-200",
};

export default function Dashboard() {
  const { loading, error, users, products, usersCount, productsCount, systemStatus } =
    useAdminData();

  const recentUsers = React.useMemo(() => {
    if (!Array.isArray(users)) return [];
    return [...users]
      .sort((a, b) => getTimestamp(b?.createdAt) - getTimestamp(a?.createdAt))
      .slice(0, 5);
  }, [users]);

  const recentProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    return [...products]
      .sort((a, b) => getTimestamp(b?.createdAt) - getTimestamp(a?.createdAt))
      .slice(0, 5);
  }, [products]);

  const statusBadge =
    systemStatus === "ok" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Hoạt động
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Cần kiểm tra
      </span>
    );

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-5 text-zinc-900">
          <header className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Dashboard</p>
              <h1 className="text-2xl font-bold">Tổng quan</h1>
              <p className="text-sm text-zinc-500">
                Theo dõi nhanh hiệu suất hệ thống và hoạt động gần đây.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                Xuất báo cáo
              </button>
              <button className="rounded bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-400">
                + Thêm người dùng
              </button>
            </div>
          </header>

          {loading ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">Đang tải...</div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
              Loi: {error}
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Tổng người dùng" value={usersCount} trend="5.2%" />
                <StatCard label="Tổng sản phẩm" value={productsCount} trend="2.1%" />
                <StatCard label="Người dùng mới (7d)" value={recentUsers.length} trend="1.0%" />
                <StatCard
                  label="Trạng thái hệ thống"
                  value={systemStatus?.toUpperCase?.() || "OK"}
                  customBadge={statusBadge}
                />
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="col-span-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900">Tổng quan doanh số</h2>
                      <p className="text-sm text-zinc-500">Khu vực biểu đồ - sẽ cập nhật sau.</p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                      Sắp ra mắt
                    </span>
                  </div>
                  <div className="mt-6 h-48 rounded-xl bg-gradient-to-r from-indigo-200 via-sky-100 to-white" />
                </div>

                  <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900">Hoạt động gần đây</h2>
                    <span className="text-xs text-zinc-500">Cập nhật mới</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {recentUsers.slice(0, 3).map((u) => (
                      <ActivityItem
                        key={u._id}
                        title="Đăng ký mới"
                        subtitle={u.email}
                        time={new Date(u.createdAt).toLocaleTimeString()}
                        icon={getInitial(u.name || u.email)}
                        accent="bg-indigo-100 text-indigo-700"
                      />
                    ))}
                    {recentProducts.slice(0, 3).map((p) => (
                      <ActivityItem
                        key={p._id}
                        title="Thêm sản phẩm mới"
                        subtitle={p.title}
                        time={new Date(p.createdAt).toLocaleTimeString()}
                        icon={getInitial(p.title)}
                        accent="bg-emerald-100 text-emerald-700"
                      />
                    ))}
                    {!recentUsers.length && !recentProducts.length ? (
                      <div className="text-sm text-zinc-500">Chưa có hoạt động</div>
                    ) : null}
                  </div>
                </div>
              </section>
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ListCard
                  title="Người dùng mới"
                  items={recentUsers}
                  renderItem={(u) => ({
                    title: u.name || u.email,
                    subtitle: `${u.email} - ${roleLabel[u.role] || "Không rõ"}`,
                    time: new Date(u.createdAt).toLocaleString(),
                    icon: getInitial(u.name || u.email),
                    accent: "bg-zinc-100 text-zinc-700",
                  })}
                />
                <ListCard
                  title="Sản phẩm mới"
                  items={recentProducts}
                  renderItem={(p) => ({
                    title: p.title,
                    subtitle: new Date(p.createdAt).toLocaleString(),
                    badge: productStatusLabel[p.status] || "Không rõ",
                    badgeClass:
                      productStatusStyle[p.status] || "bg-zinc-100 text-zinc-700 border border-zinc-200",
                    icon: getInitial(p.title),
                    accent: "bg-zinc-100 text-zinc-700",
                  })}
                />
              </section>
            </>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

function StatCard({ label, value, trend, customBadge }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="mt-2 text-3xl font-bold text-zinc-900">{value}</div>
      {customBadge ? (
        <div className="mt-2">{customBadge}</div>
      ) : (
        <div className="mt-1 text-sm font-semibold text-emerald-600">+ {trend}</div>
      )}
    </div>
  );
}

function ActivityItem({ title, subtitle, time, icon, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${accent}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">{title}</p>
        <p className="truncate text-xs text-zinc-500">{subtitle}</p>
      </div>
      <span className="text-xs text-zinc-500">{time}</span>
    </div>
  );
}

function ListCard({ title, items, renderItem }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      </div>
      {!items.length ? (
        <div className="mt-3 text-sm text-zinc-500">Chưa có dữ liệu</div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const data = renderItem(item);
            return (
              <li
                key={item._id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 hover:bg-white"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${data.accent}`}>
                    {data.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{data.title}</p>
                    <p className="truncate text-xs text-zinc-500">{data.subtitle}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  {data.badge ? (
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${data.badgeClass}`}>
                      {data.badge}
                    </span>
                  ) : null}
                  <span className="text-[11px] text-zinc-500">{data.time}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
