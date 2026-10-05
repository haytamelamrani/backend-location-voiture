const express = require('express');
const { checkAvailability, createReservation, getReservations, cancelReservation } = require('../controllers/reservationController');

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/', getReservations);
router.post('/', createReservation);
router.patch('/:id/cancel', cancelReservation);

module.exports = router;
