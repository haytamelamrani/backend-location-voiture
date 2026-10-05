// Routes des réservations
const express = require('express');
const router = express.Router();

const {
  createReservationVIP,
  getReservationsVIP,
  confirmReservationVIP
} = require('../controllers/rentalController');

const validateReservationVIP = require('../middlewares/validateReservationVIP');

// Pré-réservation VIP (Admin) — TODO : ajouter isAuth/isAdmin quand l'authentification sera implémentée
router.post('/vip', validateReservationVIP, createReservationVIP);
router.get('/vip', getReservationsVIP);
router.patch('/vip/:id/confirm', confirmReservationVIP);
router.post('/vip/:id/confirm', confirmReservationVIP);

module.exports = router;
