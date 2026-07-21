import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { getStoredToken, setAuthToken } from "./lib/api";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";
import { ConfirmProvider } from "./components/ui/ConfirmProvider.jsx";

const savedToken = getStoredToken();
if (savedToken) {
  setAuthToken(savedToken);
}

// Wake up Render free-tier backend (spins down after ~15min inactivity)
const BACKEND = import.meta.env.VITE_API_BASE_URL || "https://jewelry-store-wgnr.onrender.com";
fetch(`${BACKEND}/api/jewelry?limit=1`).catch(() => {});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>
);
