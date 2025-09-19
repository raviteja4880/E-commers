const API_URL = "http://localhost:5000/api";

export const getProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error; 
  }
};
