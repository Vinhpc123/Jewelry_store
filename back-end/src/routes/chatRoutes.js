import express from "express";
import {
  getMessagesByConversation,
  listConversations,
  sendMessage,
} from "../controllers/chatController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/messages", protect, sendMessage);
router.get("/conversations", protect, listConversations);
router.get("/conversations/:conversationId/messages", protect, getMessagesByConversation);

export default router;
