const { supabase } = require('../config/db');

exports.getProducts = async (req, res) => {
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
};

exports.getProduct = async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Not found" });
    
    res.json({ ...data, _id: data.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addProduct = async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    let imageUrl = "";
    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        imageUrl = req.file.path; // Cloudinary
      } else if (req.file.filename) {
        imageUrl = `${API_URL}/uploads/${req.file.filename}`; // Local Disk
      }
    }

    const { data, error } = await supabase.from('products').insert([{
      name: req.body.name || "",
      price: Number(req.body.price) || 0,
      category: req.body.category || "",
      description: req.body.description || "",
      seller: req.body.seller || "Anonymous",
      phone: req.body.phone || "",
      image: imageUrl,
      status: "available"
    }]).select().single();
    
    if (error) throw error;
    res.json({ success: true, message: "Product listed!", id: data.id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
