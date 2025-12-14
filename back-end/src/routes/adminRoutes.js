import express from "express";
import { getAdminStats, getRevenueMetrics } from "../controllers/adminController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/stats", getAdminStats);
router.get("/metrics/revenue", getRevenueMetrics);

export default router;
