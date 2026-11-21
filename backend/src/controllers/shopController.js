const shopRepository = require('../repositories/shopRepository');

class ShopController {
  async getProducts(req, res, next) {
    try {
      const { category, search, sort } = req.query;
      const products = shopRepository.getAllProducts({ category, search, sort });
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = shopRepository.getProductById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (err) {
      next(err);
    }
  }

  async checkout(req, res, next) {
    try {
      const {
        items,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode,
        deliveryType,
        paymentMethod,
        couponCode
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty. Please add items to checkout.'
        });
      }

      if (!customerName || !shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Customer name and delivery address are required.'
        });
      }

      // Compute subtotal from DB prices or validated line items
      let subtotal = 0;
      const preparedItems = [];

      for (const item of items) {
        const prod = shopRepository.getProductById(item.id || item.productId);
        if (!prod) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.id || item.productId} was not found.`
          });
        }
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const lineTotal = Math.round(prod.price * qty * 100) / 100;
        subtotal += lineTotal;

        preparedItems.push({
          productId: prod.id,
          productName: prod.name,
          productImage: prod.image,
          unitPrice: prod.price,
          quantity: qty,
          totalPrice: lineTotal
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;

      // Calculate Discounts
      let discount = 0;

      // 1. Automatic 10% FitSphere VIP Member Discount if logged in
      const isMember = Boolean(req.user);
      if (isMember) {
        discount += Math.round(subtotal * 0.10 * 100) / 100; // 10% off
      }

      // 2. Coupon codes
      let freeShippingPromo = false;
      if (couponCode) {
        const code = couponCode.toUpperCase().trim();
        if (code === 'FIT20') {
          // Extra 20% off subtotal
          const couponDisc = Math.round(subtotal * 0.20 * 100) / 100;
          discount += couponDisc;
        } else if (code === 'WELCOME10') {
          discount += 10.00;
        } else if (code === 'FREESHIP') {
          freeShippingPromo = true;
        }
      }

      discount = Math.min(discount, subtotal); // Never exceed subtotal
      const discountedSubtotal = subtotal - discount;

      // Shipping: Free if deliveryType is GYM_PICKUP, or free over $50, or promo
      let shippingFee = 5.99;
      if (deliveryType === 'GYM_PICKUP' || discountedSubtotal >= 50 || freeShippingPromo) {
        shippingFee = 0.00;
      }

      // Tax (8% estimated standard sales tax)
      const tax = Math.round(discountedSubtotal * 0.08 * 100) / 100;

      // Total
      const totalAmount = Math.round((discountedSubtotal + shippingFee + tax) * 100) / 100;

      // Generate Order ID
      const orderId = `FS-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderData = {
        id: orderId,
        userId: req.user ? req.user.id : null,
        customerName,
        customerEmail: customerEmail || (req.user ? req.user.email : 'guest@fitsphere.com'),
        customerPhone: customerPhone || '',
        shippingAddress: deliveryType === 'GYM_PICKUP' ? 'FitSphere Front Desk Pickup' : shippingAddress,
        city: city || 'Local',
        postalCode: postalCode || '',
        deliveryType: deliveryType || 'DELIVERY',
        paymentMethod: paymentMethod || 'CARD',
        subtotal,
        discount,
        tax,
        shippingFee,
        totalAmount,
        status: 'CONFIRMED'
      };

      const createdOrder = shopRepository.createOrder({
        orderData,
        items: preparedItems
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        data: createdOrder
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      if (!userId) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }
      const orders = shopRepository.getOrdersByUserId(userId);
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = shopRepository.getOrderById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ShopController();
