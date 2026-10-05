// Modèle Car (Mongoose)
const mongoose = require('mongoose');

const vehiculeSchema = new mongoose.Schema({
    marque: {
        type: String,
        required: [true, 'La marque est obligatoire.'],
        trim: true
    },
    modele: {
        type: String,
        required: [true, 'Le modèle est obligatoire.'],
        trim: true
    },
    type_vehicule: {
        type: String,
        enum: {
            values: ['voiture', 'van'],
            message: 'Le type de véhicule doit être "voiture" ou "van".'
        },
        required: [true, 'Le type de véhicule est obligatoire.'],
        lowercase: true,
        trim: true
    },
    immatriculation: {
        type: String,
        required: [true, 'L\'immatriculation est obligatoire.'],
        unique: true,
        trim: true,
        uppercase: true,
        // Validation stricte : 2 lettres, 3 chiffres, 2 lettres (insensible à la casse)
        match: [/^[a-zA-Z]{2}[0-9]{3}[a-zA-Z]{2}$/, 'Format d\'immatriculation invalide. Attendu : 2 lettres, 3 chiffres, 2 lettres (ex: AB123CD).']
    },
    type_carburant: {
        type: String,
        // Énumération strictement restreinte aux 4 valeurs du ticket
        enum: {
            values: ['essence', 'hybride', 'diesel', 'électrique'],
            message: 'Le type de carburant doit être : essence, hybride, diesel ou électrique.'
        },
        required: [true, 'Le type de carburant est obligatoire.'],
        lowercase: true,
        trim: true
    },
    date_mise_en_service: {
        type: Date,
        required: [true, 'La date de mise en service est obligatoire.']
    },
    kilometrage: {
        type: Number,
        required: [true, 'Le kilométrage est obligatoire.'],
        min: [0, 'Le kilométrage ne peut pas être négatif.']
    },
    consommation: {
        type: Number,
        required: [true, 'La consommation est obligatoire.'],
        min: [0, 'La consommation ne peut pas être négative.']
    },
    date_insertion: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

const Vehicule = mongoose.models.Vehicule || mongoose.model('Vehicule', vehiculeSchema);

// Alias de modèle 'Car' pour assurer la compatibilité avec ref: 'Car'
if (!mongoose.models.Car) {
    mongoose.model('Car', vehiculeSchema);
}

module.exports = Vehicule;