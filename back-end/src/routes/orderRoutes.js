import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateStatus,
  getAllOrders,
  cancelOrder,
  createPosOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "staff"), getAllOrders);
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.put("/:id/cancel", cancelOrder);
router.get("/:id", getOrderById);
router.put("/:id/status", authorize("admin", "staff"), updateStatus);
router.post("/pos", authorize("admin", "staff"), createPosOrder);

export default router;
