const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connexion à MongoDB puis démarrage du serveur
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
});
