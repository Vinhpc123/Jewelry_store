import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import instance, { getStoredToken } from "../lib/api";

const defaultCartValue = {
  items: [],
  loading: false,
  error: null,
  fetchCart: async () => undefined,
  addToCart: async () => undefined,
  updateQuantity: async () => undefined,
  removeItem: async () => undefined,
  clearCart: async () => undefined,
  itemCount: 0,
};

const CartContext = createContext(defaultCartValue);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await instance.get("/api/cart");
      setItems(res?.data?.items || []);
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Không tải được giỏ hàng.";
      setError(message);
      if (err?.response?.status === 401) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const token = getStoredToken();
    if (!token) {
      window.location.href = "/"; // yêu cầu đăng nhập
      return;
    }
    const payload = {
      productId: product?._id || product?.id || product?.productId,
      quantity,
    };
    const res = await instance.post("/api/cart/items", payload);
    setItems(res?.data?.items || []);
    return res?.data;
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const token = getStoredToken();
    if (!token) {
      window.location.href = "/";
      return;
    }
    const res = await instance.post("/api/cart/items", { productId, quantity });
    setItems(res?.data?.items || []);
    return res?.data;
  }, []);

  const removeItem = useCallback(async (productId) => {
    const token = getStoredToken();
    if (!token) {
      window.location.href = "/";
      return;
    }
    const res = await instance.delete(`/api/cart/items/${productId}`);
    setItems(res?.data?.items || []);
    return res?.data;
  }, []);

  const clearCart = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setItems([]);
      return;
    }
    const res = await instance.delete("/api/cart");
    setItems(res?.data?.items || []);
    return res?.data;
  }, []);

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount: items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0),
    }),
    [items, loading, error, fetchCart, addToCart, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}
