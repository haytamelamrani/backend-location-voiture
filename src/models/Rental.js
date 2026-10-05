// Modèle ReservationVIP (Mongoose)
const mongoose = require('mongoose');

const reservationVIPSchema = new mongoose.Schema({
    nom_client: {
        type: String,
        required: [true, 'Le nom du client est obligatoire.'],
        trim: true
    },
    prenom_client: {
        type: String,
        required: [true, 'Le prénom du client est obligatoire.'],
        trim: true
    },
    vehicule_reserve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicule',
        required: [true, 'Le véhicule réservé est obligatoire.']
    },
    duree_reservation: {
        type: Number,
        required: [true, 'La durée de réservation est obligatoire.'],
        min: [1, 'La durée de réservation doit être d\'au moins 1 jour.']
    },
    date_action: {
        type: Date,
        default: Date.now
    },
    date_debut_reservation: {
        type: Date,
        required: [true, 'La date de début de réservation est obligatoire.']
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('ReservationVIP', reservationVIPSchema);
