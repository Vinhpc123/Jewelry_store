// Aut and User Management Controller

import User from "../models/user.js";
import { generateToken } from "../../utils/generateToken.js";

//tao nguoi dung moi
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

// công khai cho người dùng đăng ký
export const registerPublic = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Force role to 'customer' for public signups
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

// xác thực user và trả token + user info.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

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

// trả thông tin user hiện tại.
export const logout = async (_req, res) => {
  // Nếu dùng refresh-token => lưu token vào blacklist ở DB/Redis trước khi phản hồi.
  res.status(200).json({ message: "Đăng xuất thành công" });
};

export const getProfile = (req, res) => {
  res.status(200).json(req.user);
};


// cập nhật tên hoặc mật khẩu của user đang đăng nhập.
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
    if (password) user.password = password; // được hash ở hook save
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
