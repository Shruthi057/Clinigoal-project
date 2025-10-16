const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use production MongoDB URI from environment variables, fallback to local
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clinigoal';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    // Only exit in production, so local dev doesn't crash unnecessarily
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

module.exports = connectDB;
