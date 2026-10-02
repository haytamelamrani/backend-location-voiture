// Configuration de la connexion à la base de données
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB connecté : ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur de connexion MongoDB : ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
