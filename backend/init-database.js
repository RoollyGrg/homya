const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ikea_ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const sampleProducts = [
  {
    name: 'KALLAX Shelf unit, white',
    description: 'Versatile and sturdy shelving unit, perfect for organizing books and decor.',
    price: 34.99,
    category: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'MALM Bed frame, white',
    description: 'Clean-lined bed frame with headboard, perfect for a modern bedroom.',
    price: 199.99,
    category: 'Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=300&fit=crop'
  },
  {
    name: 'PAX Wardrobe, white',
    description: 'Customizable wardrobe system with sliding doors and interior fittings.',
    price: 299.99,
    category: 'Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'EKET Storage combination',
    description: 'Modular storage solution with cabinets and drawers for any room.',
    price: 89.99,
    category: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'LACK Coffee table, black-brown',
    description: 'Simple and sturdy coffee table with a clean, modern design.',
    price: 24.99,
    category: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'MICKE Desk, white',
    description: 'Compact desk with cable management, perfect for home office.',
    price: 79.99,
    category: 'Office',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'KIVIK Sofa, gray',
    description: 'Comfortable 3-seat sofa with removable covers for easy cleaning.',
    price: 499.99,
    category: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'BESTÅ TV unit, white',
    description: 'Modern TV storage solution with adjustable shelves and cable management.',
    price: 149.99,
    category: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'HEMNES Bed frame, white',
    description: 'Traditional bed frame with headboard and footboard in solid wood.',
    price: 299.99,
    category: 'Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'KITCHEN Cart, white',
    description: 'Versatile kitchen cart with wheels and storage for any kitchen.',
    price: 129.99,
    category: 'Kitchen & Dining',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'ALEX Drawer unit, white',
    description: '9-drawer unit perfect for organizing office supplies or craft materials.',
    price: 89.99,
    category: 'Office',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'BRIMNES Storage bed, white',
    description: 'Bed frame with storage drawers and headboard with storage.',
    price: 249.99,
    category: 'Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'LACK Wall shelf, white',
    description: 'Simple wall shelf perfect for displaying books, plants, or decor.',
    price: 14.99,
    category: 'Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'KALLHÄLL Kitchen cart, white',
    description: 'Kitchen cart with wheels, perfect for extra workspace and storage.',
    price: 79.99,
    category: 'Kitchen & Dining',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  },
  {
    name: 'MALM Dressing table, white',
    description: 'Dressing table with mirror and drawer, perfect for bedroom organization.',
    price: 129.99,
    category: 'Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
  }
];

async function initializeDatabase() {
  try {
    // Check if products already exist
    const existingProducts = await Product.find();
    if (existingProducts.length > 0) {
      console.log(`Database already has ${existingProducts.length} products. Skipping initialization.`);
      process.exit(0);
    }

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Successfully added ${products.length} sample products:`);
    
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - $${product.price}`);
    });

    console.log('\nDatabase initialized successfully!');
    console.log('Categories available:', [...new Set(products.map(p => p.category))]);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 