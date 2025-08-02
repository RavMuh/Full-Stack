const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get user cart
router.get('/', authenticateToken, cartController.getUserCart);

// Add to cart
router.post('/add', authenticateToken, cartController.addToCart);

// Remove from cart
router.delete('/remove/:productId', authenticateToken, cartController.removeFromCart);

// Update cart item quantity
router.put('/update/:productId', authenticateToken, cartController.updateCartItemQuantity);

// Clear cart
router.delete('/clear', authenticateToken, cartController.clearCart);

// Delete cart
router.delete('/', authenticateToken, cartController.deleteCart);

module.exports = router; 