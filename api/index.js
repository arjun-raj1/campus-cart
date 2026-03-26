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
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// ── Mongoose Schemas & Models ──────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  price: { type: Number, default: 0 },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
  seller: { type: String, default: "Anonymous" },
  phone: { type: String, default: "" },
  image: { type: String, default: "" },
  status: { type: String, default: "available" },
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
  status: { type: String, default: "confirmed" },
  orderedAt: { type: Date, default: Date.now }
});

// Avoid model recompilation if it exists
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ══════════════════════════════════════════════════════════════
//  API ROUTES (Standardized)
// ══════════════════════════════════════════════════════════════

const router = express.Router();

router.get("/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV || 'production' }));

router.get("/products", async (req, res) => {
  try {
    let query = {};
    if (req.query.category && req.query.category !== "All") query.category = req.query.category;
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/products/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    const p = new Product({
      name: req.body.name || "",
      price: Number(req.body.price) || 0,
      category: req.body.category || "",
      description: req.body.description || "",
      seller: req.body.seller || "Anonymous",
      phone: req.body.phone || "",
      image: req.file ? req.file.path : "",
      status: "available"
    });
    await p.save();
    res.json({ success: true, message: "Listed!", id: p._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/buy/:productId", async (req, res) => {
  try {
    const p = await Product.findById(req.params.productId);
    if (!p) return res.status(404).json({ success: false, message: "Not found" });
    const order = new Order({
      productId: p._id, productName: p.name, productImage: p.image,
      category: p.category, price: p.price, seller: p.seller, sellerPhone: p.phone,
      buyerName: req.body.buyerName, buyerPhone: req.body.buyerPhone,
      buyerEmail: req.body.buyerEmail, note: req.body.note, status: "confirmed"
    });
    await order.save();
    p.status = "sold"; await p.save();
    res.json({ success: true, message: "Order placed!", orderId: order._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get("/orders", async (req, res) => {
  try {
    let q = {}; if (req.query.phone) q.buyerPhone = req.query.phone;
    const o = await Order.find(q).sort({ orderedAt: -1 });
    res.json(o);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.patch("/orders/:id/cancel", async (req, res) => {
  try {
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: "Not found" });
    o.status = "cancelled"; await o.save();
    const p = await Product.findById(o.productId);
    if (p) { p.status = "available"; await p.save(); }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Use router for both / and /api to ensure Vercel rewrites work correctly
app.use("/api", router);
app.use("/", router);

app.use((req, res) => {
  console.log("⚠️ 404 Route Not Found:", req.url);
  res.status(404).json({ message: "Not Found", path: req.url });
});

// Export the Express app
module.exports = app;

