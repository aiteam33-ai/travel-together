"use client";

import { useCart } from "../CartContext";

export default function OrdersPage() {
  const { orders } = useCart();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-lg">You have not placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.number} className="flex flex-col gap-2 border border-gray-300 p-3">
            <div className="text-lg font-bold">Order {order.number}</div>

            <ul className="flex flex-col gap-1">
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
            <div className="text-base">Status: {order.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
