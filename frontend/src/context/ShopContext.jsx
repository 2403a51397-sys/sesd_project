import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('fitsphere_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null); // Last completed order for receipt modal
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fitsphere_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  // Fetch products catalog
  const loadProducts = async (params = {}) => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts(params);
      if (res?.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(newQty, product.stock || 99),
        };
        return next;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            image: product.image,
            category: product.category,
            stock: product.stock,
            quantity: Math.min(quantity, product.stock || 99),
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: Math.min(newQuantity, item.stock || 99),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Coupon handling
  const applyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    if (!code) {
      setAppliedCoupon(null);
      return;
    }

    if (code === 'FIT20') {
      setAppliedCoupon({
        code: 'FIT20',
        label: 'FitSphere Pro 20% OFF',
        type: 'PERCENT',
        value: 0.20,
      });
    } else if (code === 'WELCOME10') {
      setAppliedCoupon({
        code: 'WELCOME10',
        label: '$10 New Member Welcome Gift',
        type: 'FLAT',
        value: 10.00,
      });
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({
        code: 'FREESHIP',
        label: '100% Free Express Shipping',
        type: 'SHIPPING',
        value: 0,
      });
    } else {
      setCouponError('Invalid coupon code. Try FIT20, WELCOME10, or FREESHIP.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Dynamic Totals calculation
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotalRounded = Math.round(subtotal * 100) / 100;

    // Member discount: 10% if logged in
    const isMember = Boolean(user);
    const memberDiscount = isMember ? Math.round(subtotalRounded * 0.10 * 100) / 100 : 0;

    // Coupon discount
    let couponDiscount = 0;
    let freeShippingCoupon = false;

    if (appliedCoupon) {
      if (appliedCoupon.type === 'PERCENT') {
        couponDiscount = Math.round(subtotalRounded * appliedCoupon.value * 100) / 100;
      } else if (appliedCoupon.type === 'FLAT') {
        couponDiscount = Math.min(appliedCoupon.value, subtotalRounded);
      } else if (appliedCoupon.type === 'SHIPPING') {
        freeShippingCoupon = true;
      }
    }

    const totalDiscount = Math.min(memberDiscount + couponDiscount, subtotalRounded);
    const discountedSubtotal = Math.max(0, subtotalRounded - totalDiscount);

    // Free shipping if discountedSubtotal >= $50 or coupon applied
    const isFreeShipping = discountedSubtotal >= 50 || freeShippingCoupon || subtotalRounded === 0;
    const shippingFee = isFreeShipping ? 0.00 : 5.99;

    // 8% tax
    const tax = Math.round(discountedSubtotal * 0.08 * 100) / 100;

    // Grand total
    const grandTotal = Math.round((discountedSubtotal + shippingFee + tax) * 100) / 100;

    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: subtotalRounded,
      memberDiscount,
      couponDiscount,
      totalDiscount,
      discountedSubtotal,
      shippingFee,
      isFreeShipping,
      freeShippingThreshold: 50,
      amountNeededForFreeShipping: Math.max(0, 50 - discountedSubtotal),
      tax,
      grandTotal,
      itemCount: totalItemsCount,
    };
  }, [cart, user, appliedCoupon]);

  return (
    <ShopContext.Provider
      value={{
        products,
        loadingProducts,
        loadProducts,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totals,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeOrder,
        setActiveOrder,
        couponCode,
        setCouponCode,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        couponError,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
