import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Sparkles, 
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function CartDrawer() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totals,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    couponCode,
    setCouponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
  } = useShop();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  const handleApplyPromo = (code) => {
    applyCoupon(code);
    setInputCoupon('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-emerald-100">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#0e6245] text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">
                  Your FitSphere Bag
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-emerald-50/80 border-b border-emerald-100">
            {totals.isFreeShipping ? (
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🎉 You unlocked <strong>FREE Express Shipping</strong>!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free Shipping Goal</span>
                  </span>
                  <span className="text-emerald-700 font-mono">
                    ${totals.amountNeededForFreeShipping.toFixed(2)} away
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((50 - totals.amountNeededForFreeShipping) / 50) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your bag is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Explore our sports nutrition, competition lifting gear, and athletic wear to power your workouts.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#0e6245] text-white text-xs font-bold hover:bg-[#0b5037] transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-slate-900 truncate">
                      {item.name}
                    </h5>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      ${item.price.toFixed(2)} each
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 font-mono block">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/80 space-y-4">
              {/* Promo Coupon Box */}
              <div>
                {appliedCoupon ? (
                  <div className="p-2.5 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-800" />
                      <span className="font-bold text-emerald-900 font-mono">
                        {appliedCoupon.code} applied ({appliedCoupon.label})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        placeholder="Coupon code (e.g. FIT20)"
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold uppercase placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPromo(inputCoupon)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[10px] text-rose-600 font-bold">{couponError}</p>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Popular codes:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo('FIT20')}
                        className="text-emerald-700 font-bold font-mono hover:underline cursor-pointer"
                      >
                        FIT20 (-20%)
                      </button>
                      <span>&bull;</span>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo('FREESHIP')}
                        className="text-emerald-700 font-bold font-mono hover:underline cursor-pointer"
                      >
                        FREESHIP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-800 font-bold">
                    ${totals.subtotal.toFixed(2)}
                  </span>
                </div>

                {totals.memberDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>FitSphere Member VIP Discount (10%)</span>
                    <span className="font-mono">-${totals.memberDiscount.toFixed(2)}</span>
                  </div>
                )}

                {totals.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span className="font-mono">-${totals.couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono text-slate-800 font-bold">
                    ${totals.tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {totals.shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `$${totals.shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-slate-900 font-display">
                      Grand Total
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Includes all taxes &amp; fees
                    </span>
                  </div>
                  <span className="text-xl font-black text-[#0e6245] font-mono">
                    ${totals.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/15 hover:shadow-emerald-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    256-Bit SSL Encrypted
                  </span>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Clear Bag
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
