"use client";

// ============================================================
// Cart Context - Global cart state management
// ============================================================
// Ki kore: Pura app e cart er state manage kore
// Keno: Navbar e cart count, CartDrawer e items, Checkout e total -
//       shob jaygay cart data lagey, Context diye share kori
// Session: localStorage e UUID store kori, server-side cart track kore
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../lib/api";

const CartContext = createContext();

// Session ID generate/retrieve - browser e persist thake (SSR-safe)
function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("shopbot_session");
  if (!id) {
    id = "web_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("shopbot_session", id);
  }
  return id;
}

export function CartProvider({ children }) {
  const [sessionId, setSessionId] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize session ID on client
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Cart fetch koro server theke
  const refreshCart = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await api.fetchCart(sessionId);
      setItems(data.items);
      setTotal(data.total);
      setCount(data.count);
    } catch {
      // Silent fail
    }
  }, [sessionId]);

  // Fetch cart when sessionId is ready
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Cart e item add
  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const data = await api.addToCart(sessionId, productId, quantity);
      setItems(data.items);
      setTotal(data.total);
      setCount(data.count);
      setIsOpen(true); // Cart drawer open koro
    } finally {
      setLoading(false);
    }
  };

  // Quantity update
  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const data = await api.updateCartItem(sessionId, productId, quantity);
      setItems(data.items);
      setTotal(data.total);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  };

  // Item remove
  const removeItem = async (productId) => {
    setLoading(true);
    try {
      const data = await api.removeFromCart(sessionId, productId);
      setItems(data.items);
      setTotal(data.total);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  };

  // Pura cart clear
  const emptyCart = async () => {
    setLoading(true);
    try {
      const data = await api.clearCart(sessionId);
      setItems(data.items);
      setTotal(data.total);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  };

  // Order er por new session
  const resetSession = () => {
    const newId = "web_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("shopbot_session", newId);
    setItems([]);
    setTotal(0);
    setCount(0);
    window.location.reload();
  };

  return (
    <CartContext.Provider
      value={{
        sessionId,
        items,
        total,
        count,
        isOpen,
        loading,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        emptyCart,
        resetSession,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
