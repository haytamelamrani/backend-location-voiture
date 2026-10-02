const path = require('node:path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  quiet: true,
});

// Aucun modèle n'est chargé : ce diagnostic ne crée ni collection ni index.
// La résolution DNS peut dépasser le délai de sélection du serveur MongoDB.
const timeout = setTimeout(() => {
  console.error('Délai de connexion dépassé (25 s). Vérifiez le réseau, le DNS et les accès Atlas.');
  process.exit(1);
}, 25000);

async function checkDB() {
  try {
    if (!process.env.DATABASE_URL?.trim()) {
      console.error('DATABASE_URL doit être définie dans backend-location-voiture/.env.');
      process.exitCode = 1;
      return;
    }

    await connectDB();
    await mongoose.connection.db.command({ ping: 1 });
    console.log(`Connexion MongoDB réussie : base "${mongoose.connection.name}" (ping OK).`);
  } catch (error) {
    // Afficher uniquement des diagnostics prédéfinis, jamais l'URI ou l'erreur brute.
    const serverErrors = [...(error.reason?.servers?.values() || [])]
      .map(server => server.error);
    if (error.code === 18 || error.code === 8000) {
      console.error('Authentification refusée. Vérifiez l’utilisateur et le mot de passe dans Database Access et DATABASE_URL.');
    } else if (error.syscall === 'querySrv' || error.syscall === 'queryTxt') {
      console.error('Résolution DNS impossible. Vérifiez le nom du cluster dans DATABASE_URL et votre connexion réseau.');
    } else if (serverErrors.some(serverError => /tls|ssl|certificate/i.test(serverError?.message || ''))) {
      console.error('Connexion TLS à MongoDB impossible. Vérifiez Network Access dans Atlas, puis le réseau, le VPN ou le pare-feu.');
    } else if (error.name === 'MongoParseError') {
      console.error('DATABASE_URL est invalide. Reprenez l’URI fournie par Atlas dans Connect > Drivers.');
    } else {
      console.error('Connexion MongoDB impossible. Vérifiez DATABASE_URL, l’état du cluster et les accès réseau Atlas.');
    }
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } finally {
      clearTimeout(timeout);
    }
  }
}

checkDB().catch(() => {
  console.error('Impossible de terminer le diagnostic MongoDB.');
  process.exitCode = 1;
});
