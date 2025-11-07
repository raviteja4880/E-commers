import axios from "axios";

// ----------------- Dynamic Base URL -----------------
const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

// ----------------- Axios instance -----------------
const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ----------------- Attach JWT token automatically -----------------
API.interceptors.request.use((req) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = userInfo?.token;
    if (token) req.headers.Authorization = `Bearer ${token}`;
  } catch {
    console.warn("Invalid userInfo in localStorage");
  }
  return req;
});

// ================= AUTH API =================
export const authAPI = {
  login: (payload) => API.post("/auth/login", payload),
  register: (payload) => API.post("/auth/register", payload),
  getProfile: () => API.get("/auth/profile"),
  updateProfile: (data) => API.put("/auth/profile", data),
};

// ================= PRODUCTS API =================
export const productAPI = {
  getAll: () => API.get("/products"),
  getById: (id) => API.get(`/products/${id}`),
  create: (payload) => API.post("/products", payload),
  update: (id, payload) => API.put(`/products/${id}`, payload),
  delete: (id) => API.delete(`/products/${id}`),
  sync: () => API.post("/products/sync"),
};

// ================= CART API =================
export const cartAPI = {
  get: () => API.get("/cart"),
  add: (productId, qty = 1) => API.post("/cart/add", { productId, qty }),
  update: (productId, qty) => API.put(`/cart/${productId}`, { qty }),
  remove: (productId) => API.delete(`/cart/${productId}`),
  clear: () => API.delete("/cart"),
};

// ================= ORDERS API =================
export const orderAPI = {
  create: (orderData) => API.post("/orders", orderData),
  getMyOrders: () => API.get("/orders/my"),
  getById: (id) => API.get(`/orders/${id}`),
  pay: (id, paymentResult) => API.put(`/orders/${id}/pay`, paymentResult),
  verifyPayment: (id) => API.get(`/orders/${id}/verify-payment`),
};

// ================= PAYMENT API =================
export const paymentAPI = {
  initiate: (payload) => API.post("/payment/initiate", payload),
  verify: (orderId) => API.post(`/payment/verify/${orderId}`),
  confirm: (orderId) => API.post(`/payment/confirm/${orderId}`),
};

// ================= ADMIN API =================
export const adminAPI = {
  getAllOrders: () => API.get("/admin/orders"),
  assignDelivery: (orderId, deliveryPartnerId) =>
    API.put(`/admin/orders/${orderId}/assign`, { deliveryPartnerId }),
  getDeliveryPartners: () => API.get("/admin/delivery"),
  addDeliveryPartner: (payload) => API.post("/admin/delivery", payload),
};

// ================= DELIVERY API =================
export const deliveryAPI = {
  getMyOrders: () => API.get("/delivery/my-orders"),
  markDelivered: (orderId) => API.put(`/delivery/${orderId}/deliver`),
};

export { API };
