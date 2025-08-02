const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Foydalanuvchining savatini olish
exports.getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId, isActive: true })
      .populate('items.product', 'name price images stock');

    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
    }

    res.json({ cart });
  } catch (error) {
    console.error('Get user cart error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Savatga mahsulot qo'shish
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Mahsulotni tekshirish
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Mahsulot yetarli emas' });
    }

    // Foydalanuvchining savatini topish yoki yaratish
    let cart = await Cart.findOne({ user: req.userId, isActive: true });

    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    // Mahsulot allaqachon savatda bormi tekshirish
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.json({
      message: 'Mahsulot savatga qo\'shildi',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Savatdan mahsulotni o'chirish
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.userId, isActive: true });
    if (!cart) {
      return res.status(404).json({ message: 'Savat topilmadi' });
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.json({
      message: 'Mahsulot savatdan o\'chirildi',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Savatdagi mahsulot miqdorini yangilash
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Miqdor 1 dan kam bo\'lishi mumkin emas' });
    }

    const cart = await Cart.findOne({ user: req.userId, isActive: true });
    if (!cart) {
      return res.status(404).json({ message: 'Savat topilmadi' });
    }

    const cartItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Mahsulot savatda topilmadi' });
    }

    // Mahsulot zaxirasini tekshirish
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Mahsulot yetarli emas' });
    }

    cartItem.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.json({
      message: 'Miqdor yangilandi',
      cart
    });
  } catch (error) {
    console.error('Update cart item quantity error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Savatni tozalash
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId, isActive: true });
    if (!cart) {
      return res.status(404).json({ message: 'Savat topilmadi' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Savat tozalandi',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Savatni o'chirish
exports.deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId, isActive: true });
    if (!cart) {
      return res.status(404).json({ message: 'Savat topilmadi' });
    }

    cart.isActive = false;
    await cart.save();

    res.json({ message: 'Savat o\'chirildi' });
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
}; 