import React, { useState, useEffect } from 'react';
import { 
  PackageCheck, 
  Receipt, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  ExternalLink,
  RotateCw,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useShop } from '../../context/ShopContext';

export default function MyOrdersView({ onSwitchToShop }) {
  const { addToCart, setIsCartOpen, setActiveOrder } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        addToCart(
          {
            id: item.product_id,
            name: item.product_name,
            price: item.unit_price,
            image: item.product_image,
            stock: 50,
          },
          item.quantity
        );
      });
      setIsCartOpen(true);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READY_FOR_PICKUP':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest font-mono mb-2">
            <PackageCheck className="w-3.5 h-3.5" />
            FitSphere Pro Shop History
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            My Orders &amp; Receipts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track deliveries, view itemized receipts, and easily reorder your favorite supplements and gear.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onSwitchToShop}
            className="px-4 py-2.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Pro Store</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <Receipt className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No purchases yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't placed any store orders yet. Explore our protein powders, straps, and gym gear to fuel your next session!
          </p>
          <button
            type="button"
            onClick={onSwitchToShop}
            className="mt-3 px-6 py-3 rounded-2xl bg-[#0e6245] text-white font-black text-xs uppercase tracking-wider hover:bg-[#0b5037] shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore Pro Shop</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              {/* Order Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 font-mono font-bold text-xs shrink-0">
                    FS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {order.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                    Total Amount
                  </span>
                  <span className="text-lg font-black text-[#0e6245] font-mono">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                    Items in this Order ({order.items?.length || 0})
                  </span>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-xs">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">
                            {item.product_name}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Qty: {item.quantity} &times; ${item.unit_price.toFixed(2)}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-800">
                          ${item.total_price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery and payment breakdown */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block mb-1">
                      Shipping Information
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      {order.customer_name} &bull; {order.customer_phone}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.shipping_address}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">
                      Paid via {order.payment_method}
                    </span>
                    <span className="text-emerald-700 font-bold font-mono">
                      {order.delivery_type === 'GYM_PICKUP' ? 'Gym Desk Pickup' : 'Express Courier'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveOrder(order)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Full Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(order)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Re-order Items</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
