import React from 'react';
import { Star, Plus, Minus, ShoppingCart, Eye, Check } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function ProductCard({ product, onQuickView }) {
  const { cart, addToCart, updateQuantity } = useShop();

  const cartItem = cart.find((i) => i.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-3xl border border-emerald-100/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0e6245] text-white shadow-sm font-mono">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm font-mono">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View Floating Button */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:bg-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          title="Quick View Details"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Stock pill */}
        <div className="absolute bottom-2.5 right-2.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold backdrop-blur-md shadow-xs ${
              product.stock > 10
                ? 'bg-white/90 text-slate-700'
                : 'bg-rose-50/90 text-rose-700 border border-rose-200'
            }`}
          >
            {product.stock > 10 ? `${product.stock} in stock` : `Only ${product.stock} left!`}
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-black font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviews_count})</span>
            </div>
          </div>

          {/* Title */}
          <h4
            onClick={() => onQuickView(product)}
            className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h4>

          {/* Short description */}
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing and Cart Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900 font-mono">
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block font-mono">
              +10% VIP Off at Checkout
            </span>
          </div>

          {/* Add / Quantity Stepper */}
          {inCartQty > 0 ? (
            <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, inCartQty - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-black text-xs font-mono text-emerald-900">
                {inCartQty}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, inCartQty + 1)}
                disabled={inCartQty >= product.stock}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer disabled:opacity-40"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="py-2 px-3 rounded-xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
