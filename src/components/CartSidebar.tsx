import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import type { CartItem } from "@/hooks/use-cart";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  items: CartItem[];
  onRemove: (id: number) => void;
  total: number;
}

export function CartSidebar({ isOpen, onClose, onCheckout, items, onRemove, total }: CartSidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed right-0 top-0 h-full w-[340px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-2 text-white">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold text-lg">My Cart</span>
            {items.length > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-400 px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-600">Your cart is empty</p>
            <p className="text-sm mt-1 text-center">Ask the AI assistant to find products and add them here!</p>
            <button onClick={onClose} className="mt-5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">🛍️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">{item.title}</p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                      ${item.price.toFixed(2)} <span className="text-slate-400 font-normal text-xs">× {item.quantity}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="p-1.5 text-slate-300 group-hover:text-red-400 hover:bg-red-50 rounded-lg transition self-start">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-slate-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500 text-sm">Subtotal</span>
                <span className="font-bold text-slate-900 text-lg">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mb-3">✓ Free shipping on this order</p>
              <button onClick={onCheckout} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm">
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="mt-2 w-full bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl font-semibold hover:bg-slate-100 transition text-sm">
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
