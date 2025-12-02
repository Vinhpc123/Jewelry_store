import React from "react";
import { io } from "socket.io-client";
import { MessageSquare, Send, Loader2, Users, Radio } from "lucide-react";
import AdminLayout from "../../components/Admin/AdminLayout";
import AdminRoute from "../../components/Admin/AdminRoute";
import {
  fetchConversations,
  fetchMessages,
  fetchUserById,
  getStoredToken,
  getUser,
  sendChatMessage,
  setAuthToken,
} from "../../lib/api";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Messenger() {
  const [conversations, setConversations] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [userMap, setUserMap] = React.useState({});
  const bottomRef = React.useRef(null);
  const socketRef = React.useRef(null);
  const selectedRef = React.useRef(null);
  const me = getUser();

  React.useEffect(() => {
    const token = getStoredToken();
    if (token) setAuthToken(token);

    loadConversations();

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("server:message", handleIncoming);

    return () => {
      socket.off("server:message", handleIncoming);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    }
    selectedRef.current = selectedId;
  }, [selectedId]);

  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleIncoming = React.useCallback(
    (payload) => {
      const { conversationId, message } = payload || {};
      if (!conversationId || !message) return;
      if (me?._id && String(message.senderId) === String(me._id)) return;

      setConversations((prev) => {
        const list = [...prev];
        const idx = list.findIndex((c) => String(c._id) === String(conversationId));
        if (idx >= 0) {
          const updated = {
            ...list[idx],
            lastMessageAt: message.createdAt,
            unreadForAdmin:
              me?.role === "admin" || me?.role === "staff" 
                ? (list[idx].unreadForAdmin || 0) + (message.senderRole === "customer" ? 1 : 0)
                : list[idx].unreadForAdmin,
            unreadForUser:
              me?.role === "customer"
                ? (list[idx].unreadForUser || 0) + (message.senderRole !== "customer" ? 1 : 0)
                : list[idx].unreadForUser,
          };
          list.splice(idx, 1);
          list.unshift(updated);
        } else {
          list.unshift({
            _id: conversationId,
            userId: message.senderId,
            lastMessageAt: message.createdAt,
            unreadForAdmin: me?.role === "admin" || me?.role === "staff" ? 1 : 0,
            unreadForUser: me?.role === "customer" ? 1 : 0,
          });
        }
        return list;
      });

      if (selectedRef.current && String(conversationId) === String(selectedRef.current)) {
        setMessages((prev) => [...prev, message]);
      }
    },
    [me?.role]
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await fetchConversations();
      const list = res?.data || [];
      setConversations(list);

      const uniqueUserIds = [...new Set(list.map((c) => c.userId).filter(Boolean))];
      if (uniqueUserIds.length) {
        const pairs = await Promise.all(
          uniqueUserIds.map(async (id) => {
            try {
              const uRes = await fetchUserById(id);
              return [id, uRes?.data];
            } catch {
              return [id, null];
            }
          })
        );
        setUserMap(Object.fromEntries(pairs));
      }

      if (list.length) {
        setSelectedId(list[0]._id);
      }
    } catch (error) {
      console.error("loadConversations error", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const res = await fetchMessages(conversationId, { page: 1, limit: 50 });
      setMessages(res?.data?.messages || []);
      setConversations((prev) =>
        prev.map((c) =>
          String(c._id) === String(conversationId) ? { ...c, unreadForAdmin: 0 } : c
        )
      );
    } catch (error) {
      console.error("loadMessages error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedId) return;
    try {
      setSending(true);
      const res = await sendChatMessage({ conversationId: selectedId, content: input.trim() });
      const newMsg = res?.data?.message;
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
        setConversations((prev) => {
          const list = [...prev];
          const idx = list.findIndex((c) => String(c._id) === String(selectedId));
          if (idx >= 0) {
            const updated = { ...list[idx], lastMessageAt: newMsg.createdAt };
            list.splice(idx, 1);
            list.unshift(updated);
          }
          return list;
        });
      }
      setInput("");
    } catch (error) {
      console.error("send error", error);
    } finally {
      setSending(false);
    }
  };

  const activeUser = selectedId
    ? userMap[conversations.find((c) => c._id === selectedId)?.userId]
    : null;

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-md">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Hỗ trợ</p>
                    <p className="text-sm font-semibold">Cuộc trò chuyện</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                  {conversations.length} phiên
                </span>
              </div>

              <div className="max-h-[70vh] divide-y overflow-y-auto">
                {loading && !conversations.length ? (
                  <div className="flex items-center gap-2 p-4 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isActive = selectedId === c._id;
                    const userInfo = userMap[c.userId];
                    const name = userInfo?.name || userInfo?.email || "Khách hàng";
                    const unread = c.unreadForAdmin || 0;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setSelectedId(c._id)}
                        className={`block w-full text-left px-4 py-3 transition ${
                          isActive ? "bg-indigo-50" : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-sm font-semibold">
                              {(name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-zinc-900">
                                {name}
                              </p>
                              <p className="truncate text-xs text-zinc-500">
                                {userInfo?.email || c._id}
                              </p>
                            </div>
                          </div>
                          {unread > 0 ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                              {unread} mới
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })
                )}

                {!conversations.length && !loading ? (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    Chưa có cuộc trò chuyện
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="relative flex h-[75vh] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 p-2 text-white">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Đang chat</p>
                    <p className="text-sm font-semibold">
                      {activeUser?.name || activeUser?.email || "Chọn một cuộc trò chuyện"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang online
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto bg-gradient-to-br from-indigo-50/60 via-white to-sky-50 px-4 py-4">
                {loading && !messages.length ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải tin nhắn...
                  </div>
                ) : null}

                {messages.map((m) => {
                  const isMine = String(m.senderId) === String(me?._id);
                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow ${
                          isMine
                            ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white"
                            : "bg-white text-zinc-800 border border-zinc-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <div
                          className={`mt-1 flex items-center gap-1 text-[11px] ${
                            isMine ? "text-indigo-100/90" : "text-zinc-500"
                          }`}
                        >
                          <ClockIcon />
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="border-t bg-white/90 p-4 backdrop-blur">
                <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 shadow-sm focus-within:border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-100">
                  <Radio className="h-4 w-4 text-indigo-500" />
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
                    disabled={!input.trim() || sending || !selectedId}
                    className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-indigo-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

function ClockIcon() {
  return <span className="inline-block h-3 w-3 rounded-full bg-current opacity-70" />;
}
