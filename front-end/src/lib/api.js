import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      localStorage.setItem("token", token);
    } catch (err) {
      console.warn("localStorage.setItem failed:", err);
    }
  } else {
    delete instance.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem("token");
    } catch (err) {
      console.warn("localStorage.removeItem failed:", err);
    }
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem("token");
  } catch (err) {
    console.warn("localStorage.getItem failed:", err);
    return null;
  }
}

export function setUser(user) {
  try {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  } catch (err) {
    console.warn("localStorage.setItem user failed:", err);
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("localStorage.getItem user failed:", err);
    return null;
  }
}

export function signup(payload) {
  return instance.post("/api/auth/signup", payload);
}

export function login(payload) {
  return instance.post("/api/auth/login", payload);
}

export function fetchUserById(id) {
  return instance.get(`/api/users/${id}`);
}

export function updateUserById(id, payload) {
  return instance.put(`/api/users/${id}`, payload);
}

// Chat APIs
export function fetchConversations(params = {}) {
  return instance.get("/api/chat/conversations", { params });
}
export function fetchMessages(conversationId, params = {}) {
  return instance.get(`/api/chat/conversations/${conversationId}/messages`, { params });
}
export function sendChatMessage(payload) {
  return instance.post("/api/chat/messages", payload);
}
export default instance;

// Interceptor xử lý 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthLogin = requestUrl.includes("/api/auth/login");

    // Chỉ redirect khi 401 từ API khác login
    if (status === 401 && !isAuthLogin) {
      setAuthToken(null);
      setUser(null);
      window.location.href = "/"; // điều hướng về trang login/chính
    }
    return Promise.reject(error);
  }
);
