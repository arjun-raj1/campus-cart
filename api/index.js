require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
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

// ── Supabase Config ──────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Client Initialized');
} else {
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_KEY. Database not connected.');
}

// ══════════════════════════════════════════════════════════════
//  API ROUTES (Standardized)
// ══════════════════════════════════════════════════════════════

const router = express.Router();

router.get("/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV || 'production' }));

// List products (optional ?category= filter)
router.get("/products", async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    let query = supabase.from('products').select('*').order('createdAt', { ascending: false });
    
    if (req.query.category && req.query.category !== "All") {
      query = query.eq('category', req.query.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const products = data.map(p => ({ ...p, _id: p.id }));
    res.json(products);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Single product
router.get("/products/:id", async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Not found" });
    
    res.json({ ...data, _id: data.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Add product
router.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    const { data, error } = await supabase.from('products').insert([{
      name: req.body.name || "",
      price: Number(req.body.price) || 0,
      category: req.body.category || "",
      description: req.body.description || "",
      seller: req.body.seller || "Anonymous",
      phone: req.body.phone || "",
      image: req.file ? req.file.path : "",
      status: "available"
    }]).select().single();
    
    if (error) throw error;
    res.json({ success: true, message: "Listed!", id: data.id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Delete product
router.delete("/products/:id", async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ══════════════════════════════════════════════════════════════
//  BUYING / ORDER ROUTES
// ══════════════════════════════════════════════════════════════

// Place an order (buy a product)
router.post("/buy/:productId", async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    
    // Get product
    const { data: product, error: pError } = await supabase.from('products').select('*').eq('id', req.params.productId).single();
    if (pError || !product) return res.status(404).json({ success: false, message: "Not found" });
    
    // Create Order
    const { data: order, error: oError } = await supabase.from('orders').insert([{
      productId: product.id,
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
    }]).select().single();
    
    if (oError) throw oError;

    // Mark product as sold
    await supabase.from('products').update({ status: 'sold' }).eq('id', product.id);

    res.json({ success: true, message: "Order placed!", orderId: order.id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// List all orders (optionally filter by buyer phone ?phone=)
router.get("/orders", async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    let query = supabase.from('orders').select('*').order('orderedAt', { ascending: false });
    if (req.query.phone) {
      query = query.eq('buyerPhone', req.query.phone);
    }
    const { data, error } = await query;
    if (error) throw error;
    
    const orders = data.map(o => ({ ...o, _id: o.id }));
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Cancel order (buyer cancels)
router.patch("/orders/:id/cancel", async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    
    // Get order
    const { data: order, error: oError } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    if (oError || !order) return res.status(404).json({ message: "Not found" });

    // Update order status
    const { error: uError } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    if (uError) throw uError;

    // Re-mark product as available
    await supabase.from('products').update({ status: 'available' }).eq('id', order.productId);

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
