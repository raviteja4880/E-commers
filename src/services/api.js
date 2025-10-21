import axios from "axios";

// ----------------- Base URL -----------------
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_BASE
    : "http://localhost:5000/api";

// ----------------- Axios instance -----------------
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------- Attach JWT token automatically -----------------
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // <- fixed
  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ================= Auth API =================
export const authAPI = {
  login: (payload) => API.post("/auth/login", payload),
  register: (payload) => API.post("/auth/register", payload),
  profile: () => API.get("/auth/profile"), // make sure backend has /auth/profile route
};

// ================= Products API =================
export const productAPI = {
  getAll: () => API.get("/products"),
  getById: (id) => API.get(`/products/${id}`),
  create: (payload) => API.post("/products", payload),
  update: (id, payload) => API.put(`/products/${id}`, payload),
  delete: (id) => API.delete(`/products/${id}`),
  sync: () => API.post("/products/sync"), // your sync route
};

// ================= Cart API =================
export const cartAPI = {
  get: () => API.get("/cart"),
  add: (productId, qty = 1) => API.post("/cart", { productId, qty }), // match backend
  update: (productId, qty) => API.put(`/cart/${productId}`, { qty }),
  remove: (productId) => API.delete(`/cart/${productId}`),
  clear: () => API.delete("/cart"),
};

// ================= Orders API =================
export const orderAPI = {
  create: (orderData) => API.post("/orders", orderData),
  getMyOrders: () => API.get("/orders/my"),
  getById: (id) => API.get(`/orders/${id}`),
  pay: (id, paymentResult) => API.put(`/orders/${id}/pay`, paymentResult),
};

// ================= Payment API =================
export const paymentAPI = {
  initiate: (payload) => API.post("/payment/initiate", payload),
  verify: (orderId) => API.post(`/payment/verify/${orderId}`),
};

export { API };
