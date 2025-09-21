import React from "react";
import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div className="text-center mt-5">
      <h2>🎉 Order Placed Successfully!</h2>
      <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
    </div>
  );
}

export default OrderSuccess;
