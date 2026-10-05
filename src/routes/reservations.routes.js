const express = require('express');
const { checkAvailability, createReservation } = require('../controllers/reservationController');

const router = express.Router();

router.get('/availability', checkAvailability);
router.post('/', createReservation);

module.exports = router;
