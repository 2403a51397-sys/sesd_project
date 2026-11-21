import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  ArrowRight,
  Wallet,
  Building,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function CheckoutModal() {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    totals, 
    clearCart, 
    setActiveOrder,
    appliedCoupon
  } = useShop();

  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [deliveryType, setDeliveryType] = useState('DELIVERY'); // 'DELIVERY' | 'GYM_PICKUP'
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'WALLET' | 'COD'
  
  const [form, setForm] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 555-0199',
    address: user?.address || '742 Evergreen Terrace, Suite 4B',
    city: 'San Francisco',
    postalCode: '94107',
    cardNumber: '•••• •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvv: '888',
    cardName: user?.fullName || user?.name || 'Alex Member',
    upiId: 'alex.fitness@okaxis',
  });

  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');

  if (!isCheckoutOpen) return null;

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const autofillDemoCard = () => {
    setForm((prev) => ({
      ...prev,
      cardNumber: '4242 4242 4242 4242',
      cardExpiry: '08/29',
      cardCvv: '921',
      cardName: user?.fullName || 'FitSphere Member',
    }));
  };

  const validateStep1 = () => {
    if (!form.name.trim()) {
      setError('Please provide your recipient full name.');
      return false;
    }
    if (deliveryType === 'DELIVERY' && !form.address.trim()) {
      setError('Please provide your delivery street address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);
    setProcessingStatus('Connecting to secure payment gateway...');

    try {
      // Realistic simulation steps
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStatus('Authorizing payment transaction...');
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStatus('Confirming inventory & allocating items...');

      const payload = {
        items: cart.map((i) => ({
          id: i.id,
          productId: i.id,
          quantity: i.quantity,
        })),
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingAddress: deliveryType === 'GYM_PICKUP' ? 'FitSphere Front Desk Pickup' : form.address,
        city: form.city,
        postalCode: form.postalCode,
        deliveryType,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const res = await api.checkout(payload);

      if (res?.data) {
        clearCart();
        setActiveOrder(res.data);
        setIsCheckoutOpen(false);
      }
    } catch (err) {
      setError(err?.message || 'Checkout failed. Please review your details.');
    } finally {
      setLoading(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-md">
                Step {step} of 3
              </span>
              <span className="text-xs font-bold text-slate-500">
                {step === 1 ? 'Delivery Information' : step === 2 ? 'Payment Method' : 'Order Confirmation'}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 font-display mt-1">
              {step === 1 ? 'Where should we send your order?' : step === 2 ? 'Select Payment Mode' : 'Review & Authorize Order'}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-slate-100 w-full">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Delivery Address */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Delivery Type Option */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Delivery Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('DELIVERY')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryType === 'DELIVERY'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Express Home Delivery</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Delivered within 2-3 business days
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('GYM_PICKUP')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryType === 'GYM_PICKUP'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                      <Building className="w-4 h-4 text-emerald-600" />
                      <span>FitSphere Front Desk Pickup</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      Ready immediately &bull; 100% Free
                    </p>
                  </button>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {deliveryType === 'DELIVERY' && (
                <>
                  <div>
                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                        City
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                        placeholder="City"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={form.postalCode}
                        onChange={(e) => updateForm('postalCode', e.target.value)}
                        placeholder="Postal / ZIP"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {deliveryType === 'GYM_PICKUP' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-black uppercase tracking-wider font-mono block">
                      FitSphere Center Pickup Station
                    </span>
                    <p className="mt-0.5 text-slate-600">
                      Show your QR code or Order ID at the reception desk to collect your gear anytime during gym operational hours (06:00 - 22:00).
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'WALLET'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">Gym Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">Pay at Desk</span>
                  </button>
                </div>
              </div>

              {/* CARD FORM */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider font-mono">
                      Credit or Debit Card
                    </span>
                    <button
                      type="button"
                      onClick={autofillDemoCard}
                      className="text-[10px] font-bold text-emerald-700 hover:underline font-mono cursor-pointer"
                    >
                      Fill Demo Card
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={form.cardNumber}
                      onChange={(e) => updateForm('cardNumber', e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={form.cardExpiry}
                        onChange={(e) => updateForm('cardExpiry', e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={form.cardCvv}
                        onChange={(e) => updateForm('cardCvv', e.target.value)}
                        placeholder="888"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI FORM */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider font-mono block">
                    Instant UPI / QR Code Payment
                  </span>
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-emerald-800" />
                  </div>
                  <p className="text-xs text-slate-600 font-mono">
                    Scan with Google Pay, PhonePe, or BHIM &bull; <strong className="text-emerald-700">fitsphere@upi</strong>
                  </p>
                </div>
              )}

              {/* WALLET */}
              {paymentMethod === 'WALLET' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>FitSphere Member Wallet</span>
                    <span className="font-mono">$250.00 Balance</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Amount will be debited directly from your active membership credits.
                  </p>
                </div>
              )}

              {/* COD */}
              {paymentMethod === 'COD' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold block mb-1">Pay on Delivery or at Reception</span>
                  <p className="text-[11px] text-slate-500">
                    You can pay cash, card, or digital tap upon receiving your items at the gym counter.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Order Review & Summary */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[240px]">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Destination & Payment recap pills */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 font-mono block mb-0.5">
                    Deliver To
                  </span>
                  <span className="font-bold text-slate-800 block truncate">{form.name}</span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {deliveryType === 'GYM_PICKUP' ? 'FitSphere Front Desk' : form.address}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 font-mono block mb-0.5">
                    Payment Via
                  </span>
                  <span className="font-bold text-slate-800 block">{paymentMethod}</span>
                  <span className="text-[11px] text-emerald-700 font-bold block">
                    Verified &bull; 256-Bit SSL
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">${totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Total Discount Saved</span>
                    <span className="font-mono">-${totals.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-mono font-bold">
                    {totals.shippingFee === 0 ? 'FREE' : `$${totals.shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (8%)</span>
                  <span className="font-mono font-bold">${totals.tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-baseline font-black text-slate-900">
                  <span className="text-sm">Grand Total Amount</span>
                  <span className="text-xl text-[#0e6245] font-mono">
                    ${totals.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Processing Animation Screen */}
          {loading && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <Loader2 className="w-8 h-8 text-[#0e6245] animate-spin mx-auto" />
              <p className="text-xs font-black text-emerald-900 font-mono uppercase tracking-wider">
                {processingStatus}
              </p>
              <p className="text-[11px] text-slate-500">Please do not close this window.</p>
            </div>
          )}

          {/* Navigation Controls */}
          {!loading && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer ml-auto"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="px-6 py-3.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer ml-auto"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Place Order &bull; ${totals.grandTotal.toFixed(2)}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
