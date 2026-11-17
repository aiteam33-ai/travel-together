"use client";

import { useEffect } from "react";
import { useCart } from "../CartContext";
import OrderTracker from "../OrderTracker";

export default function OrdersPage() {
  const { orders, advanceOrders } = useCart();

  useEffect(() => {
    const interval = setInterval(() => advanceOrders(), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Orders</h1>
        <p className="text-lg">You have not placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order.number}
            className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="font-[family-name:var(--font-heading)] text-lg font-bold">
              Order {order.number}
            </div>

            <ul className="flex flex-col gap-2">
              {order.items.map((item) => (
                <li key={item.name} className="flex justify-between text-base">
                  <span>
                    {item.name} x {item.qty}
                  </span>
                  <span>Rs {item.price * item.qty}</span>
                </li>
              ))}
            </ul>

            <div className="text-lg font-bold">Total: Rs {order.total}</div>

            <OrderTracker status={order.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
