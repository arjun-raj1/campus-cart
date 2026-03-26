require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files (for local use)
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Cloudinary Config ──────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campuscart_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif']
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ── MongoDB Connection ──────────────────────────────────────────────
// Check if MONGODB_URI exists before connecting
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.warn('⚠️ No MONGODB_URI found. Database not connected.');
}

// ── Mongoose Schemas & Models ──────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  price: { type: Number, default: 0 },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
  seller: { type: String, default: "Anonymous" },
  phone: { type: String, default: "" },
  image: { type: String, default: "" }, // Cloudinary URL
  status: { type: String, default: "available" }, // 'available' or 'sold'
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  productImage: String,
  category: String,
  price: Number,
  seller: String,
  sellerPhone: String,
  buyerName: { type: String, default: "Anonymous" },
  buyerPhone: { type: String, default: "" },
  buyerEmail: { type: String, default: "" },
  note: { type: String, default: "" },
  status: { type: String, default: "confirmed" }, // 'confirmed', 'completed', 'cancelled'
  orderedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ══════════════════════════════════════════════════════════════
//  PRODUCT ROUTES
// ══════════════════════════════════════════════════════════════

// List products (optional ?category= filter)
app.get("/products", async (req, res) => {
  try {
    let query = {};
    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Single product
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Add product
app.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name || "",
      price: Number(req.body.price) || 0,
      category: req.body.category || "",
      description: req.body.description || "",
      seller: req.body.seller || "Anonymous",
      phone: req.body.phone || "",
      image: req.file ? req.file.path : "", // req.file.path is Cloudinary URL via storage
      status: "available"
    });
    const savedProduct = await product.save();
    res.json({ success: true, message: "Product listed!", id: savedProduct._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ══════════════════════════════════════════════════════════════
//  BUYING / ORDER ROUTES
// ══════════════════════════════════════════════════════════════

// Place an order (buy a product)
app.post("/buy/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });
    if (product.status === "sold")
      return res.status(400).json({ success: false, message: "This item has already been sold." });

    // Create Order
    const order = new Order({
      productId: product._id,
      productName: product.name,
      productImage: product.image,
      category: product.category,
      price: product.price,
      seller: product.seller,
      sellerPhone: product.phone,
      buyerName: req.body.buyerName || "Anonymous",
      buyerPhone: req.body.buyerPhone || "",
      buyerEmail: req.body.buyerEmail || "",
      note: req.body.note || "",
      status: "confirmed"
    });
    
    await order.save();

    // Mark product as sold
    product.status = "sold";
    await product.save();

    res.json({ success: true, message: "Order placed!", orderId: order._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// List all orders (optionally filter by buyer phone ?phone=)
app.get("/orders", async (req, res) => {
  try {
    let query = {};
    if (req.query.phone) {
      query.buyerPhone = req.query.phone;
    }
    const orders = await Order.find(query).sort({ orderedAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Single order
app.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Cancel order (buyer cancels)
app.patch("/orders/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "cancelled";
    await order.save();

    // Re-mark product as available
    const product = await Product.findById(order.productId);
    if (product) {
      product.status = "available";
      await product.save();
    }

    res.json({ success: true, message: "Order cancelled." });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Start ────────────────────────────────────────────────────
// Export the Express app as a serverless function
module.exports = app;

// Only start locally if not in Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ SwapNest (Vercel Ready) running → http://localhost:${PORT}`);
    console.log(`📦 Database: MongoDB   |  🖼️ Uploads: Cloudinary`);
  });
}
