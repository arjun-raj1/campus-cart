const { supabase } = require('../config/db');

exports.placeOrder = async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    
    const { data: product, error: pError } = await supabase.from('products').select('*').eq('id', req.params.productId).single();
    if (pError || !product) return res.status(404).json({ success: false, message: "Product not found." });
    if (product.status === "sold") return res.status(400).json({ success: false, message: "This item has already been sold." });

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

    await supabase.from('products').update({ status: 'sold' }).eq('id', product.id);

    res.json({ success: true, message: "Order placed!", orderId: order.id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getOrders = async (req, res) => {
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
};

exports.getOrder = async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    const { data, error } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Order not found" });
    
    res.json({ ...data, _id: data.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.cancelOrder = async (req, res) => {
  try {
    if (!supabase) throw new Error("Database not connected");
    
    const { data: order, error: oError } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    if (oError || !order) return res.status(404).json({ message: "Order not found" });

    const { error: uError } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    if (uError) throw uError;

    await supabase.from('products').update({ status: 'available' }).eq('id', order.productId);

    res.json({ success: true, message: "Order cancelled." });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
