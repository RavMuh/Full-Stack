const mongoose = require('mongoose');
const Product = require('./models/product.model');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'iPhone 14 Pro',
    description: 'Apple iPhone 14 Pro - eng yangi smartfon, A16 Bionic chip, 48MP kamera, Dynamic Island',
    price: 999,
    originalPrice: 1099,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'
    ],
    category: 'electronics',
    brand: 'Apple',
    stock: 15,
    rating: 4.8,
    numReviews: 125,
    tags: ['smartphone', 'apple', 'iphone', 'mobile'],
    specifications: {
      'Screen': '6.1 inch OLED',
      'Storage': '128GB',
      'Color': 'Space Black'
    }
  },
  {
    name: 'Samsung Galaxy S23',
    description: 'Samsung Galaxy S23 - kuchli kamera, uzun batareya hayoti, engil va chiroyli dizayn',
    price: 799,
    originalPrice: 899,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'
    ],
    category: 'electronics',
    brand: 'Samsung',
    stock: 20,
    rating: 4.6,
    numReviews: 89,
    tags: ['smartphone', 'samsung', 'android', 'mobile'],
    specifications: {
      'Screen': '6.1 inch AMOLED',
      'Storage': '256GB',
      'Color': 'Phantom Black'
    }
  },
  {
    name: 'Nike Air Max 270',
    description: 'Nike Air Max 270 - qulay va chiroyli sport krossovkalari, havo bilan to'ldirilgan taglik',
    price: 129,
    originalPrice: 150,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    ],
    category: 'sports',
    brand: 'Nike',
    stock: 30,
    rating: 4.5,
    numReviews: 67,
    tags: ['shoes', 'nike', 'sports', 'running'],
    specifications: {
      'Size': 'US 9',
      'Color': 'White/Black',
      'Material': 'Mesh'
    }
  },
  {
    name: 'MacBook Air M2',
    description: 'Apple MacBook Air M2 - engil va kuchli noutbuk, 18 soat batareya hayoti, chiroyli dizayn',
    price: 1199,
    originalPrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
    ],
    category: 'electronics',
    brand: 'Apple',
    stock: 8,
    rating: 4.9,
    numReviews: 45,
    tags: ['laptop', 'apple', 'macbook', 'computer'],
    specifications: {
      'Screen': '13.6 inch Retina',
      'Storage': '256GB SSD',
      'RAM': '8GB'
    }
  },
  {
    name: 'Sony WH-1000XM4',
    description: 'Sony WH-1000XM4 - eng yaxshi shovqinni to'xtatuvchi quloqchinlar, 30 soat batareya',
    price: 349,
    originalPrice: 399,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    ],
    category: 'electronics',
    brand: 'Sony',
    stock: 25,
    rating: 4.7,
    numReviews: 156,
    tags: ['headphones', 'sony', 'wireless', 'noise-cancelling'],
    specifications: {
      'Type': 'Over-ear',
      'Connectivity': 'Bluetooth 5.0',
      'Battery': '30 hours'
    }
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Adidas Ultraboost 22 - professional yugurish krossovkalari, Boost texnologiyasi',
    price: 179,
    originalPrice: 200,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400'
    ],
    category: 'sports',
    brand: 'Adidas',
    stock: 18,
    rating: 4.4,
    numReviews: 92,
    tags: ['shoes', 'adidas', 'running', 'sports'],
    specifications: {
      'Size': 'US 10',
      'Color': 'Core Black',
      'Technology': 'Boost'
    }
  },
  {
    name: 'Canon EOS R6',
    description: 'Canon EOS R6 - professional mirrorless kamera, 20.1MP, 4K video, tez autofokus',
    price: 2499,
    originalPrice: 2799,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'
    ],
    category: 'electronics',
    brand: 'Canon',
    stock: 5,
    rating: 4.8,
    numReviews: 34,
    tags: ['camera', 'canon', 'mirrorless', 'photography'],
    specifications: {
      'Sensor': '20.1MP Full-frame',
      'Video': '4K 60fps',
      'Autofocus': 'Dual Pixel AF'
    }
  },
  {
    name: 'IKEA MALM Bed Frame',
    description: 'IKEA MALM - zamonaviy va chiroyli yotoq ramkasi, oq rang, 160x200 sm',
    price: 199,
    originalPrice: 249,
    images: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400'
    ],
    category: 'home',
    brand: 'IKEA',
    stock: 12,
    rating: 4.3,
    numReviews: 78,
    tags: ['furniture', 'bed', 'ikea', 'home'],
    specifications: {
      'Size': '160x200 cm',
      'Color': 'White',
      'Material': 'Particleboard'
    }
  }
];

const seedProducts = async () => {
  try {
    // MongoDB ga ulanish
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-store');
    console.log('✅ MongoDB ga ulanish muvaffaqiyatli');

    // Mavjud mahsulotlarni tozalash
    await Product.deleteMany({});
    console.log('🗑️  Mavjud mahsulotlar o\'chirildi');

    // Yangi mahsulotlarni qo'shish
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${createdProducts.length} ta mahsulot qo'shildi`);

    // Mahsulotlarni ko'rsatish
    console.log('\n📦 Qo'shilgan mahsulotlar:');
    createdProducts.forEach(product => {
      console.log(`- ${product.name} - $${product.price}`);
    });

    console.log('\n🎉 Mahsulotlar muvaffaqiyatli qo'shildi!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
};

// Script ni ishga tushirish
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts }; 