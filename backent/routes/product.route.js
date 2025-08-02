const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari ruxsat etiladi'), false);
    }
  }
});

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.post('/:id/rate', authenticateToken, productController.rateProduct);

// User routes (authentication required)
router.post('/', authenticateToken, productController.createProduct); // Remove requireAdmin
router.put('/:id', authenticateToken, productController.updateProduct); // Remove requireAdmin
router.delete('/:id', authenticateToken, productController.deleteProduct); // Remove requireAdmin

module.exports = router; 