import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { registerPublic } from "../controllers/authController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// public signup for customers
router.post("/signup", registerPublic);

// chỉ admin tạo tài khoản mới (admin-only register)
router.post("/register", protect, authorize("admin"), register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

export default router;
