import express from "express";
import { getUsers } from "../controllers/userController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/users/  - admin only
router.get("/", protect, authorize("admin"), getUsers);

export default router;
