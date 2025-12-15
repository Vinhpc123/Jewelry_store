import express from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/users/  - admin only
router.get("/", protect, authorize("admin", "staff"), getUsers);
router.get("/:id", protect, authorize("admin", "staff"), getUserById);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus); // khóa/mở khóa: chỉ admin
router.put("/:id", protect, authorize("admin", "staff"), updateUser);
router.delete("/:id", protect, authorize("admin", "staff"), deleteUser);

export default router;
