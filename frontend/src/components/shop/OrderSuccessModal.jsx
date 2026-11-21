import React from 'react';
import { CheckCircle2, PackageCheck, Truck, MapPin, Receipt, ArrowRight, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function OrderSuccessModal({ onViewOrders, onContinueShopping }) {
  const { activeOrder, setActiveOrder } = useShop();

  if (!activeOrder) return null;

  const handleClose = () => {
    setActiveOrder(null);
    if (onContinueShopping) onContinueShopping();
  };

  const handleGoOrders = () => {
    setActiveOrder(null);
    if (onViewOrders) onViewOrders();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-[#0c5338] to-[#073825] p-8 text-center text-white relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-300 bg-emerald-400/15 px-3 py-1 rounded-full border border-emerald-400/20">
            Payment Verified &bull; Order Confirmed
          </span>

          <h3 className="text-2xl font-black text-white mt-2 font-display">
            Thank you for your order!
          </h3>

          <p className="text-xs text-emerald-100/80 mt-1 font-mono">
            Order Reference: <strong className="text-white">{activeOrder.id}</strong>
          </p>
        </div>

        {/* Order Stepper Tracker */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Order Placed</span>
            </div>
            <span className="text-slate-300">&bull;&bull;&bull;</span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Packing &amp; QC</span>
            </div>
            <span className="text-slate-300">&bull;&bull;&bull;</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Truck className="w-3.5 h-3.5" />
              <span>
                {activeOrder.delivery_type === 'GYM_PICKUP' ? 'Ready at Desk' : 'Dispatched'}
              </span>
            </div>
          </div>
        </div>

        {/* Body & Receipt Items */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Purchased Line Items */}
          <div>
            <h5 className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2.5">
              Purchased Equipment &amp; Nutrition
            </h5>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
              {activeOrder.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[240px]">
                        {item.product_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Qty: {item.quantity} &times; ${item.unit_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ${item.total_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Destination & Payment details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-slate-400 block mb-0.5">
                Delivery Location
              </span>
              <p className="font-bold text-slate-800 leading-snug">
                {activeOrder.shipping_address}
              </p>
              <span className="text-[10px] text-emerald-700 font-mono block mt-0.5">
                {activeOrder.delivery_type === 'GYM_PICKUP' ? 'Gym Reception Pickup' : 'Express Courier'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-black uppercase text-slate-400 block mb-0.5">
                Total Paid
              </span>
              <span className="text-lg font-black text-[#0e6245] font-mono block">
                ${activeOrder.total_amount.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                Via {activeOrder.payment_method}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleGoOrders}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>View in My Orders</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-3 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
