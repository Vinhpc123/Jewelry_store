import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { createVnpPayment, handleVnpReturn } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/vnpay/create", protect, createVnpPayment);
router.get("/vnpay/return", handleVnpReturn);

export default router;
