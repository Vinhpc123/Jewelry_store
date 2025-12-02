import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendMessageInternal } from "../controllers/chatController.js";

const STAFF_ROLES = new Set(["admin", "staff"]);

const getTokenFromSocket = (socket) => {
  const fromAuth = socket.handshake?.auth?.token;
  if (fromAuth) return fromAuth;

  const authHeader = socket.handshake?.headers?.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) {
        return next(new Error("Missing token"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user || !user.isActive) {
        return next(new Error("Invalid user"));
      }
      socket.data.user = user;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized socket"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    const userRoom = `user:${user._id}`;

    socket.join(userRoom);
    if (STAFF_ROLES.has(user.role)) {
      socket.join("admin");
    }

    socket.on("client:message", async (payload, callback) => {
      try {
        const { conversation, message } = await sendMessageInternal(user, payload);

        const targetRooms = new Set();
        targetRooms.add(`user:${conversation.userId}`);
        targetRooms.add("admin");
        io.to([...targetRooms]).emit("server:message", {
          conversationId: conversation._id,
          message,
        });

        if (typeof callback === "function") {
          callback({ ok: true, conversationId: conversation._id, message });
        }
      } catch (error) {
        if (typeof callback === "function") {
          callback({ ok: false, message: error.message || "Gui tin that bai" });
        }
      }
    });
  });

  return io;
};
