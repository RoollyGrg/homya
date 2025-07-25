const express = require('express');
const router = express.Router();
const Consumer = require('../models/Consumer');

// Signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const exists = await Consumer.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const consumer = new Consumer({ fullName, email, password });
    await consumer.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const consumer = await Consumer.findOne({ email });
    if (!consumer || consumer.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, fullName: consumer.fullName, email: consumer.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forget password
router.post('/forget-password', async (req, res) => {
  const { email, previousPassword, newPassword } = req.body;
  try {
    const consumer = await Consumer.findOne({ email });
    if (!consumer || consumer.password !== previousPassword) {
      return res.status(401).json({ error: 'Invalid email or previous password' });
    }
    consumer.password = newPassword;
    await consumer.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cart
router.post('/cart', async (req, res) => {
  const { email } = req.body;
  try {
    const consumer = await Consumer.findOne({ email }).populate('cart.productId');
    if (!consumer) return res.status(404).json({ error: 'User not found' });
    res.json({ cart: consumer.cart });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to cart
router.post('/cart/add', async (req, res) => {
  const { email, productId } = req.body;
  try {
    const consumer = await Consumer.findOne({ email });
    if (!consumer) return res.status(404).json({ error: 'User not found' });
    const item = consumer.cart.find(item => item.productId.toString() === productId);
    if (item) {
      item.quantity += 1;
    } else {
      consumer.cart.push({ productId, quantity: 1 });
    }
    await consumer.save();
    res.json({ success: true, cart: consumer.cart });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart
router.post('/cart/remove', async (req, res) => {
  const { email, productId } = req.body;
  try {
    const consumer = await Consumer.findOne({ email });
    if (!consumer) return res.status(404).json({ error: 'User not found' });
    consumer.cart = consumer.cart.filter(item => item.productId.toString() !== productId);
    await consumer.save();
    res.json({ success: true, cart: consumer.cart });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart for a user
router.post('/cart/clear', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const consumer = await Consumer.findOne({ email });
    if (!consumer) return res.status(404).json({ error: 'User not found' });
    consumer.cart = [];
    await consumer.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router; 