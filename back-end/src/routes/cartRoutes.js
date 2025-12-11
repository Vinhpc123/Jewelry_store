import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { addOrUpdateItem, clearCart, getCart, removeItem } from "../controllers/cartController.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/items", addOrUpdateItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

export default router;
