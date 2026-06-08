const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Ignore exit if we are just using a placeholder, to allow the server to still run but fail queries.
    // However, it's generally better to exit or let the app know it's in a disconnected state.
    // For development with a placeholder, we might not want it to completely crash loop.
    if (!process.env.MONGO_URI.includes('<username>')) {
        process.exit(1);
    } else {
        console.warn("Using placeholder MongoDB URI. Database features will not work until configured.");
    }
  }
};

module.exports = connectDB;
