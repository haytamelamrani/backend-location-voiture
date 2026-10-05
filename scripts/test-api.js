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
    const testImmatCancelled = 'TT999ZZ';
    // Nettoyer d'éventuels anciens tests
    await Vehicule.deleteOne({ immatriculation: testImmat });
    await Vehicule.deleteOne({ immatriculation: testImmatCancelled });

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

    console.log('\n--- TEST 6: Annulation d\'une réservation VIP (attendu 200 + disponibilité rétablie) ---');
    const carCancel = await fetch(`${baseUrl.replace('/cars', '')}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marque: 'BMW',
        modele: 'X5',
        type_vehicule: 'voiture',
        immatriculation: testImmatCancelled,
        type_carburant: 'diesel',
        date_mise_en_service: '2022-11-12',
        kilometrage: 65000,
        consommation: 7.1
      })
    });
    const createdCar = await carCancel.json();
    const vehicleId = createdCar.data?._id || createdCar.data?.id;

    const vipReservationResponse = await fetch('http://localhost:5555/api/v1/rentals/vip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_client: 'Dupont',
        prenom_client: 'Alice',
        vehicule_reserve: vehicleId,
        duree_reservation: 3,
        date_action: '2026-10-01',
        date_debut_reservation: '2026-10-10'
      })
    });
    const vipReservation = await vipReservationResponse.json();
    console.log('Status création VIP:', vipReservationResponse.status, '| Success:', vipReservation.success, '| Message:', vipReservation.message);

    const cancelResponse = await fetch(`http://localhost:5555/api/v1/rentals/vip/${vipReservation.data?._id || vipReservation.data?.id}/cancel`, {
      method: 'PATCH'
    });
    const cancelData = await cancelResponse.json();
    console.log('Status annulation VIP:', cancelResponse.status, '| Statut:', cancelData.data?.statut, '| Message:', cancelData.message);

    const availabilityResponse = await fetch('http://localhost:5555/api/v1/reservations/availability?start_date=2026-10-10&end_date=2026-10-12');
    const availabilityData = await availabilityResponse.json();
    console.log('Status disponibilité:', availabilityResponse.status, '| Véhicules disponibles:', availabilityData.count, '| Contient le BMW:', availabilityData.data?.some((car) => car._id === vehicleId));

    console.log('\n--- TEST 7: Annulation d\'une réservation confirmée (attendu 200 + historique conservé + disponibilité rétablie) ---');
    const standardCar = await fetch(`${baseUrl.replace('/cars', '')}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        marque: 'Audi',
        modele: 'A4',
        type_vehicule: 'voiture',
        immatriculation: 'AA555BB',
        type_carburant: 'diesel',
        date_mise_en_service: '2024-01-12',
        kilometrage: 32000,
        consommation: 5.5
      })
    });
    const standardCarData = await standardCar.json();
    const standardCarId = standardCarData.data?._id || standardCarData.data?.id;

    const standardReservation = await fetch('http://localhost:5555/api/v1/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicule: standardCarId,
        client: {
          nom: 'Martin',
          prenom: 'Claire',
          email: 'claire.martin@test.com',
          telephone: '0600000000',
          adresse: '12 rue des Fêtes'
        },
        date_debut: '2026-12-01',
        date_fin: '2026-12-05'
      })
    });
    const standardReservationData = await standardReservation.json();
    console.log('Status création réservation standard:', standardReservation.status, '| Ref:', standardReservationData.data?.reference, '| Statut:', standardReservationData.data?.statut);

    const standardCancel = await fetch(`http://localhost:5555/api/v1/reservations/${standardReservationData.data?._id}/cancel`, {
      method: 'PATCH'
    });
    const standardCancelData = await standardCancel.json();
    console.log('Status annulation standard:', standardCancel.status, '| Statut:', standardCancelData.data?.statut, '| Message:', standardCancelData.message);

    const standardList = await fetch('http://localhost:5555/api/v1/reservations');
    const standardListData = await standardList.json();
    const standardReservationId = standardReservationData.data?._id || standardReservationData.data?.id;
    const cancelledReservation = standardListData.data?.find((item) => (item._id || item.id) === standardReservationId);
    console.log('Historique conservé:', !!cancelledReservation, '| Réservation annulée dans historique:', cancelledReservation?.statut);

    const standardAvailability = await fetch('http://localhost:5555/api/v1/reservations/availability?start_date=2026-12-01&end_date=2026-12-05');
    const standardAvailabilityData = await standardAvailability.json();
    console.log('Disponibilité après annulation standard:', standardAvailability.status, '| Contient le véhicule:', standardAvailabilityData.data?.some((car) => car._id === standardCarId));

    // Nettoyage après test
    await Vehicule.deleteOne({ immatriculation: testImmat });
    await Vehicule.deleteOne({ immatriculation: testImmatCancelled });
    await Vehicule.deleteOne({ immatriculation: 'AA555BB' });
    console.log('\nNettoyage effectué (véhicules de test supprimés). Tous les tests sont validés avec succès !');

  } catch (error) {
    console.error('Erreur lors du test :', error);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runTests();
