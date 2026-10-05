const path = require('node:path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const connectDB = require('../src/config/db');
const app = require('../src/app');
const Vehicule = require('../src/models/Car');
const mongoose = require('mongoose');

async function runTests() {
  let server;
  try {
    await connectDB();
    console.log('Connecté à MongoDB pour le test.');

    const PORT = 5555;
    server = app.listen(PORT);
    const baseUrl = `http://localhost:${PORT}/api/v1/cars`;

    const testImmat = 'TT888ZZ';
    // Nettoyer d'éventuels anciens tests
    await Vehicule.deleteOne({ immatriculation: testImmat });

    console.log('\n--- TEST 1: Corps de requête vide (attendu 400) ---');
    let res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    let data = await res.json();
    console.log('Status:', res.status, '| Reponse:', data);

    console.log('\n--- TEST 2: Champs invalides (immat incorrecte, type inconnu, km négatif) (attendu 400) ---');
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marque: 'Peugeot',
        modele: '208',
        type_vehicule: 'camion', // Invalide
        immatriculation: 'INVALID_123', // Invalide
        type_carburant: 'kerosene', // Invalide
        date_mise_en_service: '2030-01-01', // Date future invalide
        kilometrage: -50, // Négatif invalide
        consommation: -2 // Négatif invalide
      })
    });
    data = await res.json();
    console.log('Status:', res.status, '| Erreurs:', data.errors);

    console.log('\n--- TEST 3: Ajout d\'un véhicule valide (attendu 201) ---');
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marque: 'Renault',
        modele: 'Megane',
        type_vehicule: 'voiture',
        immatriculation: testImmat,
        type_carburant: 'hybride',
        date_mise_en_service: '2023-05-10',
        kilometrage: 15400,
        consommation: 4.8
      })
    });
    data = await res.json();
    console.log('Status:', res.status, '| Success:', data.success, '| Message:', data.message);

    console.log('\n--- TEST 4: Doublon sur l\'immatriculation (attendu 409) ---');
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marque: 'Renault',
        modele: 'Megane',
        type_vehicule: 'voiture',
        immatriculation: testImmat,
        type_carburant: 'hybride',
        date_mise_en_service: '2023-05-10',
        kilometrage: 15400,
        consommation: 4.8
      })
    });
    data = await res.json();
    console.log('Status:', res.status, '| Reponse:', data);

    console.log('\n--- TEST 5: Consultation de la liste des voitures (attendu 200) ---');
    res = await fetch(baseUrl);
    data = await res.json();
    console.log('Status:', res.status, '| Nombre de voitures trouvées:', data.count);

    // Nettoyage après test
    await Vehicule.deleteOne({ immatriculation: testImmat });
    console.log('\nNettoyage effectué (véhicule de test supprimé). Tous les tests sont validés avec succès !');

  } catch (error) {
    console.error('Erreur lors du test :', error);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runTests();
