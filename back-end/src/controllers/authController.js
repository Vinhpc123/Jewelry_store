// Auth and User Management Controller
import crypto from "crypto";
import User from "../models/user.js";
import { generateToken } from "../../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

let firebaseAuthInstance = null;
const getFirebaseAuth = async () => {
  if (firebaseAuthInstance) return firebaseAuthInstance;

  const credsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  try {
    // Lazy import to khong crash khi chua cai firebase-admin
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      const credential = credsJson
        ? admin.credential.cert(JSON.parse(credsJson))
        : admin.credential.applicationDefault();
      admin.initializeApp({ credential });
    }
    firebaseAuthInstance = admin.auth();
    return firebaseAuthInstance;
  } catch (err) {
    throw new Error(
      "Google login chua duoc cau hinh (thieu firebase-admin hoac bien moi truong GOOGLE_CREDENTIALS_JSON)"
    );
  }
};

// Tao nguoi dung moi (admin)
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "staff", phone, address, avatar } = req.body;
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    if (phone && !phoneRegex.test(String(phone).trim())) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03,05,07,08,09)." });
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
    res.status(500).json({ message: "Không thể tạo tài khoản", error: error.message });
  }
};

// Cho phep khach hang tu dang ky
export const registerPublic = async (req, res) => {
  try {
    const { name, email, password, phone, address, avatar } = req.body;
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    if (phone && !phoneRegex.test(String(phone).trim())) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03,05,07,08,09)." });
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
      return res.status(403).json({ message: "Tài khoản đã bị khóa! Liên hệ với admin để được hỗ trợ." });
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
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể đăng nhập", error: error.message });
  }
};


// Quen mat khau - gui email dat lai mat khau
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

    const user = await User.findOne({ email });
    // Luon tra 200 de tranh lo email ton tai hay khong
    const genericMessage = "Nếu email hợp lệ, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.";
    if (!user) return res.status(200).json({ message: genericMessage });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = expires;
    await user.save();

    const appUrl = (process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetLink = `${appUrl}/reset-password?token=${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Đặt lại mật khẩu Jewelry Store",
        text: `Nhấn vào link sau để đặt lại mật khẩu: ${resetLink}`,
        html: `<p>Bạn vừa yêu cầu đặt lại mật khẩu.</p><p><a href="${resetLink}">Nhấn vào đây để đặt lại</a></p><p>Link hết hạn sau 15 phút.</p>`,
      });
    } catch (mailErr) {
      return res.status(500).json({ message: "Không thể gửi email reset", error: mailErr.message });
    }

    return res.status(200).json({ message: genericMessage });
  } catch (error) {
    res.status(500).json({ message: "Không thể xử lý quên mật khẩu", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });

    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.loginAttempts = 0;
    user.isActive = true;
    await user.save();

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Không thể đặt lại mật khẩu", error: error.message });
  }
};

// Tra thong tin user hien tai
export const logout = async (_req, res) => {
  res.status(200).json({ message: "Đăng xuất thành công" });
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
      return res.status(400).json({ message: "Không có dữ liệu cập nhật" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    if (name) user.name = name;
    if (password) user.password = password;
    if (avatar) user.avatar = avatar;
    if (phone !== undefined) {
      const phoneStr = String(phone).trim();
      if (phoneStr && !phoneRegex.test(phoneStr)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03,05,07,08,09)." });
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
    res.status(500).json({ message: "Không thể cập nhật", error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    const auth = await getFirebaseAuth();
    const decoded = await auth.verifyIdToken(idToken);

    const email = decoded?.email;
    if (!email) return res.status(400).json({ message: "Google account missing email" });

    let user = await User.findOne({ email });

    if (user && user.isActive === false) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa, vui lòng liên hệ admin" });
    }

    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      user = await User.create({
        name: decoded?.name || email,
        email,
        password: randomPassword,
        role: "customer",
        avatar: decoded?.picture,
      });
    } else {
      // Cập nhật avatar/tên nếu trống
      let changed = false;
      if (!user.avatar && decoded?.picture) {
        user.avatar = decoded.picture;
        changed = true;
      }
      if (!user.name && decoded?.name) {
        user.name = decoded.name;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = generateToken({ userId: user._id, role: user.role });
    return res.status(200).json({
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
    console.error("Google login error:", error);
    return res.status(500).json({
      message: "Không thể đăng nhập Google",
      error: error.message || error.toString(),
    });
  }
};


