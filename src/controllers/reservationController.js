const Reservation = require('../models/Reservation');
const ReservationVIP = require('../models/Rental');
const Car = require('../models/Car');

// Générer une référence unique
const generateReference = () => {
  return 'RES-' + Math.random().toString(36).substring(2, 7).toUpperCase();
};

const checkAvailability = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Les dates de début et de fin sont obligatoires." });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate <= startDate) {
      return res.status(400).json({ message: "La date de fin doit être strictement postérieure à la date de début." });
    }

    // Trouver les réservations régulières qui chevauchent la période demandée
    const overlappingReservations = await Reservation.find({
      $and: [
        { date_debut: { $lte: endDate } },
        { date_fin: { $gte: startDate } }
      ]
    }).select('vehicule');

    // Trouver les réservations VIP
    // Pour simplifier, on récupère toutes les VIP et on vérifie en mémoire ou on fait une approximation (si la date de début + durée chevauche)
    const allVIPs = await ReservationVIP.find({}).select('vehicule date_debut_reservation duree_reservation');
    const overlappingVIPs = allVIPs.filter(vip => {
      const vipStart = new Date(vip.date_debut_reservation);
      const vipEnd = new Date(vipStart);
      vipEnd.setDate(vipEnd.getDate() + vip.duree_reservation);
      return (vipStart <= endDate && vipEnd >= startDate);
    });

    const reservedCarIds = [
      ...overlappingReservations.map(res => res.vehicule.toString()),
      ...overlappingVIPs.map(res => res.vehicule.toString())
    ];

    // Trouver les véhicules qui ne sont pas dans la liste des véhicules réservés
    const availableCars = await Car.find({
      _id: { $nin: reservedCarIds }
    });

    res.json({ success: true, count: availableCars.length, data: availableCars });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la vérification des disponibilités.", error: error.message });
  }
};

const createReservation = async (req, res) => {
  try {
    const { vehicule, client, date_debut, date_fin } = req.body;

    if (!vehicule || !client || !date_debut || !date_fin) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être renseignés." });
    }
    
    const { nom, prenom, email, telephone, adresse } = client;
    if (!nom || !prenom || !email || !telephone || !adresse) {
      return res.status(400).json({ message: "Les informations du client sont incomplètes." });
    }

    const startDate = new Date(date_debut);
    const endDate = new Date(date_fin);

    if (endDate <= startDate) {
      return res.status(400).json({ message: "La date de fin doit être strictement postérieure à la date de début." });
    }

    // Vérifier si le véhicule existe
    const carExists = await Car.findById(vehicule);
    if (!carExists) {
      return res.status(404).json({ message: "Le véhicule spécifié n'existe pas." });
    }

    // Vérifier si le client a déjà réservé un véhicule pour cette période
    const clientHasReservation = await Reservation.exists({
      'client.email': email,
      $and: [
        { date_debut: { $lte: endDate } },
        { date_fin: { $gte: startDate } }
      ]
    });

    if (clientHasReservation) {
      return res.status(409).json({ message: "Vous avez déjà réservé un véhicule pour cette période." });
    }

    // Vérifier une dernière fois la disponibilité pour éviter le double-booking
    const isOverlapping = await Reservation.exists({
      vehicule,
      $and: [
        { date_debut: { $lte: endDate } },
        { date_fin: { $gte: startDate } }
      ]
    });

    if (isOverlapping) {
      return res.status(409).json({ message: "Le véhicule est déjà réservé sur cette période." });
    }

    // Vérifier aussi les VIP
    const allVIPs = await ReservationVIP.find({ vehicule }).select('date_debut_reservation duree_reservation');
    const isOverlappingVIP = allVIPs.some(vip => {
      const vipStart = new Date(vip.date_debut_reservation);
      const vipEnd = new Date(vipStart);
      vipEnd.setDate(vipEnd.getDate() + vip.duree_reservation);
      return (vipStart <= endDate && vipEnd >= startDate);
    });

    if (isOverlappingVIP) {
      return res.status(409).json({ message: "Le véhicule est déjà réservé (VIP) sur cette période." });
    }

    const reservation = new Reservation({
      reference: generateReference(),
      vehicule,
      client,
      date_debut: startDate,
      date_fin: endDate
    });

    await reservation.save();

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la réservation.", error: error.message });
  }
};

module.exports = {
  checkAvailability,
  createReservation
};
