import React from "react";
import { io } from "socket.io-client";
import {
  fetchConversations,
  fetchMessages,
  getStoredToken,
  getUser,
  sendChatMessage,
  setAuthToken,
} from "../../lib/api";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Chat() {
  const [conversationId, setConversationId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const socketRef = React.useRef(null);
  const bottomRef = React.useRef(null);
  const conversationRef = React.useRef(null);
  const readyRef = React.useRef(false);
  const me = getUser();

  React.useEffect(() => {
    conversationRef.current = conversationId;
  }, [conversationId]);

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) setAuthToken(token);

    // Kiểm tra và tải cuộc trò chuyện hiện có
    (async () => {
      try {
        setLoading(true);
        //Lấy cuộc trò chuyện đầu tiên của người dùng
        // Nếu không có cuộc trò chuyện, backend sẽ tạo một cuộc trò chuyện mới khi gửi tin nhắn đầu tiên
        const res = await fetchConversations({ userId: me?._id });
        const conv = res?.data?.[0];
        if (conv?._id) {
          setConversationId(conv._id);
          const msgRes = await fetchMessages(conv._id, {
            page: 1,
            limit: 50,
            userId: me?._id,
          });
          setMessages(msgRes?.data?.messages || []);
        }
      } catch (error) {
        console.error("Tải cuộc trò chuyện thất bại", error);
      } finally {
        setLoading(false);
      }
    })();

    // Init socket
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("server:message", ({ conversationId: cid, message }) => {
      if (!cid || !message) return;
      readyRef.current = true;
      setConversationId((prev) => prev || cid);
      const current = conversationRef.current;
      if (current && String(current) !== String(cid)) return;
      if (me?._id && String(message.senderId) === String(me._id)) return;
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("server:message");
      socket.disconnect();
    };
    // để trống mảng phụ thuộc để chỉ chạy một lần khi component được gắn kết
  }, []);

  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  React.useEffect(() => {
    if (!conversationId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchMessages(conversationId, {
          page: 1,
          limit: 50,
          userId: me?._id,
        });
        setMessages(res?.data?.messages || []);
      } catch (error) {
        console.error("Tải tin nhắn thất bại", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [conversationId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      setSending(true);
      const res = await sendChatMessage({ conversationId, content: input.trim() });
      const cid = res?.data?.conversationId || conversationId;
      const msg = res?.data?.message;
      if (cid) setConversationId(cid);
      if (msg) setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-4 py-6">
      <header className="mb-4 flex items-center justify-between rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 shadow-sm">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-500">Hỗ trợ</p>
          <h1 className="text-lg font-semibold text-zinc-900">Chat với Admin</h1>
          <p className="text-sm text-zinc-500">Nhận phản hồi nhanh từ đội ngũ hỗ trợ.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
          {me?.email || "Bạn"}
        </div>
      </header>

      <div className="flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="h-[65vh] space-y-3 overflow-y-auto bg-gradient-to-br from-indigo-50/50 via-white to-sky-50 px-4 py-4">
          {loading && !messages.length ? (
            <div className="text-sm text-zinc-500">Đang tải tin nhắn...</div>
          ) : null}

          {messages.map((m) => {
            const isMe = String(m.senderId) === String(me?._id);
            return (
              <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow ${
                    isMe
                      ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white"
                      : "bg-white text-zinc-800 border border-zinc-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <div
                    className={`mt-1 text-[11px] ${
                      isMe ? "text-indigo-100/90" : "text-zinc-500"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
          {!messages.length && !loading ? (
            <div className="text-center text-sm text-zinc-500">Bắt đầu trò chuyện với chúng tôi.</div>
          ) : null}
        </div>

        <div className="border-t bg-white/90 p-4 backdrop-blur">
          <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 shadow-sm focus-within:border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="w-full border-none bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-indigo-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" /> : null}
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
