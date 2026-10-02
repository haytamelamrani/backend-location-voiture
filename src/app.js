const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json());

// Point d'entrée de statut de l'API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API opérationnelle' });
});

// Routes de l'API
// app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/cars', require('./routes/cars.routes'));
// app.use('/api/v1/rentals', require('./routes/rentals.routes'));

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
