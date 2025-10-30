
import User from "../models/user.js";

export const getUsers = async (req, res) => {
  try {
    // Lấy danh sách người dùng, loại trừ trường mật khẩu
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách người dùng", error: error.message });
  }
};
