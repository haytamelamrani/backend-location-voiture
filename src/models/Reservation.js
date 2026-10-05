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
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    adresse: { type: String, required: true }
  },
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: {
    type: Date,
    required: true
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
