import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import { createCoupon, deleteCoupon, listCoupons, updateCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", listCoupons);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
