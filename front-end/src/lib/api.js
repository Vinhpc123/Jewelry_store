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
      // báo lỗi nhưng không làm gián đoạn ứng dụng
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

export default instance;

// Thiết lập interceptor để xử lý lỗi 401 Unauthorized
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      setAuthToken(null);   // gỡ header Authorization và xóa token lưu trong localStorage
      setUser(null);        // xóa thông tin user cache
      window.location.href = "/login?expired=1"; // hoặc dùng router navigate
    }
    return Promise.reject(error);
  }
);
