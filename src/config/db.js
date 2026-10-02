const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    throw new Error('DATABASE_URL doit être définie dans le fichier .env.');
  }

  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
}

module.exports = connectDB;
