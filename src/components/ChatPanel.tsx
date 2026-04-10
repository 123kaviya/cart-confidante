import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, User, ShoppingBag } from "lucide-react";
import { streamChat, type Product } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
}

interface ChatPanelProps {
  onAddToCart: (product: Product) => void;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
}

const SUGGESTIONS = [
  "🎧 Best headset under $100",
  "🖱️ Gaming mouse recommendation",
  "⌚ Top smartwatch 2026",
  "💻 Work from home setup",
  "🔊 Portable bluetooth speaker",
  "⌨️ Mechanical keyboard deals",
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[10px] text-slate-400 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

function InlineProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const rating = Number(((((product.id * 7 + 3) % 5) * 0.2) + 4.0).toFixed(1));
  const original = (product.price * 1.22).toFixed(2);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex-shrink-0 w-44 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative h-28 bg-slate-50">
        {product.image_url && !imgFailed ? (
          <img src={product.image_url} alt={product.title} referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
        )}
        <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">SALE</span>
      </div>
      <div className="p-2.5">
        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide truncate">{product.brand}</p>
        <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mt-0.5">{product.title}</p>
        <Stars rating={rating} />
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-sm font-extrabold text-slate-900">${product.price}</span>
          <span className="text-[10px] text-slate-400 line-through">${original}</span>
        </div>
        <button
          onClick={handleAdd}
          className={`mt-2 w-full py-1.5 rounded-lg text-[11px] font-bold transition-all ${added ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
        >
          {added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export function ChatPanel({ onAddToCart, isAuthenticated, onRequireLogin }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm your AI Shopping Assistant powered by GPT-4. Tell me what you're looking for — headphones, gaming gear, smart home — and I'll find the best options with prices and comparisons! 🛍️",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: text.trim() },
      { role: "assistant", text: "", products: [] },
    ]);

    streamChat(
      sessionId,
      text.trim(),
      (products) => {
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          const last = prev[lastIndex];
          if (!last || last.role !== "assistant") return prev;
          return [...prev.slice(0, lastIndex), { ...last, products }];
        });
      },
      (token) => {
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          const last = prev[lastIndex];
          if (!last || last.role !== "assistant") return prev;
          return [...prev.slice(0, lastIndex), { ...last, text: last.text + token }];
        });
      },
      () => setLoading(false),
      () => {
        setLoading(false);
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          const last = prev[lastIndex];
          if (last?.role === "assistant" && !last.text) {
            return [...prev.slice(0, lastIndex), { ...last, text: "Backend is offline. Please start the backend server and try again." }];
          }
          return prev;
        });
      }
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-cyan-50/70 via-white to-fuchsia-50/40">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-gradient-to-br from-blue-500 to-fuchsia-600"}`}>
              {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                <div className="w-full">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3" /> Recommended Products
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {msg.products.map((p) => (
                      <InlineProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
                    ))}
                  </div>
                </div>
              )}

              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm" : "bg-white/95 text-slate-800 border border-cyan-100 rounded-tl-sm"}`}>
                {msg.text
                  ? msg.text
                  : loading && msg.role === "assistant"
                    ? (
                      <span className="flex items-center gap-1.5 py-0.5">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                      </span>
                    )
                    : null}
              </div>
            </div>
          </div>
        ))}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pl-11">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-pink-50 border border-pink-200 text-pink-500 rounded-full px-3 py-1.5 hover:bg-pink-100 hover:border-pink-300 transition font-semibold shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-cyan-100 bg-white/90">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-3 text-sm text-black caret-black outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-600 disabled:opacity-60"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAuthenticated ? "Ask about any product — headset, gaming mouse, smartwatch..." : "Login required to ask AI questions"}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-3 disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
