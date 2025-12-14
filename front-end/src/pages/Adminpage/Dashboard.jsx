import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import useAdminData from "../../lib/hooks/useAdminData";
import instance from "../../lib/api";

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
  active: "Con hàng",
  completed: "Hết hàng",
};

const productStatusStyle = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  completed: "bg-zinc-100 text-zinc-700 border border-zinc-200",
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")} VND`;
const formatShort = (value) => {
  const n = Number(value || 0);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("vi-VN");
};

const toLocalYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseYMD = (str) => {
  const [y, m, d] = str.split("-").map((v) => Number(v));
  return new Date(y, (m || 1) - 1, d || 1);
};

const fillSeries = (range, rawSeries, mode = "day") => {
  const map = new Map((rawSeries || []).map((s) => [s.date, s.total]));

  if (mode === "month") {
    const year = new Date().getFullYear();
    const arr = [];
    for (let m = 1; m <= 12; m += 1) {
      const key = `${year}-${String(m).padStart(2, "0")}`;
      arr.push({ date: key, total: map.get(key) || 0 });
    }
    return arr;
  }

  if (mode === "week") {
    const today = new Date();
    const day = today.getDay(); // 0=Sun
    const diff = (day + 6) % 7; // days since Monday
    const start = new Date(today);
    start.setDate(today.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(0, 0, 0, 0);
    const arr = [];
    const d = new Date(start);
    while (d <= end) {
      const key = toLocalYMD(d);
      arr.push({ date: key, total: map.get(key) || 0 });
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (range - 1));
  const filled = [];
  const d = new Date(start);
  while (d <= end) {
    const key = toLocalYMD(d);
    filled.push({ date: key, total: map.get(key) || 0 });
    d.setDate(d.getDate() + 1);
  }
  return filled;
};

export default function Dashboard() {
  const { loading, error, users, products, usersCount, productsCount, systemStatus, trends } = useAdminData();
  const [revLoading, setRevLoading] = React.useState(true);
  const [revError, setRevError] = React.useState(null);
  const [revenue, setRevenue] = React.useState({
    mode: "day",
    range: 60,
    series: [],
    totals: { today: 0, last7: 0, last30: 0, sum: 0 },
  });
  const [rangeMode, setRangeMode] = React.useState("day");
  const [showAddUser, setShowAddUser] = React.useState(false);
  const [newUser, setNewUser] = React.useState({ name: "", email: "", password: "", role: "customer" });
  const [addUserError, setAddUserError] = React.useState("");
  const [addingUser, setAddingUser] = React.useState(false);

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

  React.useEffect(() => {
    let timer;
    const fetchRevenue = async (showLoading = false) => {
      if (showLoading) setRevLoading(true);
      setRevError(null);
      try {
        const params = { mode: rangeMode };
        if (rangeMode === "day") params.days = 7;
        const res = await instance.get("/api/admin/metrics/revenue", { params });
        const data = res?.data || {};
        const filled = fillSeries(
          data.range || (rangeMode === "month" ? 12 : rangeMode === "week" ? 7 : 60),
          data.series || [],
          rangeMode
        );
        setRevenue({
          mode: rangeMode,
          range: data.range,
          totals: data.totals || {},
          series: filled,
        });
      } catch (err) {
        setRevError(err?.response?.data?.message || err.message || "Không thể tải dữ liệu");
      } finally {
        if (showLoading) setRevLoading(false);
      }
    };

    fetchRevenue(true);
    timer = setInterval(() => fetchRevenue(false), rangeMode === "day" ? 30000 : 60000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [rangeMode]);

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-5 text-zinc-900">
          <header className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Dashboard</p>
              <h1 className="text-2xl font-bold">Tổng quan</h1>
              <p className="text-sm text-zinc-500">Theo dõi nhanh hiệu suất hệ thống và hoạt động gần đây.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const series = revenue.series || [];
                  if (!series.length) return;
                  const totals = revenue.totals || {};
                  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");
                  const headerTitle = "MẪU BÁO CÁO DOANH THU (QUY MÔ NHỎ)";
                  const tableRows = series
                    .map((s) => `<tr><td>${formatDate(s.date)}</td><td style="text-align:right;">${formatMoney(s.total)}</td></tr>`)
                    .join("");
                  const win = window.open("", "_blank");
                  win.document.write(`
                    <html>
                      <head>
                        <title>${headerTitle}</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 16px; color: #111; }
                          h1 { margin: 0 0 8px 0; font-size: 20px; text-transform: uppercase; }
                          h2 { margin: 12px 0 6px; font-size: 16px; }
                          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
                          .card { border:1px solid #e5e7eb; border-radius:8px; padding:8px; background:#f8fafc; }
                          table { border-collapse: collapse; width: 100%; margin-top: 8px; font-size: 13px; }
                          th { text-align:left; padding:6px 8px; border:1px solid #ccc; background:#eef2ff; }
                          td { padding:4px 8px; border:1px solid #ccc; }
                          .section { margin-top: 14px; }
                          .small { color:#4b5563; font-size:12px; }
                        </style>
                      </head>
                      <body>
                        <h1>${headerTitle}</h1>
                        <div class="section small">
                          <div><strong>Tên cơ sở/doanh nghiệp:</strong> Jewelry Store</div>
                          <div><strong>Kỳ báo cáo:</strong> ${revenue.mode === "month" ? "Tháng" : revenue.mode === "week" ? "Tuần" : "Ngày"} hiện tại</div>
                        </div>

                        <h2>1. Tổng quan</h2>
                        <div class="grid">
                          <div class="card"><div>Tổng người dùng</div><strong>${usersCount}</strong></div>
                          <div class="card"><div>Tổng sản phẩm</div><strong>${productsCount}</strong></div>
                          <div class="card"><div>Người dùng mới (7d)</div><strong>${trends?.newUsers7d?.current ?? 0}</strong></div>
                        </div>

                        <h2>2. Tổng doanh thu</h2>
                        <div class="grid">
                          <div class="card"><div>Hôm nay</div><strong>${formatMoney(totals.today || 0)}</strong></div>
                          <div class="card"><div>7 ngày</div><strong>${formatMoney(totals.last7 || totals.sum || 0)}</strong></div>
                          <div class="card"><div>30 ngày / 12 tháng</div><strong>${formatMoney(totals.last30 || totals.sum || 0)}</strong></div>
                        </div>
                        <div class="small">So sánh với kỳ trước (ước tính): người dùng ${trends?.users?.pct ?? 0}% | sản phẩm ${trends?.products?.pct ?? 0}% | người dùng mới 7d ${trends?.newUsers7d?.pct ?? 0}%.</div>

                        <h2>3. Doanh thu theo ${revenue.mode === "month" ? "tháng" : revenue.mode === "week" ? "tuần" : "ngày"}</h2>
                        <table>
                          <thead><tr><th>Ngày/Tháng</th><th>Doanh thu</th></tr></thead>
                          <tbody>${tableRows}</tbody>
                        </table>
                        <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
                      </body>
                    </html>
                  `);
                  win.document.close();
                }}
                disabled={!revenue.series?.length}
                className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Xuất báo cáo (PDF)
              </button>
              <button
                onClick={() => setShowAddUser(true)}
                className="rounded bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-400"
              >
                + Thêm người dùng
              </button>
            </div>
          </header>

          {showAddUser ? (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900">Đăng ký tài khoản mới</h3>
                  <button onClick={() => setShowAddUser(false)} className="text-sm text-zinc-500 hover:text-zinc-700">
                    Đóng
                  </button>
                </div>
                {addUserError ? (
                  <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{addUserError}</div>
                ) : null}
                <div className="mt-4 space-y-3">
                  <input
                    value={newUser.name}
                    onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Họ tên"
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Mật khẩu"
                    type="password"
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                    className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="staff">Nhân viên</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    Huy
                  </button>
                  <button
                    onClick={async () => {
                      setAddUserError("");
                      if (!newUser.email || !newUser.password) {
                        setAddUserError("Nhập email và mật khẩu.");
                        return;
                      }
                      setAddingUser(true);
                      try {
                        await instance.post("/api/auth/register", newUser);
                        setShowAddUser(false);
                        setNewUser({ name: "", email: "", password: "", role: "customer" });
                      } catch (err) {
                        setAddUserError(err?.response?.data?.message || err.message || "Không thể tạo tài khoản");
                      } finally {
                        setAddingUser(false);
                      }
                    }}
                    disabled={addingUser}
                    className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {addingUser ? "Đang tạo..." : "Tạo tài khoản"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">Đang tải...</div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">Lỗi: {error}</div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Tổng người dùng" value={usersCount} trend={trends.users?.pct} />
                <StatCard label="Tổng sản phẩm" value={productsCount} trend={trends.products?.pct} />
                <StatCard
                  label="Người dùng mới (7d)"
                  value={trends.newUsers7d?.current ?? recentUsers.length}
                  trend={trends.newUsers7d?.pct}
                />
                <StatCard label="Trạng thái hệ thống" value={systemStatus?.toUpperCase?.() || "OK"} customBadge={statusBadge} />
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="col-span-2 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900">Tổng quan doanh số</h2>
                      <p className="text-sm text-zinc-500">
                        {rangeMode === "week"
                          ? "Doanh thu theo tuần (Thứ 2 - Chủ nhật)."
                          : rangeMode === "month"
                          ? "Doanh thu 12 tháng trong năm."
                          : "Doanh thu 7 ngày gần nhất."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">Real-time</span>
                      <div className="flex overflow-hidden rounded-full border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 shadow-sm">
                        {[
                          { key: "day", label: "Ngày" },
                          { key: "week", label: "Tuần" },
                          { key: "month", label: "Tháng" },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => setRangeMode(opt.key)}
                            className={`px-3 py-1 transition ${
                              rangeMode === opt.key ? "bg-indigo-600 text-white" : "hover:bg-zinc-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-sm text-zinc-700 sm:grid-cols-3">
                    {(() => {
                      const totals = revenue.totals || {};
                      const sumSeries = (revenue.series || []).reduce((a, b) => a + (b.total || 0), 0);
                      const cards =
                        rangeMode === "week"
                          ? [
                              { label: "Tuần này", value: totals.sum ?? sumSeries },
                              { label: "7 ngày gần nhất", value: totals.last7 ?? totals.sum ?? sumSeries },
                              { label: "30 ngày gần nhất", value: totals.last30 ?? totals.sum ?? sumSeries },
                            ]
                          : rangeMode === "month"
                          ? [
                              { label: "Tháng này", value: totals.sum ?? sumSeries },
                              { label: "6 tháng gần nhất", value: totals.last30 ?? totals.sum ?? sumSeries },
                              { label: "12 tháng", value: sumSeries },
                            ]
                          : [
                              { label: "Hôm nay", value: totals.today || 0 },
                              { label: "7 ngày", value: totals.last7 || 0 },
                              { label: "30 ngày", value: totals.last30 || 0 },
                            ];
                      return cards.map((c) => (
                        <div key={c.label}>
                          <p className="text-xs text-zinc-500">{c.label}</p>
                          <p className="text-base font-semibold text-indigo-700">{formatMoney(c.value)}</p>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="mt-4 min-h-[340px] rounded-xl border border-zinc-100 bg-white">
                    {revLoading ? (
                      <div className="h-full rounded-xl bg-gradient-to-r from-indigo-200 via-sky-100 to-white animate-pulse" />
                    ) : revError ? (
                      <div className="flex h-full items-center justify-center text-sm text-red-600">{revError}</div>
                    ) : (
                      <RevenueChart series={revenue.series || []} mode={rangeMode} />
                    )}
                  </div>
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
                    badgeClass: productStatusStyle[p.status] || "bg-zinc-100 text-zinc-700 border border-zinc-200",
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
  const hasTrend = trend !== undefined && trend !== null;
  const trendStr = hasTrend ? `${trend > 0 ? "+" : ""}${trend}%` : null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="mt-2 text-3xl font-bold text-zinc-900">{value}</div>
      {customBadge ? (
        <div className="mt-2">{customBadge}</div>
      ) : hasTrend ? (
        <div className="mt-1 text-sm font-semibold text-emerald-600">{trendStr}</div>
      ) : (
        <div className="mt-1 text-sm text-zinc-400">—</div>
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

function RevenueChart({ series, mode = "day" }) {
  if (!series || series.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-500">Chưa có dữ liệu doanh thu</div>;
  }

  const max = Math.max(...series.map((s) => s.total), 1);
  const scale = (v) => Math.pow(v, 0.7); // nén biên độ để đỡ bẹt khi có outlier
  const maxScaled = scale(max);
  const last = series[series.length - 1];
  const first = series[0];

  const xPad = mode === "day" ? 0 : 1; // ngày: sát mép hơn, tuần/tháng giữ khoảng đệm
  const pts = series.map((s, idx) => {
    const x = xPad + (idx / Math.max(series.length - 1, 1)) * (100 - xPad * 2);
    const y = 60 - (scale(s.total) / maxScaled) * 50;
    return { x, y };
  });

  const linePath = pts.reduce((d, p, idx) => `${d}${idx === 0 ? "M" : " L"} ${p.x} ${p.y}`, "");
  const areaPath = `${linePath} L 100 70 L 0 70 Z`;

  const ticksY = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const maxLabels = mode === "month" ? 12 : mode === "week" ? 7 : 6;
  const step = Math.max(1, Math.floor(series.length / Math.max(maxLabels - 1, 1)));
  const xLabels = series.filter((_, idx) => idx % step === 0 || idx === series.length - 1);
  const dotStep = Math.max(1, Math.floor(series.length / 20)); // chỉ hiển thị điểm thưa để bớt rối
  const fmtLabel = (d) => {
    const dt = mode === "month" ? parseYMD(`${d}-01`) : parseYMD(d);
    if (mode === "month") return `T${dt.getMonth() + 1}`;
    if (mode === "week") return dt.toLocaleDateString("vi-VN", { weekday: "short" });
    return dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="p-3">
      <svg viewBox="0 0 100 70" className="h-80 w-full">
        <defs>
          <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <filter id="lineShadow" x="-10" y="-10" width="140" height="130">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.6" floodColor="#4f46e5" floodOpacity="0.35" />
          </filter>
        </defs>
        {ticksY.map((t) => {
          const y = 60 - (t / max) * 50;
          return <line key={t} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.4" strokeDasharray="2 2" />;
        })}
        <path d={areaPath} fill="url(#revFill)" stroke="none" />
        <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#lineShadow)" />
        {pts.map((p, idx) =>
          idx % dotStep === 0 || idx === pts.length - 1 ? (
            <circle key={idx} cx={p.x} cy={p.y} r="1.6" fill="#4f46e5" filter="url(#lineShadow)" />
          ) : null
        )}
        {ticksY.map((t, idx) => {
          const y = 60 - (t / max) * 50;
          return (
            <text key={idx} x="102" y={y + 1.5} fontSize="3" fill="#6b7280">
              {formatShort(t)}
            </text>
          );
        })}
        {xLabels.map((s, idx) => {
          const x = (series.indexOf(s) / Math.max(series.length - 1, 1)) * 100;
          return (
            <text key={idx} x={x} y="68" fontSize="3.5" fill="#6b7280" textAnchor="middle">
              {fmtLabel(s.date)}
            </text>
          );
        })}
      </svg>
      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
        <span>{first?.date}</span>
        <span>{last?.date}</span>
      </div>
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
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${data.badgeClass}`}>{data.badge}</span>
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
