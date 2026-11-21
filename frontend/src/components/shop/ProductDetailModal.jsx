import React, { useState } from 'react';
import { X, Star, ShoppingCart, Check, ShieldCheck, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart, cart, updateQuantity } = useShop();
  const [selectedQty, setSelectedQty] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const cartItem = cart.find((i) => i.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedQty);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const discountPercent = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 relative bg-slate-100 flex items-center justify-center overflow-hidden min-h-[260px] md:min-h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0e6245] text-white shadow-md font-mono">
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white shadow-md font-mono">
                Save {discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {product.category}
                </span>
                <span className="text-slate-300">&bull;</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviews_count} verified reviews)</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-snug font-display">
                {product.name}
              </h3>
            </div>

            {/* Price section */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ${product.price.toFixed(2)}
                </span>
                {product.original_price && (
                  <span className="ml-2 text-sm text-slate-400 line-through font-mono">
                    ${product.original_price.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg font-mono">
                Member VIP: +10% Off
              </span>
            </div>

            {/* Description */}
            <div>
              <h5 className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-wider mb-1">
                Overview
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specs Highlights */}
            {product.specs && product.specs.length > 0 && (
              <div>
                <h5 className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-wider mb-2">
                  Key Specifications
                </h5>
                <ul className="space-y-1.5">
                  {product.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Features Guarantee */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fast Express</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-Day Return</span>
              </div>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity Picker */}
              <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white text-slate-700 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-black text-xs font-mono text-slate-900">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white text-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/15 hover:shadow-emerald-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart &bull; ${(product.price * selectedQty).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            {inCartQty > 0 && (
              <p className="text-[11px] text-center text-emerald-700 font-bold">
                You already have {inCartQty} in your cart.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
