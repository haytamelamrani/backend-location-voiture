const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globaux
app.use(helmet());

const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) {
  throw new Error('La variable d\'environnement CLIENT_URL est obligatoire dans le fichier .env.');
}

// Découpage au cas où plusieurs origines sont listées (séparées par une virgule dans .env)
const allowedOrigins = clientUrl.split(',').map((url) => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (Postman, curl, tests internes) ou si l'origine correspond à .env
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origine CORS non autorisée : ${origin}. CLIENT_URL attendu : ${clientUrl}`));
  },
  credentials: true
}));

app.use(express.json());

// Point d'entrée de statut de l'API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API opérationnelle' });
});

// Routes de l'API
// app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/cars', require('./routes/cars.routes'));
app.use('/api/v1/rentals', require('./routes/rentals.routes'));
app.use('/api/v1/reservations', require('./routes/reservations.routes'));

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} introuvable.`
  });
});

// Middleware de gestion globale des erreurs
app.use(errorHandler);

module.exports = app;
