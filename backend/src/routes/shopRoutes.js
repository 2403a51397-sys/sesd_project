const express = require('express');
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');

const router = express.Router();

router.get('/products', (req, res, next) => shopController.getProducts(req, res, next));
router.get('/products/:id', (req, res, next) => shopController.getProductById(req, res, next));
router.post('/checkout', optionalAuthMiddleware, (req, res, next) => shopController.checkout(req, res, next));
router.get('/my-orders', authMiddleware, (req, res, next) => shopController.getMyOrders(req, res, next));
router.get('/orders/:id', optionalAuthMiddleware, (req, res, next) => shopController.getOrderById(req, res, next));

module.exports = router;
