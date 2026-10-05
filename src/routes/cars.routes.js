const express = require('express');
const router = express.Router();

const {
  createCar,
  getCars,
  getCarById
} = require('../controllers/carController');

const validateCar = require('../middlewares/validateCar');

// Route POST : ajouter une voiture (avec validation stricte des champs)
router.post('/', validateCar, createCar);

// Routes GET : consulter les voitures
router.get('/', getCars);
router.get('/:id', getCarById);

module.exports = router;
