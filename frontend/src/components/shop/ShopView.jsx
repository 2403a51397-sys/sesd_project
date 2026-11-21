import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Receipt, 
  ShoppingCart, 
  Tag, 
  Flame, 
  Dumbbell, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import OrderSuccessModal from './OrderSuccessModal';
import MyOrdersView from './MyOrdersView';

export default function ShopView() {
  const { products, loadingProducts, totals, setIsCartOpen } = useShop();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.badge?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.reviews_count || 0) - (a.reviews_count || 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = [
    { id: 'all', label: 'All Items', icon: ShoppingBag },
    { id: 'supplements', label: 'Supplements & Protein', icon: Sparkles },
    { id: 'gear', label: 'Gear & Lifting Equipment', icon: Dumbbell },
    { id: 'apparel', label: 'Athletic Wear & Tech', icon: Flame },
    { id: 'nutrition', label: 'Healthy Snacks', icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs: Catalog vs My Orders */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-emerald-100 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#0e6245] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pro Store Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0e6245] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>My Orders &amp; Receipts</span>
          </button>
        </div>

        {/* Floating Cart Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="px-4 py-2 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-200 text-slate-800 hover:text-emerald-900 text-xs font-black transition-all flex items-center gap-2.5 shadow-xs cursor-pointer group"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
            {totals.itemCount > 0 && (
              <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                {totals.itemCount}
              </span>
            )}
          </div>
          <span>View Bag &bull; ${totals.grandTotal.toFixed(2)}</span>
        </button>
      </div>

      {activeTab === 'orders' ? (
        <MyOrdersView onSwitchToShop={() => setActiveTab('catalog')} />
      ) : (
        <>
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0c5338] via-[#09462f] to-[#063322] text-white p-6 sm:p-8 shadow-md">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest text-emerald-300 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                OFFICIAL FITSPHERE PRO STORE
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                Fuel your ambition with lab-tested nutrition and athlete-grade gear.
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
                Certified 100% genuine supplements, biomechanically tested lifting belts, resistance bands, and breathable gym wear delivered right to your locker or doorstep.
              </p>

              {/* Promo chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <Tag className="w-3.5 h-3.5 text-emerald-300" />
                  VIP Member Perk: 10% OFF at Checkout
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-400/20 border border-emerald-400/30 text-xs font-bold text-emerald-200 flex items-center gap-1.5 font-mono">
                  ⚡ Code FIT20 for Extra 20% Off
                </span>
              </div>
            </div>

            {/* Guarantees bar */}
            <div className="mt-6 pt-4 border-t border-emerald-400/20 grid grid-cols-3 gap-3 text-center text-[10px] text-emerald-100 font-bold">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Third-Party Lab Tested</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Free Shipping &gt; $50</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Gym Counter Pickup</span>
              </div>
            </div>
          </div>

          {/* Search, Filter, and Sort Controls */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search protein isolate, lifting belt, straps, shakers..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="popular">Popular &amp; Reviews</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#0e6245] text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Catalog Grid */}
          {loadingProducts ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No matching products found</h4>
              <p className="text-xs text-slate-400">
                Try clearing your search query or choosing a different category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-black text-emerald-700 hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal />

      {/* Order Confirmation Receipt Modal */}
      <OrderSuccessModal
        onViewOrders={() => setActiveTab('orders')}
        onContinueShopping={() => setActiveTab('catalog')}
      />
    </div>
  );
}
