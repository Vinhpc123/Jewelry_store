import User from "../models/user.js";
import Jewelry from "../models/jewelry.js";
import Order from "../models/order.js";

const getTimestamp = (date) => {
  const time = date ? new Date(date).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

export const getAdminStats = async (_req, res) => {
  try {
    const now = new Date();
    const start7 = new Date(now);
    start7.setDate(start7.getDate() - 7);
    start7.setHours(0, 0, 0, 0);
    const prevStart7 = new Date(start7);
    prevStart7.setDate(prevStart7.getDate() - 7);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleAgg,
      totalJewelry,
      activeJewelry,
      completedJewelry,
      recentUsers,
      recentJewelry,
      newUsers7d,
      newUsersPrev7d,
      newProducts7d,
      newProductsPrev7d,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Jewelry.countDocuments({}),
      Jewelry.countDocuments({ status: "active" }),
      Jewelry.countDocuments({ status: "completed" }),
      User.find({}).sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      Jewelry.find({}).sort({ createdAt: -1 }).limit(5).select("title status createdAt"),
      User.countDocuments({ createdAt: { $gte: start7 } }),
      User.countDocuments({ createdAt: { $gte: prevStart7, $lt: start7 } }),
      Jewelry.countDocuments({ createdAt: { $gte: start7 } }),
      Jewelry.countDocuments({ createdAt: { $gte: prevStart7, $lt: start7 } }),
    ]);

    const roleCounts = roleAgg.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      { admin: 0, staff: 0, customer: 0 }
    );

    res.status(200).json({
      users: {
        total: totalUsers,
        prevTotal: Math.max(totalUsers - newUsers7d, 0),
        new7d: newUsers7d,
        prevNew7d: newUsersPrev7d,
        active: activeUsers,
        inactive: inactiveUsers,
        roles: roleCounts,
        recent: recentUsers,
      },
      jewelry: {
        total: totalJewelry,
        prevTotal: Math.max(totalJewelry - newProducts7d, 0),
        new7d: newProducts7d,
        prevNew7d: newProductsPrev7d,
        active: activeJewelry,
        completed: completedJewelry,
        recent: recentJewelry,
      },
      system: { status: "ok" },
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy thông kê", error: error.message });
  }
};

export const getRevenueMetrics = async (req, res) => {
  try {
    const mode = req.query.mode || "day"; // day | week | month
    let start;
    let end = new Date();
    let format = "%Y-%m-%d";
    let range = 7;

    if (mode === "week") {
      // current week, Monday -> Sunday
      const day = end.getDay(); // 0=Sun
      const diff = (day + 6) % 7; // days since Monday
      start = new Date(end);
      start.setDate(end.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      range = 7;
    } else if (mode === "month") {
      // current year, aggregate by month (Jan -> Dec)
      const year = end.getFullYear();
      start = new Date(year, 0, 1, 0, 0, 0, 0);
      end = new Date(year, 11, 31, 23, 59, 59, 999);
      range = 12;
      format = "%Y-%m";
    } else {
      // last 7 days including today
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      range = 7;
    }

    const revenueMatch = {
      createdAt: { $gte: start, $lte: end },
      $or: [
        { paymentMethod: "online", status: { $in: ["paid", "shipped", "completed"] } },
        { paymentMethod: "cod", status: "completed" },
      ],
    };

    const seriesAgg = await Order.aggregate([
      { $match: revenueMatch },
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const series = seriesAgg.map((item) => ({ date: item._id, total: item.total }));
    const totals = series.reduce(
      (acc, cur) => {
        acc.sum += cur.total;
        acc.last30 += cur.total;
        return acc;
      },
      { today: 0, last7: 0, last30: 0, sum: 0 }
    );

    if (mode === "day") {
      const todayStr = new Date().toISOString().slice(0, 10);
      const last7Date = new Date();
      last7Date.setDate(last7Date.getDate() - 7);
      const last7Str = last7Date.toISOString().slice(0, 10);
      series.forEach((item) => {
        if (item.date === todayStr) totals.today += item.total;
        if (item.date >= last7Str) totals.last7 += item.total;
      });
    }

    res.status(200).json({
      mode,
      range,
      series,
      totals,
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy thông kê", error: error.message });
  }
};
