import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Landmark, Wallet, Smartphone, Truck } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { appendOrder } from "@/lib/orders";

interface CheckoutItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

type PaymentMethod = "card" | "upi" | "netbanking" | "wallet" | "cod";

interface CheckoutPayload {
  items: CheckoutItem[];
  total: number;
  createdAt: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("HDFC Bank");
  const [wallet, setWallet] = useState("Paytm");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (!getAuthUser()) { navigate("/login?next=/checkout", { replace: true }); return; }
    const raw = localStorage.getItem("ai-shop-checkout");
    if (!raw) return;
    try { setPayload(JSON.parse(raw) as CheckoutPayload); } catch { setPayload(null); }
  }, [navigate]);

  const grandTotal = useMemo(() => {
    if (!payload) return 0;
    return Number((payload.total).toFixed(2));
  }, [payload]);

  const placeOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!payload || payload.items.length === 0) { setError("Your cart is empty."); return; }
    if (!address.trim()) { setError("Delivery address is required."); return; }
    if (!/^\+?[0-9]{10,15}$/.test(phone.trim())) { setError("Enter a valid phone number (10 to 15 digits)."); return; }

    if (method === "card") {
      if (!nameOnCard.trim()) { setError("Name on card is required."); return; }
      if (!/^[0-9]{16}$/.test(cardNumber.replace(/\s/g, ""))) { setError("Enter a valid 16-digit card number."); return; }
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) { setError("Expiry must be in MM/YY format."); return; }
      if (!/^[0-9]{3,4}$/.test(cvv)) { setError("Enter a valid CVV."); return; }
    }
    if (method === "upi" && !/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(upiId.trim())) { setError("Enter a valid UPI ID."); return; }

    appendOrder({
      orderId: `ORD-${Date.now()}`,
      items: payload.items,
      total: grandTotal,
      paymentMethod: method,
      address: address.trim(),
      phone: phone.trim(),
      orderedAt: new Date().toISOString(),
    });

    localStorage.removeItem("ai-shop-cart");
    localStorage.removeItem("ai-shop-checkout");
    setOrdered(true);
    setTimeout(() => navigate("/"), 1800);
  };

  return (
    <main className="min-h-screen px-4 py-8 bg-gradient-to-b from-cyan-50 via-white to-indigo-50">
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-cyan-100 shadow-sm p-5">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Payment Gateway</h1>
          <p className="text-sm text-slate-500 mb-5">Choose a payment method and place your order securely.</p>

          {ordered ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-semibold">Order placed successfully. Redirecting to home...</div>
          ) : (
            <form onSubmit={placeOrder} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Payment Options</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {([["card", CreditCard, "Card"], ["upi", Smartphone, "UPI"], ["netbanking", Landmark, "Net Banking"], ["wallet", Wallet, "Wallet"], ["cod", Truck, "Cash on Delivery"]] as const).map(([key, Icon, label]) => (
                    <button key={key} type="button" onClick={() => setMethod(key as PaymentMethod)} className={`rounded-xl border p-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 ${method === key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}>
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {method === "card" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" placeholder="Name on card" />
                  <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" placeholder="Card number (16 digits)" />
                  <input value={expiry} onChange={(e) => setExpiry(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" placeholder="MM/YY" />
                  <input value={cvv} onChange={(e) => setCvv(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" placeholder="CVV" />
                </div>
              )}

              {method === "upi" && <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" placeholder="yourname@bank" />}

              {method === "netbanking" && (
                <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white">
                  <option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option><option>Axis Bank</option><option>Kotak</option>
                </select>
              )}

              {method === "wallet" && (
                <select value={wallet} onChange={(e) => setWallet(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white">
                  <option>Paytm</option><option>PhonePe Wallet</option><option>Amazon Pay</option><option>MobiKwik</option>
                </select>
              )}

              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" rows={3} placeholder="Delivery address" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400" placeholder="Phone number" />

              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 font-bold hover:from-cyan-700 hover:to-blue-700">Pay ${grandTotal.toFixed(2)} and Place Order</button>
            </form>
          )}
        </section>

        <aside className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-5 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Order Summary</h2>
          {!payload || payload.items.length === 0 ? (
            <p className="text-sm text-slate-500">No items selected. Go back and add products to cart.</p>
          ) : (
            <div className="space-y-3">
              {payload.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2 text-sm border-b border-slate-100 pb-2">
                  <p className="text-slate-700 line-clamp-2">{item.title} x {item.quantity}</p>
                  <p className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-1">
                <span className="text-slate-500">Shipping</span>
                <span className="text-emerald-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
