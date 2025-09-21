// routes/orderRoutes.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

const router = express.Router();

// @desc    Create an order from cart
// @route   POST /api/orders
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { address } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      qty: item.qty,
      price: item.product.price,
    }));

    const totalPrice = orderItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      shippingAddress: address,
    });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
