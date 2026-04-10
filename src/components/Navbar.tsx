import { useState } from "react";
import { ShoppingCart, Sparkles, Search, X, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onProfileClick: () => void;
  onSearch: (query: string) => void;
  onNavClick: (filter: "All" | "Deals") => void;
}

export function Navbar({ cartCount, onCartClick, onProfileClick, onSearch, onNavClick }: NavbarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
    document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  const handleNavClick = (filter: "All" | "Deals") => {
    onNavClick(filter);
    document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-30 bg-gradient-to-r from-cyan-600 via-blue-600 to-fuchsia-600 shadow-lg shadow-blue-200/60">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-white flex-shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shadow-md border border-white/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Shop<span className="text-amber-200">AI</span>
        </Link>

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-200 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white/15 border border-white/25 rounded-xl text-sm text-white placeholder:text-cyan-100/80 focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Search products, brands, categories…"
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-100 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-cyan-50 ml-2">
          <Link to="/dashboard" className="hover:text-amber-100 transition font-semibold">Dashboard</Link>
          <button onClick={() => handleNavClick("All")} className="hover:text-amber-100 transition font-semibold">Products</button>
          <button onClick={() => handleNavClick("Deals")} className="hover:text-amber-100 transition font-semibold flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full" />
            Deals
          </button>
          <button onClick={() => handleNavClick("Deals")} className="hover:text-amber-100 transition font-semibold flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            Hot Offers
          </button>
        </div>

        <button onClick={onProfileClick} className="p-2 hover:bg-white/20 rounded-xl transition text-white" aria-label="Open profile settings">
          <UserRound className="w-6 h-6" />
        </button>

        <button onClick={onCartClick} className="relative p-2 hover:bg-white/20 rounded-xl transition text-white" aria-label="Open cart">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-amber-400 text-slate-900 text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
