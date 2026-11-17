"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { findDish } from "../lib/menu";

const CartContext = createContext(null);

const CART_KEY = "menuAppCart";
const ORDERS_KEY = "menuAppOrders";

export const TRACKING_STEPS = ["Placed", "Preparing", "On the way", "Delivered"];

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      if (rawCart) setCart(JSON.parse(rawCart));
    } catch {
      // ignore damaged data
    }
    try {
      const rawOrders = localStorage.getItem(ORDERS_KEY);
      if (rawOrders) {
        const parsed = JSON.parse(rawOrders);
        if (Array.isArray(parsed)) setOrders(parsed);
      }
    } catch {
      // ignore damaged data
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore storage errors
    }
  }, [orders, loaded]);

  function addToCart(name) {
    setCart((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  }

  function changeQty(name, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const newQty = (next[name] || 0) + delta;
      if (newQty <= 0) {
        delete next[name];
      } else {
        next[name] = newQty;
      }
      return next;
    });
  }

  function cartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function cartTotal() {
    return Object.entries(cart).reduce((sum, [name, qty]) => {
      const dish = findDish(name);
      return sum + (dish ? dish.price * qty : 0);
    }, 0);
  }

  function nextOrderNumber() {
    if (orders.length === 0) return 1001;
    return Math.max(...orders.map((o) => o.number)) + 1;
  }

  function placeOrder() {
    const items = Object.entries(cart).map(([name, qty]) => {
      const dish = findDish(name);
      return { name, price: dish ? dish.price : 0, qty };
    });
    const order = {
      number: nextOrderNumber(),
      items,
      total: cartTotal(),
      status: "Placed",
    };
    setOrders((prev) => [order, ...prev]);
    setCart({});
    return order;
  }

  function advanceOrders() {
    setOrders((prev) =>
      prev.map((order) => {
        const idx = TRACKING_STEPS.indexOf(order.status);
        if (idx === -1 || idx >= TRACKING_STEPS.length - 1) return order;
        return { ...order, status: TRACKING_STEPS[idx + 1] };
      })
    );
  }

  return (
    <CartContext.Provider
      value={{ cart, orders, addToCart, changeQty, cartCount, cartTotal, placeOrder, advanceOrders }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
