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
      // ignore storage errors in some envs but log for debugging
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

export default instance;

