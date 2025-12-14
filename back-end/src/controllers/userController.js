import User from "../models/user.js";

export const getUsers = async (req, res) => {
  try {
    const { q = "", role } = req.query;
    const filters = {};
    if (role && role !== "all") filters.role = role;
    if (q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filters.$or = [{ name: regex }, { email: regex }];
    }
    const users = await User.find(filters).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Khong the lay danh sach nguoi dung", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Khong tim thay nguoi dung" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Khong the lay thong tin nguoi dung", error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return res.status(400).json({ message: "Trang thai khong hop le" });
    if (String(req.user._id) === id) return res.status(400).json({ message: "Khong the tu thay doi trang thai" });

    const updatePayload = { isActive };
    if (isActive === true) {
      updatePayload.loginAttempts = 0;
      updatePayload.lockUntil = null;
    }
    const updatedUser = await User.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "Khong tim thay nguoi dung" });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Khong the cap nhat trang thai", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, address, password: newPassword } = req.body;
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    const allowedRoles = ["admin", "staff", "customer"];

    if (role && !allowedRoles.includes(role)) return res.status(400).json({ message: "Vai tro khong hop le" });
    if (typeof name === "string" && name.trim().length === 0) return res.status(400).json({ message: "Ten khong hop le" });
    if (phone !== undefined) {
      const phoneStr = String(phone).trim();
      if (phoneStr && !phoneRegex.test(phoneStr)) {
        return res.status(400).json({ message: "So dien thoai khong hop le (10 so, bat dau bang 03,05,07,08,09)." });
      }
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Khong tim thay nguoi dung" });

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({ message: "Email da duoc su dung" });
      }
      user.email = normalizedEmail;
    }
    if (typeof name === "string") user.name = name.trim();
    if (role) user.role = role;
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = address;
    if (newPassword) {
      if (String(newPassword).length < 6) return res.status(400).json({ message: "Mat khau phai tu 6 ky tu" });
      user.password = newPassword;
    }

    const updatedUser = await user.save();
    const sanitized = updatedUser.toObject();
    delete sanitized.password;
    res.status(200).json(sanitized);
  } catch (error) {
    res.status(500).json({ message: "Khong the cap nhat thong tin nguoi dung", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(req.user._id) === id) return res.status(400).json({ message: "Khong the tu xoa tai khoan" });

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "Khong tim thay nguoi dung" });

    res.status(200).json({ message: "Da xoa nguoi dung" });
  } catch (error) {
    res.status(500).json({ message: "Khong the xoa nguoi dung", error: error.message });
  }
};
