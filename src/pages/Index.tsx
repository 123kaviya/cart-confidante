import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageSquare, Zap, Shield, TrendingUp } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { ChatPanel } from "@/components/ChatPanel";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { CartSidebar } from "@/components/CartSidebar";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { applyTheme, getUserProfile } from "@/lib/profile";

const STATS = [
  { icon: Zap, label: "AI Responses", value: "< 1s" },
  { icon: TrendingUp, label: "Products", value: "10+" },
  { icon: Shield, label: "Powered by", value: "GPT-4" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { items, addItem, removeItem, count, total } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navFilter, setNavFilter] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAuthUser()));
    applyTheme(getUserProfile().theme);
    const onStorageChange = () => setIsAuthenticated(Boolean(getAuthUser()));
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) { navigate("/login?next=/"); return; }
    addItem(product);
    setCartOpen(true);
  };

  const handleNavClick = (filter: "All" | "Deals") => {
    setSearchQuery("");
    setNavFilter(filter);
  };

  const handleRequireLogin = () => navigate("/login?next=/");

  const handleProfileClick = () => {
    if (!isAuthenticated) { navigate("/login?next=/"); return; }
    setProfileOpen(true);
  };

  const handleCheckout = () => {
    if (!items.length) return;
    if (!isAuthenticated) { navigate("/login?next=/checkout"); return; }
    localStorage.setItem("ai-shop-checkout", JSON.stringify({ items, total, createdAt: Date.now() }));
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-cyan-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -right-28 w-96 h-96 rounded-full bg-fuchsia-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 w-72 h-72 rounded-full bg-emerald-200/35 blur-3xl" />

      <Navbar
        cartCount={count}
        onCartClick={() => setCartOpen(!cartOpen)}
        onProfileClick={handleProfileClick}
        onSearch={(q) => { setSearchQuery(q); setNavFilter(undefined); }}
        onNavClick={handleNavClick}
      />

      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} onLoggedOut={() => { setIsAuthenticated(false); setProfileOpen(false); }} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} items={items} onRemove={removeItem} total={total} />

      <main className="mx-auto max-w-7xl px-4 py-8 relative z-10">
        <section className="mb-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-fuchsia-100 text-blue-800 text-xs font-bold px-4 py-2 rounded-full mb-5 border border-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by GPT-4 · Real-time AI Recommendations
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
              Shop Smarter with <span className="gradient-text">AI Guidance</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg mb-8">
              Ask anything about products — get instant recommendations, price comparisons, and honest trade-offs in real time.
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-sm bg-white/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-bold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-surface rounded-3xl shadow-xl shadow-cyan-100 border border-white/70 overflow-hidden" style={{ height: "580px" }}>
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-fuchsia-600">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">ShopAI Assistant</p>
                <p className="text-cyan-100 text-xs">Ask me about any product</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">Online</span>
              </div>
            </div>

            <div style={{ height: "calc(580px - 60px)" }}>
              <ChatPanel onAddToCart={handleAddToCart} isAuthenticated={isAuthenticated} onRequireLogin={handleRequireLogin} />
            </div>
          </div>
        </section>

        <FeaturedProducts onAddToCart={handleAddToCart} searchQuery={searchQuery} navFilter={navFilter} />
      </main>

      <footer className="border-t border-cyan-200/60 bg-gradient-to-r from-slate-900 to-blue-950 text-slate-300 text-xs text-center py-5 mt-8">
        <p>© 2026 ShopAI · GenAI Capstone Project · Powered by GPT-4 + FastAPI</p>
      </footer>
    </div>
  );
}
