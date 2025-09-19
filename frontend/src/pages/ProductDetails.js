import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ProductDetails() {
  const { id } = useParams(); // get product ID from URL
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [id]);

  if (!product) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={styles.container}>
      <img src={product.image} alt={product.name} style={styles.image} />
      <div style={styles.details}>
        <h2>{product.name}</h2>
        <p><b>Brand:</b> {product.brand}</p>
        <p><b>Category:</b> {product.category}</p>
        <p>{product.description}</p>
        <h3 style={styles.price}>₹{product.price}</h3>
        <p>{product.countInStock > 0 ? "✅ In Stock" : "❌ Out of Stock"}</p>
        <button style={styles.button} disabled={product.countInStock === 0}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "20px",
    padding: "40px",
  },
  image: {
    width: "400px",
    height: "400px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  details: {
    flex: 1,
  },
  price: {
    color: "green",
    fontWeight: "bold",
    fontSize: "22px",
  },
  button: {
    marginTop: "15px",
    padding: "10px 15px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ProductDetails;
