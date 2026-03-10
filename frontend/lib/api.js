// ============================================================
// API Fetch Wrappers
// ============================================================
// Ki kore: Frontend theke backend API call korar helper functions
// Keno: Shob API call ek jaygay, error handling consistent
// Note: Dev mode e Next.js rewrites /api -> backend server
// ============================================================

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// Products
export const fetchProducts = () => request("/api/products");
export const fetchProduct = (id) => request(`/api/products/${id}`);

// Cart
export const fetchCart = (sessionId) => request(`/api/cart/${sessionId}`);

export const addToCart = (sessionId, productId, quantity = 1) =>
  request(`/api/cart/${sessionId}`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });

export const updateCartItem = (sessionId, productId, quantity) =>
  request(`/api/cart/${sessionId}/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const removeFromCart = (sessionId, productId) =>
  request(`/api/cart/${sessionId}/${productId}`, { method: "DELETE" });

export const clearCart = (sessionId) =>
  request(`/api/cart/${sessionId}`, { method: "DELETE" });

// Orders
export const placeOrder = (data) =>
  request("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const fetchOrder = (orderId) => request(`/api/orders/${orderId}`);

export const fetchOrdersByPhone = (phone) =>
  request(`/api/orders/by-phone/${phone}`);
