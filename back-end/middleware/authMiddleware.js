import jwt from "jsonwebtoken";
import User from "../src/models/user.js";

// Middleware xac thuc nguoi dung
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Tài khoản không hoạt động" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Không thể xác thực", error: error.message });
  }
};

// Middleware kiem tra vai tro nguoi dung
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }
  next();
};
