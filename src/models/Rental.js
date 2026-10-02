// Modèle ReservationVIP (Mongoose)
const mongoose = require('mongoose');

const reservationVIPSchema = new mongoose.Schema({
    vehicule_reserve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicule',
        required: true
    },
    duree_reservation: {
        type: Number,
        required: true,
        min: 1
    },
    date_action: {
        type: Date,
        default: Date.now
    },
    date_debut_reservation: {
        type: Date,
        required: true
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('ReservationVIP', reservationVIPSchema);
