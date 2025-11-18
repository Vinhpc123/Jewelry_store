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
router.get("/", protect, authorize("admin"), getUsers);
router.get("/:id", protect, authorize("admin"), getUserById);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
