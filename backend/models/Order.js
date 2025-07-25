const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  consumerEmail: { type: String, required: true },
  consumerName: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    }
  ],
  address: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Online Payment'], required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Placed' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema); 