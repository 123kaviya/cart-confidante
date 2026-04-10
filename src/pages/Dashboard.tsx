import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PackageCheck, ShoppingBag } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { getOrderHistory, type OrderRecord } from "@/lib/orders";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    if (!getAuthUser()) { navigate("/login?next=/dashboard", { replace: true }); return; }
    setOrders(getOrderHistory());
  }, [navigate]);

  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

  return (
    <main className="min-h-screen px-4 py-8 bg-gradient-to-b from-cyan-50 via-white to-indigo-50">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Orders Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">View your full product order history.</p>
          </div>
          <Link to="/" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Back to Store</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-white border border-cyan-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Orders</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</p>
          </div>
          <div className="rounded-2xl bg-white border border-cyan-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Total Spent</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-cyan-100 p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Status</p>
              <p className="text-sm font-bold text-emerald-600">Synced from checkout</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white border border-cyan-100 p-10 text-center text-slate-500 shadow-sm">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">No orders yet.</p>
            <p className="text-sm mt-1">Complete a checkout to see product history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <section key={order.orderId} className="rounded-2xl bg-white border border-cyan-100 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.orderId}</p>
                    <p className="text-xs text-slate-500">{new Date(order.orderedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Payment: <span className="font-semibold text-slate-700">{order.paymentMethod.toUpperCase()}</span></p>
                    <p className="text-sm font-bold text-slate-900">Total: ${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.items.map((item) => (
                    <div key={`${order.orderId}-${item.id}`} className="flex gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-2xl">🛍️</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-2">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-blue-700 mt-0.5">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <p><span className="font-semibold">Phone:</span> {order.phone}</p>
                  <p className="mt-1"><span className="font-semibold">Address:</span> {order.address}</p>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
