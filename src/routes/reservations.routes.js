const express = require('express');
const {
  checkAvailability,
  createReservation,
  getReservations
} = require('../controllers/reservationController');

const router = express.Router();

router.get('/', getReservations);
router.get('/availability', checkAvailability);
router.post('/', createReservation);

module.exports = router;
