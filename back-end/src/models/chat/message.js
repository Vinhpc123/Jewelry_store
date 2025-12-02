// tạo model tin nhắn trong cuộc trò chuyện
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // ID cuộc trò chuyện
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    // ID người gửi
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Vai trò người gửi: admin, staff, customer
    senderRole: {
      type: String,
      enum: ["admin", "staff", "customer"],
      required: true,
    },
    // Nội dung tin nhắn
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
