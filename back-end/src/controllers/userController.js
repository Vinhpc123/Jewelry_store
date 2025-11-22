// Xu ly cac yeu cau lien quan den nguoi dung
import User from "../models/user.js";

// Lay danh sach nguoi dung voi bo loc tuy chon
export const getUsers = async (req, res) => {
  try {
    const { q = "", role } = req.query;

    const filters = {};
    if (role && role !== "all") {
      filters.role = role;
    }

    if (q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filters.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filters).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Khong the lay danh sach nguoi dung", error: error.message });
  }
};

// Lay thong tin chi tiet cua mot nguoi dung theo ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Khong tim thay nguoi dung" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Khong the lay thong tin nguoi dung", error: error.message });
  }
};

// Cap nhat trang thai hoat dong cua nguoi dung
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "Trang thai khong hop le" });
    }

    if (String(req.user._id) === id) {
      return res.status(400).json({ message: "Khong the tu thay doi trang thai cua ban" });
    }

    const updatePayload = { isActive };
    if (isActive === true) {
      updatePayload.loginAttempts = 0;
      updatePayload.lockUntil = null;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Khong tim thay nguoi dung" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Khong the cap nhat trang thai nguoi dung", error: error.message });
  }
};

// Cap nhat thong tin nguoi dung
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const allowedRoles = ["admin", "staff", "customer"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Vai tro khong hop le" });
    }

    if (typeof name === "string" && name.trim().length === 0) {
      return res.status(400).json({ message: "Ten khong hop le" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Khong tim thay nguoi dung" });
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({ message: "Email da duoc su dung" });
      }
      user.email = normalizedEmail;
    }

    if (typeof name === "string") {
      user.name = name.trim();
    }

    if (role) {
      user.role = role;
    }

    const updatedUser = await user.save();
    const sanitized = updatedUser.toObject();
    delete sanitized.password;

    res.status(200).json(sanitized);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Khong the cap nhat thong tin nguoi dung", error: error.message });
  }
};

// Xoa nguoi dung
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user._id) === id) {
      return res.status(400).json({ message: "Khong the tu xoa tai khoan cua ban" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Khong tim thay nguoi dung" });
    }

    res.status(200).json({ message: "Da xoa nguoi dung" });
  } catch (error) {
    res.status(500).json({ message: "Khong the xoa nguoi dung", error: error.message });
  }
};
