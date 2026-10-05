const dotenv = require('dotenv');
const path = require('node:path');
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    console.log('Connexion à MongoDB établie.');
  } catch {
    // Ne pas journaliser l'erreur brute : elle peut contenir des identifiants.
    console.error('Connexion à MongoDB impossible. Vérifiez DATABASE_URL dans .env, les identifiants et les accès réseau Atlas.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

startServer();