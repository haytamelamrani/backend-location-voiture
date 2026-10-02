// Modèle Car (Mongoose)
const mongoose = require('mongoose');

const vehiculeSchema = new mongoose.Schema({
    marque: {
        type: String,
        required: true
    },
    modele: {
        type: String,
        required: true
    },
    type_vehicule: {
        type: String,
        enum: ['voiture', 'van'],
        required: true
    },
    immatriculation: {
        type: String,
        required: true,
        unique: true,
        // Validation stricte : 2 lettres, 3 chiffres, 2 lettres (insensible à la casse)
        match: [/^[a-zA-Z]{2}[0-9]{3}[a-zA-Z]{2}$/, 'Format d\'immatriculation invalide. Attendu : 2 lettres, 3 chiffres, 2 lettres.']
    },
    type_carburant: {
        type: String,
        // Enumération strictement restreinte aux 4 valeurs du ticket
        enum: ['essence', 'hybride', 'diesel', 'électrique'],
        required: true
    },
    date_mise_en_service: {
        type: Date,
        required: true
    },
    kilometrage: {
        type: Number,
        required: true,
        min: 0
    },
    consommation: {
        type: Number,
        required: true
    },
    date_insertion: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Vehicule', vehiculeSchema);