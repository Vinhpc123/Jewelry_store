// Auth and User Management Controller

import User from "../models/user.js";
import { generateToken } from "../../utils/generateToken.js";

// Tao nguoi dung moi (admin)
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "staff" } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const newUser = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể tạo tài khoản", error: error.message });
  }
};

// Cho phep khach hang tu dang ky
export const registerPublic = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const newUser = await User.create({ name, email, password, role: "customer" });
    const token = generateToken({ userId: newUser._id, role: newUser.role });
    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể tạo tài khoản", error: error.message });
  }
};

// Xac thuc user va tra token + thong tin user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    const now = Date.now();
    const MAX_ATTEMPTS = 5;

    if (user.lockUntil && user.lockUntil > now) {
      return res.status(403).json({ message: "Tài khoản đang bị khóa, vui lòng liên hệ admin" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa! Liên hệ với admin để được yêu cầu hỗ trợ." });
    }

    const passwordOk = await user.matchPassword(password);

    if (!passwordOk) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.isActive = false;
        user.lockUntil = new Date(now + 60 * 60 * 1000); // lock 1h, admin co the mo khoa som hon
      }
      await user.save();
      const locked = !user.isActive;
      const message = locked
        ? "Tài khoản đã bị khóa do nhập sai quá nhiều lần, vui lòng liên hệ admin"
        : "Email hoặc mật khẩu không đúng";
      const status = locked ? 403 : 401;
      return res.status(status).json({ message });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = generateToken({ userId: user._id, role: user.role });
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể đăng nhập", error: error.message });
  }
};

// Tra thong tin user hien tai
export const logout = async (_req, res) => {
  res.status(200).json({ message: "Đăng xuất thành công" });
};

export const getProfile = (req, res) => {
  res.status(200).json(req.user);
};

// Cap nhat ten hoac mat khau cua user dang dang nhap
export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name && !password) {
      return res.status(400).json({ message: "Không có dữ liệu cập nhật" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    if (name) user.name = name;
    if (password) user.password = password; // được hash bởi hook save
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể cập nhật", error: error.message });
  }
};
