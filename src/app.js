const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes (à implémenter)
// app.use('/api/v1/auth', require('./routes/auth.routes'));
// app.use('/api/v1/cars', require('./routes/cars.routes'));
// app.use('/api/v1/rentals', require('./routes/rentals.routes'));

module.exports = app;
