const Product = require('../models/product.model');

// Barcha mahsulotlarni olish
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Kategoriya filteri
    if (category) {
      query.category = category;
    }

    // Qidiruv
    if (search) {
      query.$text = { $search: search };
    }

    // Narx filteri
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Bitta mahsulotni olish
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Yangi mahsulot qo'shish
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      stock,
      images,
      tags,
      specifications
    } = req.body;

    // Validatsiya
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Mahsulot nomi kiritish majburiy' });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Narx kiritish majburiy va 0 dan katta bo\'lishi kerak' });
    }

    if (!stock || stock < 0) {
      return res.status(400).json({ message: 'Zaxira miqdori 0 dan katta yoki teng bo\'lishi kerak' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Kamida bitta rasm yuklashingiz kerak' });
    }

    // Rasm URL larini qo'shish (base64 yoki file upload)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // File upload bo'lsa
      imageUrls = req.files.map(file => file.path);
    } else if (images && Array.isArray(images)) {
      // Base64 rasm bo'lsa
      imageUrls = images;
    }

    const productData = {
      name: name.trim(),
      description: description || '',
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category: category || 'other',
      brand: brand || '',
      stock: parseInt(stock),
      images: imageUrls,
      tags: tags || [],
      specifications: specifications || {}
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Mahsulot muvaffaqiyatli qo\'shildi',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Mongoose validation xatolari
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validatsiya xatosi',
        errors: messages 
      });
    }
    
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Mahsulotni yangilash
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Yangi rasm URL larini qo'shish
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    res.json({
      message: 'Mahsulot muvaffaqiyatli yangilandi',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Mahsulotni o'chirish
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    res.json({ message: 'Mahsulot muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Kategoriyalarni olish
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Mahsulotni baholash
exports.rateProduct = async (req, res) => {
  try {
    const { rating } = req.body;
    const { id } = req.params;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Baholash 1-5 oralig\'ida bo\'lishi kerak' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    // Yangi o'rtacha baholash
    const newNumReviews = product.numReviews + 1;
    const newRating = ((product.rating * product.numReviews) + rating) / newNumReviews;

    product.rating = newRating;
    product.numReviews = newNumReviews;
    await product.save();

    res.json({
      message: 'Baholash muvaffaqiyatli qo\'shildi',
      product
    });
  } catch (error) {
    console.error('Rate product error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
}; 