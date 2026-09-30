require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderController = require('./controllers/orderController');
const productController = require('./controllers/productController');
const upload = require('./middleware/upload');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');

// Routes
// Maintain backward compatibility with the existing endpoints
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Original specific endpoints
app.post("/add-product", upload.single("image"), productController.addProduct);
app.post("/buy/:productId", orderController.placeOrder);

// Global Error Handler to always return JSON
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

module.exports = app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Campus Cart API running → Port ${PORT}`);
    console.log(`📦 Database: Supabase   |  🖼️ Uploads: Cloudinary`);
  });
}
