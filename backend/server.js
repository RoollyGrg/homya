const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration - more explicit
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ikea_ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Product routes placeholder
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.use('/api/admin', require('./routes/admin'));
app.use('/api/consumer', require('./routes/consumer'));
app.use('/api/products', require('./routes/products'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 