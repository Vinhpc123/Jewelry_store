import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";

import {
  getAllJewelry,
  createJewelry,
  updateJewelry,
  deleteJewelry,
} from "../controllers/jewelryController.js";

const router = express.Router();

router.get("/", protect, getAllJewelry);
router.post("/", protect, authorize("admin"), createJewelry);
router.put("/:id", protect, authorize("admin"), updateJewelry);
router.delete("/:id", protect, authorize("admin"), deleteJewelry);

export default router;
