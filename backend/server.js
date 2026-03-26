const express = require("express");
const multer  = require("multer");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend")));

// ── JSON Stores ──────────────────────────────────────────────
const PRODUCTS_FILE = path.join(__dirname, "db.json");
const ORDERS_FILE   = path.join(__dirname, "orders.json");

function readProducts() {
  try { return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8")); }
  catch { return []; }
}
function writeProducts(data) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
}

function readOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
  } catch { return []; }
}
function writeOrders(data) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Multer ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /jpeg|jpg|png|webp|gif/i.test(path.extname(file.originalname)))
});

// ══════════════════════════════════════════════════════════════
//  PRODUCT ROUTES
// ══════════════════════════════════════════════════════════════

// List products (optional ?category= filter)
app.get("/products", (req, res) => {
  try {
    let data = readProducts();
    if (req.query.category && req.query.category !== "All")
      data = data.filter(p => p.category === req.query.category);
    res.json(data);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Single product
app.get("/products/:id", (req, res) => {
  try {
    const p = readProducts().find(p => p._id === req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Add product
app.post("/add-product", upload.single("image"), (req, res) => {
  try {
    const products = readProducts();
    const product  = {
      _id:         newId(),
      name:        req.body.name        || "",
      price:       Number(req.body.price) || 0,
      category:    req.body.category    || "",
      description: req.body.description || "",
      seller:      req.body.seller      || "Anonymous",
      phone:       req.body.phone       || "",
      image:       req.file ? req.file.filename : "",
      status:      "available",          // available | sold
      createdAt:   new Date().toISOString()
    };
    products.unshift(product);
    writeProducts(products);
    res.json({ success: true, message: "Product listed!", id: product._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Delete product
app.delete("/products/:id", (req, res) => {
  try {
    writeProducts(readProducts().filter(p => p._id !== req.params.id));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ══════════════════════════════════════════════════════════════
//  BUYING / ORDER ROUTES
// ══════════════════════════════════════════════════════════════

// Place an order (buy a product)
app.post("/buy/:productId", (req, res) => {
  try {
    const products = readProducts();
    const idx      = products.findIndex(p => p._id === req.params.productId);

    if (idx === -1)
      return res.status(404).json({ success: false, message: "Product not found." });
    if (products[idx].status === "sold")
      return res.status(400).json({ success: false, message: "This item has already been sold." });

    // Record order
    const orders = readOrders();
    const order  = {
      _id:         newId(),
      productId:   products[idx]._id,
      productName: products[idx].name,
      productImage:products[idx].image,
      category:    products[idx].category,
      price:       products[idx].price,
      seller:      products[idx].seller,
      sellerPhone: products[idx].phone,
      // buyer details from request body
      buyerName:   req.body.buyerName   || "Anonymous",
      buyerPhone:  req.body.buyerPhone  || "",
      buyerEmail:  req.body.buyerEmail  || "",
      note:        req.body.note        || "",
      status:      "confirmed",          // confirmed | completed | cancelled
      orderedAt:   new Date().toISOString()
    };
    orders.unshift(order);
    writeOrders(orders);

    // Mark product as sold
    products[idx].status = "sold";
    writeProducts(products);

    res.json({ success: true, message: "Order placed!", orderId: order._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// List all orders (optionally filter by buyer phone ?phone=)
app.get("/orders", (req, res) => {
  try {
    let orders = readOrders();
    if (req.query.phone)
      orders = orders.filter(o => o.buyerPhone === req.query.phone);
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Single order
app.get("/orders/:id", (req, res) => {
  try {
    const o = readOrders().find(o => o._id === req.params.id);
    if (!o) return res.status(404).json({ message: "Order not found" });
    res.json(o);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Cancel order (buyer cancels)
app.patch("/orders/:id/cancel", (req, res) => {
  try {
    const orders = readOrders();
    const idx    = orders.findIndex(o => o._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Order not found" });

    orders[idx].status = "cancelled";
    writeOrders(orders);

    // Re-mark product as available
    const products = readProducts();
    const pIdx     = products.findIndex(p => p._id === orders[idx].productId);
    if (pIdx !== -1) { products[pIdx].status = "available"; writeProducts(products); }

    res.json({ success: true, message: "Order cancelled." });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Start ────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log("✅ SwapNest running → http://localhost:3000");
  console.log("📦 Products: db.json   |  🛒 Orders: orders.json");
});
