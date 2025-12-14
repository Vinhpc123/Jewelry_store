// Auth and User Management Controller
import User from "../models/user.js";
import { generateToken } from "../../utils/generateToken.js";

// Tao nguoi dung moi (admin)
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "staff", phone, address, avatar } = req.body;
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email da ton tai" });
    }
    if (phone && !phoneRegex.test(String(phone).trim())) {
      return res.status(400).json({ message: "So dien thoai khong hop le (10 so, bat dau bang 03,05,07,08,09)." });
    }

    const newUser = await User.create({ name, email, password, role, phone, address, avatar });
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      phone: newUser.phone,
      address: newUser.address,
    });
  } catch (error) {
    res.status(500).json({ message: "Khong the tao tai khoan", error: error.message });
  }
};

// Cho phep khach hang tu dang ky
export const registerPublic = async (req, res) => {
  try {
    const { name, email, password, phone, address, avatar } = req.body;
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email da ton tai" });
    }
    if (phone && !phoneRegex.test(String(phone).trim())) {
      return res.status(400).json({ message: "So dien thoai khong hop le (10 so, bat dau bang 03,05,07,08,09)." });
    }

    const newUser = await User.create({ name, email, password, role: "customer", phone, address, avatar });
    const token = generateToken({ userId: newUser._id, role: newUser.role });
    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        phone: newUser.phone,
        address: newUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Khong the tao tai khoan", error: error.message });
  }
};

// Xac thuc user va tra token + thong tin user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Khong tim thay tai khoan" });
    }

    const now = Date.now();
    const MAX_ATTEMPTS = 5;

    if (user.lockUntil && user.lockUntil > now) {
      return res.status(403).json({ message: "Tai khoan dang bi khoa, vui long lien he admin" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tai khoan da bi khoa! Lien he voi admin de duoc ho tro." });
    }

    const passwordOk = await user.matchPassword(password);

    if (!passwordOk) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.isActive = false;
        user.lockUntil = new Date(now + 60 * 60 * 1000); // lock 1h
      }
      await user.save();
      const locked = !user.isActive;
      const message = locked
        ? "Tai khoan da bi khoa do nhap sai qua nhieu lan, vui long lien he admin"
        : "Email hoac mat khau khong dung";
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
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Khong the dang nhap", error: error.message });
  }
};

// Tra thong tin user hien tai
export const logout = async (_req, res) => {
  res.status(200).json({ message: "Dang xuat thanh cong" });
};

export const getProfile = (req, res) => {
  res.status(200).json(req.user);
};

// Cap nhat ten / mat khau / avatar / phone / address cua user dang dang nhap
export const updateProfile = async (req, res) => {
  try {
    const { name, password, avatar, phone, address } = req.body;
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!name && !password && !avatar && !phone && !address) {
      return res.status(400).json({ message: "Khong co du lieu cap nhat" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Khong tim thay tai khoan" });
    }

    if (name) user.name = name;
    if (password) user.password = password;
    if (avatar) user.avatar = avatar;
    if (phone !== undefined) {
      const phoneStr = String(phone).trim();
      if (phoneStr && !phoneRegex.test(phoneStr)) {
        return res.status(400).json({ message: "So dien thoai khong hop le (10 so, bat dau bang 03,05,07,08,09)." });
      }
      user.phone = phoneStr;
    }
    if (address !== undefined) user.address = address;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ message: "Khong the cap nhat", error: error.message });
  }
};
