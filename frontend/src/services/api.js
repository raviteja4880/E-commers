import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ✅ Get token from localStorage
const getToken = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token;
};

// ✅ Axios instance with Authorization and baseURL
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${getToken()}` },
});

// ================= Products =================
export const getProducts = async () => {
  try {
    const res = await axiosInstance.get("/products"); // use axiosInstance
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const res = await axiosInstance.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    throw error;
  }
};

// ================= Cart =================
export const getCart = async () => {
  try {
    const res = await axiosInstance.get("/cart");
    return res.data.items;
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    throw error;
  }
};

export const addToCart = async (productId, qty = 1) => {
  try {
    const res = await axiosInstance.post("/cart/add", { productId, qty });
    return res.data.items;
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    throw error;
  }
};

export const updateCartQty = async (productId, qty) => {
  try {
    const res = await axiosInstance.put(`/cart/${productId}`, { qty });
    return res.data.items;
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    throw error;
  }
};

export const removeFromCart = async (productId) => {
  try {
    const res = await axiosInstance.delete(`/cart/${productId}`);
    return res.data.items;
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const res = await axiosInstance.delete("/cart");
    return res.data.items;
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    throw error;
  }
};

// ================= Orders =================
export const createOrder = async (address) => {
  try {
    const token = getToken();
    const res = await axiosInstance.post(
      "/orders",
      { address },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error creating order:", error);
    throw error;
  }
};
