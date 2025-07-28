const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const Admin = require('./models/Admin');

const MONGO_URI = 'mongodb://localhost:27017/ikea_ecommerce';

async function importData() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Import Products
    const productsPath = path.join(__dirname, 'default-products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Imported ${products.length} products.`);

    // Import Admins
    const adminsPath = path.join(__dirname, 'default-admins.json');
    const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf-8'));
    await Admin.deleteMany({});
    await Admin.insertMany(admins);
    console.log(`Imported ${admins.length} admins.`);

    console.log('Database import complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
}

importData(); 