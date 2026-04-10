import { useEffect, useRef, useState } from "react";
import { Tag } from "lucide-react";
import { fetchProducts, type Product } from "@/lib/api";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { ProductCard } from "@/components/ProductCard";

const CATEGORIES = ["All", "Deals", "Audio", "Accessories", "Peripherals", "Wearables"];
const DEAL_MAX_PRICE = 80;

interface FeaturedProductsProps {
  onAddToCart: (product: Product) => void;
  searchQuery?: string;
  navFilter?: string;
}

export function FeaturedProducts({ onAddToCart, searchQuery = "", navFilter }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");
  const prevNavFilter = useRef<string | undefined>(undefined);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data.length > 0 ? data : MOCK_PRODUCTS))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (navFilter && navFilter !== prevNavFilter.current) {
      prevNavFilter.current = navFilter;
      setActive(navFilter);
    }
  }, [navFilter]);

  const filtered = products.filter((p) => {
    const categoryMatch =
      active === "All" ? true : active === "Deals" ? p.price <= DEAL_MAX_PRICE : p.category === active;

    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);

    return categoryMatch && searchMatch;
  });

  const sectionLabel =
    active === "Deals"
      ? `🔥 Hot Deals — Under $${DEAL_MAX_PRICE}`
      : active === "All"
      ? "Trending Products"
      : `${active} Products`;

  return (
    <section id="featured" className="py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            {active === "Deals" && <Tag className="w-5 h-5 text-red-500" />}
            {sectionLabel}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {searchQuery
              ? `Showing results for "${searchQuery}"`
              : active === "Deals"
              ? "Best value picks under $80 — limited time offers"
              : "AI-curated picks updated daily"}
          </p>
        </div>
        <span className="text-xs bg-gradient-to-r from-cyan-100 to-fuchsia-100 text-blue-800 font-semibold px-3 py-1.5 rounded-full border border-white shadow-sm">
          {filtered.length} products
        </span>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              active === cat
                ? cat === "Deals"
                  ? "bg-red-500 text-white shadow-md shadow-red-200"
                  : "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white/80 backdrop-blur-sm border border-cyan-100 text-slate-700 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            {cat === "Deals" && <Tag className="w-3 h-3" />}
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white/80 rounded-2xl h-72 animate-pulse border border-cyan-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-slate-600">
            {searchQuery ? `No results for "${searchQuery}"` : "No products in this category yet."}
          </p>
          {searchQuery && <p className="text-sm mt-1">Try searching with a different keyword.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}
