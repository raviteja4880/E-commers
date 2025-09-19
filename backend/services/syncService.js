const axios = require("axios");
const Product = require("../models/Product");

const syncProducts = async () => {
  try {
    const { data } = await axios.get("https://fakestoreapi.com/products");

    let newCount = 0;
    let updatedCount = 0;

    for (const item of data) {
      const existing = await Product.findOne({ externalId: String(item.id) });

      if (existing) {
        await Product.findOneAndUpdate(
          { externalId: String(item.id) },
          {
            name: item.title,
            image: item.image,
            brand: "Generic",
            category: item.category,
            description: item.description,
            price: item.price,
            countInStock: Math.floor(Math.random() * 20) + 1,
          },
          { new: true }
        );
        updatedCount++;
      } else {
        await Product.create({
          externalId: String(item.id),
          name: item.title,
          image: item.image,
          brand: "Generic",
          category: item.category,
          description: item.description,
          price: item.price,
          countInStock: Math.floor(Math.random() * 20) + 1,
        });
        newCount++;
      }
    }

    console.log(`✅ Sync completed: ${newCount} new, ${updatedCount} updated`);
    return { newCount, updatedCount };
  } catch (error) {
    console.error("❌ Error syncing products:", error.message);
    throw error;
  }
};

module.exports = { syncProducts };
