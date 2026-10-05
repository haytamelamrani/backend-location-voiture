const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  vehicule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  client: {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    adresse: { type: String, required: true, trim: true },
    numero_permis: { type: String, trim: true }
  },
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    default: 'CONFIRMEE'
  },
  is_vip: {
    type: Boolean,
    default: false
  },
  pre_reservation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReservationVIP'
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
