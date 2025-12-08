import Conversation from "../models/chat/conversation.js";
import Message from "../models/chat/message.js";

const ALLOWED_STAFF_ROLES = new Set(["admin", "staff"]);

export const sendMessageInternal = async (user, payload) => {
  const { conversationId, toUserId, content } = payload || {};

  if (!content || !content.trim()) {
    throw new Error("Nội dung tin nhắn không hợp lệ ");
  }

  let conversation = null;

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Không tìm thấy cuộc trò chuyện");
    }
    if (user.role === "customer" && String(conversation.userId) !== String(user._id)) {
      throw new Error("Không có quyền truy cập cuộc trò chuyện này");
    }
  } else if (user.role === "customer") {
    conversation =
      (await Conversation.findOne({ userId: user._id })) ||
      (await Conversation.create({ userId: user._id }));
  } else if (ALLOWED_STAFF_ROLES.has(user.role) && toUserId) {
    conversation =
      (await Conversation.findOne({ userId: toUserId })) ||
      (await Conversation.create({ userId: toUserId, assignedAdminId: user._id }));
  } else {
    throw new Error("Cần conversationId hoặc toUserId để gửi tin nhắn");
  }

  conversation.status = "open";
  conversation.lastMessageAt = new Date();
  if (ALLOWED_STAFF_ROLES.has(user.role) && !conversation.assignedAdminId) {
    conversation.assignedAdminId = user._id;
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: user._id,
    senderRole: user.role,
    content: content.trim(),
  });

  if (user.role === "customer") {
    conversation.unreadForAdmin = (conversation.unreadForAdmin || 0) + 1;
  } else {
    conversation.unreadForUser = (conversation.unreadForUser || 0) + 1;
  }

  await conversation.save();

  return { conversation, message };
};

export const sendMessage = async (req, res) => {
  try {
    const { conversation, message } = await sendMessageInternal(req.user, req.body);

    const io = req.app.get("io");
    if (io) {
      const targetRooms = new Set();
      targetRooms.add(`user:${conversation.userId}`);
      targetRooms.add("admin");
      io.to([...targetRooms]).emit("server:message", {
        conversationId: conversation._id,
        message,
      });
    }

    res.status(201).json({ conversationId: conversation._id, message });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể gửi tin nhắn", error: error.message || error.toString() });
  }
};

export const listConversations = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "customer") {
      filter.userId = req.user._id;
    } else if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const conversations = await Conversation.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể lấy danh sách cuộc trò chuyện", error: error.message });
  }
};

export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const { date, from, to } = req.query;
    const messageFilter = { conversationId };

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
    }

    if (
      req.user.role === "customer" &&
      String(conversation.userId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "Không có quyền xem cuộc trò chuyện này" });
    }

    if (ALLOWED_STAFF_ROLES.has(req.user.role) && req.query.userId) {
      if (String(conversation.userId) !== String(req.query.userId)) {
        return res.status(403).json({ message: "Cuộc trò chuyện không thuộc về user này" });
      }
    }

    if (date) {
      const dayStart = new Date(date);
      if (!Number.isNaN(dayStart)) {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        messageFilter.createdAt = { $gte: dayStart, $lt: dayEnd };
      }
    } else if (from || to) {
      messageFilter.createdAt = {};
      if (from && !Number.isNaN(new Date(from))) {
        messageFilter.createdAt.$gte = new Date(from);
      }
      if (to && !Number.isNaN(new Date(to))) {
        messageFilter.createdAt.$lt = new Date(to);
      }
      if (!Object.keys(messageFilter.createdAt).length) {
        delete messageFilter.createdAt;
      }
    }

    const messages = await Message.find(messageFilter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    if (messages.length) {
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: req.user._id },
          seenAt: null,
        },
        { seenAt: new Date() }
      );
    }

    if (req.user.role === "customer") {
      conversation.unreadForUser = 0;
    } else {
      conversation.unreadForAdmin = 0;
    }
    await conversation.save();

    res.status(200).json({ conversation, messages, page, limit });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể lấy tin nhắn", error: error.message || error.toString() });
  }
};
