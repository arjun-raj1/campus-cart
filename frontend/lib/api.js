const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchProducts(category = 'All') {
  const url = new URL(`${API_URL}/products`);
  if (category && category !== 'All') {
    url.searchParams.append('category', category);
  }
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function addProduct(formData) {
  const res = await fetch(`${API_URL}/add-product`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to add product');
  return data;
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function placeOrder(productId, orderData) {
  const res = await fetch(`${API_URL}/buy/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to place order');
  return data;
}

export async function fetchOrders(phone) {
  const res = await fetch(`${API_URL}/orders?phone=${encodeURIComponent(phone)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function cancelOrder(id) {
  const res = await fetch(`${API_URL}/orders/${id}/cancel`, { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to cancel order');
  return data;
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
