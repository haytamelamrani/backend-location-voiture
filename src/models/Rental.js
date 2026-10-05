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
    },
    statut: {
        type: String,
        enum: ['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE'],
        default: 'EN_ATTENTE'
    },
    email_client: {
        type: String,
        trim: true
    },
    telephone_client: {
        type: String,
        trim: true
    },
    adresse_client: {
        type: String,
        trim: true
    },
    numero_permis: {
        type: String,
        trim: true
    },
    reservation_definitive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    }
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Calcul virtuel de la date de fin
reservationVIPSchema.virtual('date_fin_reservation').get(function() {
    if (!this.date_debut_reservation || !this.duree_reservation) return null;
    const end = new Date(this.date_debut_reservation);
    end.setDate(end.getDate() + this.duree_reservation);
    return end;
});

module.exports = mongoose.model('ReservationVIP', reservationVIPSchema);
