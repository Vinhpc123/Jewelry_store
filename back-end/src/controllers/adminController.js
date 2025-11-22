import User from "../models/user.js";
import Jewelry from "../models/jewelry.js";

// Lay thong ke cho trang admin dashboard
export const getAdminStats = async (_req, res) => {
  try {
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
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Jewelry.countDocuments({}),
      Jewelry.countDocuments({ status: "active" }),
      Jewelry.countDocuments({ status: "completed" }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt"),
      Jewelry.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title status createdAt"),
    ]);

    // Chuyen doi ket qua dem vai tro thanh doi tuong
    const roleCounts = roleAgg.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      { admin: 0, staff: 0, customer: 0 }
    );

    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        roles: roleCounts,
        recent: recentUsers,
      },
      jewelry: {
        total: totalJewelry,
        active: activeJewelry,
        completed: completedJewelry,
        recent: recentJewelry,
      },
      system: {
        status: "ok",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Khong the lay thong ke", error: error.message });
  }
};
