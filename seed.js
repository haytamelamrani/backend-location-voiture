// ==============================================
// Script de seed / test – Vehicule & ReservationVIP
// ==============================================
// Usage : node seed.js
// ==============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Importer les modèles
const Vehicule = require('./src/models/Car');
const ReservationVIP = require('./src/models/Rental');

const seed = async () => {
    try {
        // ---- 1. Connexion à MongoDB ----
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connexion à MongoDB réussie');

        // ---- 2. Nettoyage des collections ----
        await Vehicule.deleteMany({});
        console.log('🗑️  Collection Vehicule vidée');

        await ReservationVIP.deleteMany({});
        console.log('🗑️  Collection ReservationVIP vidée');

        // ---- 3. Création d'un véhicule de test ----
        const vehicule = await Vehicule.create({
            marque: 'Renault',
            modele: 'Clio',
            type_vehicule: 'voiture',
            immatriculation: 'AB123CD',
            type_carburant: 'essence',
            date_mise_en_service: new Date('2022-03-15'),
            kilometrage: 25000,
            consommation: 5.8
        });

        console.log('\n🚗 Véhicule créé avec succès :');
        console.log(vehicule);

        // ---- 4. Création d'une réservation VIP liée au véhicule ----
        const reservation = await ReservationVIP.create({
            nom_client: 'Dupont',
            prenom_client: 'Jean',
            vehicule_reserve: vehicule._id,
            duree_reservation: 7,
            date_debut_reservation: new Date('2026-11-01')
        });

        console.log('\n📋 Réservation VIP créée avec succès :');
        console.log(reservation);

        // ---- 5. Vérification avec populate ----
        const reservationComplete = await ReservationVIP
            .findById(reservation._id)
            .populate('vehicule_reserve');

        console.log('\n🔗 Réservation VIP avec détails du véhicule (populate) :');
        console.log(JSON.stringify(reservationComplete, null, 2));

    } catch (error) {
        console.error('❌ Erreur :', error.message);
    } finally {
        // ---- 6. Déconnexion propre ----
        await mongoose.disconnect();
        console.log('\n🔌 Déconnexion de MongoDB');
    }
};

seed();
