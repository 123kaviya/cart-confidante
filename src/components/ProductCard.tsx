import { useState } from "react";
import type { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [added, setAdded] = useState(false);

  const rating = Number(((((product.id * 7 + 3) % 5) * 0.2) + 4.0).toFixed(1));
  const original = (product.price * 1.22).toFixed(2);
  const discount = Math.round(((product.price * 1.22 - product.price) / (product.price * 1.22)) * 100);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-cyan-100 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative h-44 bg-gradient-to-br from-cyan-50 via-blue-50 to-fuchsia-50 overflow-hidden">
        {product.image_url && !imgFailed ? (
          <img src={product.image_url} alt={product.title} referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgFailed(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl select-none">🛍️</div>
        )}
        <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
          -{discount}%
        </span>
        <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-100">
          {product.category}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider">{product.brand}</p>
        <h3 className="mt-1 text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">{product.title}</h3>
        <Stars rating={rating} />
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
          <span className="text-xs text-slate-400 line-through">${original}</span>
        </div>
        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">✓ Free Shipping  ✓ In Stock</p>
        <button
          onClick={handleAdd}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            added
              ? "bg-emerald-500 text-white scale-95"
              : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white active:scale-95"
          }`}
        >
          {added ? "✓ Added to Cart!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
