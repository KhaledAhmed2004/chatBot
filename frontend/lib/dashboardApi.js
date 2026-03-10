// Dashboard API fetch wrappers

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("shopbot_token");
}

function authRequest(url, options = {}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return request(url, {
    ...options,
    headers: { ...options.headers, ...authHeaders(token) },
  });
}

// Auth
export const login = (email, password) =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const register = (name, email, password) =>
  request("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const getMe = (token) =>
  request("/api/auth/me", { headers: authHeaders(token) });

// Store
export const createStore = (data) =>
  authRequest("/api/dashboard/store", { method: "POST", body: JSON.stringify(data) });

export const getStore = () => authRequest("/api/dashboard/store");

export const updateStore = (data) =>
  authRequest("/api/dashboard/store", { method: "PUT", body: JSON.stringify(data) });

// Stats
export const getStats = () => authRequest("/api/dashboard/stats");
export const getAnalytics = () => authRequest("/api/dashboard/analytics");

// Orders
export const getOrders = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return authRequest(`/api/dashboard/orders?${query}`);
};

export const getOrder = (id) => authRequest(`/api/dashboard/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  authRequest(`/api/dashboard/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

export const createDashboardOrder = (data) =>
  authRequest("/api/dashboard/orders", { method: "POST", body: JSON.stringify(data) });

// Products
export const getProducts = () => authRequest("/api/dashboard/products");

export const createProduct = (data) =>
  authRequest("/api/dashboard/products", { method: "POST", body: JSON.stringify(data) });

export const updateProduct = (id, data) =>
  authRequest(`/api/dashboard/products/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteProduct = (id) =>
  authRequest(`/api/dashboard/products/${id}`, { method: "DELETE" });

// Customers
export const getCustomers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return authRequest(`/api/dashboard/customers?${query}`);
};

// Account
export const changePassword = (currentPassword, newPassword) =>
  authRequest("/api/dashboard/account/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

// Public store
export const getPublicStore = (slug) => request(`/api/store/${slug}`);
export const getPublicStoreProducts = (slug) => request(`/api/store/${slug}/products`);
