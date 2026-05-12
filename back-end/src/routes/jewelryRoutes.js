import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";

import {
  getAllJewelry,
  getJewelryById,
  createJewelry,
  updateJewelry,
  deleteJewelry,
} from "../controllers/jewelryController.js";

const router = express.Router();

// Public product listing/detail; admin & staff for mutations
router.get("/", getAllJewelry);
router.get("/:id", getJewelryById);
router.post("/", protect, authorize("admin", "staff"), createJewelry);
router.put("/:id", protect, authorize("admin", "staff"), updateJewelry);
router.delete("/:id", protect, authorize("admin", "staff"), deleteJewelry);

export default router;
