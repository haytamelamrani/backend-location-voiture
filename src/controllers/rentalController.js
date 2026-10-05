// Contrôleur des réservations
const ReservationVIP = require('../models/Rental');
const Reservation = require('../models/Reservation');
const Vehicule = require('../models/Car');

/**
 * @desc    Pré-réserver un véhicule pour un client VIP
 * @route   POST /api/v1/rentals/vip
 * @access  Admin (TODO : protéger avec le middleware isAdmin lorsque l'authentification existera)
 */
exports.createReservationVIP = async (req, res, next) => {
  try {
    const {
      nom_client,
      prenom_client,
      vehicule_reserve,
      duree_reservation,
      date_action,
      date_debut_reservation
    } = req.body;

    // Vérifier que le véhicule existe
    const vehicle = await Vehicule.findById(vehicule_reserve);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule à réserver introuvable.'
      });
    }

    const start = new Date(date_debut_reservation);
    const end = new Date(start);
    end.setDate(end.getDate() + duree_reservation);
    const startDay = start.toISOString().split('T')[0];

    const allVIPReservations = await ReservationVIP.find();

    for (let resa of allVIPReservations) {
      const resaStart = new Date(resa.date_debut_reservation);
      const resaEnd = new Date(resaStart);
      resaEnd.setDate(resaEnd.getDate() + resa.duree_reservation);

      // Règle 2 : Un véhicule par client et par jour
      if (resa.nom_client === nom_client && resa.prenom_client === prenom_client) {
        if (resaStart.toISOString().split('T')[0] === startDay) {
          return res.status(409).json({
            success: false,
            message: "❌ Erreur de pré-réservation : L'action a été bloquée. La politique VIP autorise un seul véhicule par jour et par client. Le client possède déjà une réservation à cette date."
          });
        }
      }

      // Règle 1 : Chevauchement en même temps
      // La politique d'exclusivité interdit de pré-réserver deux véhicules qui se chevauchent en même temps.
      if (start < resaEnd && end > resaStart) {
        return res.status(409).json({
          success: false,
          message: "❌ Erreur de pré-réservation : L'action a été bloquée. La politique VIP interdit strictement de pré-réserver deux véhicules différents qui se chevauchent en même temps."
        });
      }
    }

    const reservation = await ReservationVIP.create({
      nom_client,
      prenom_client,
      vehicule_reserve,
      duree_reservation,
      date_action,
      date_debut_reservation,
      statut: 'EN_ATTENTE'
    });

    await reservation.populate('vehicule_reserve');

    return res.status(201).json({
      success: true,
      message: `Pré-réservation VIP enregistrée pour ${prenom_client} ${nom_client}.`,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir la liste des pré-réservations VIP
 * @route   GET /api/v1/rentals/vip
 * @access  Admin (TODO : protéger avec le middleware isAdmin lorsque l'authentification existera)
 */
exports.getReservationsVIP = async (req, res, next) => {
  try {
    const reservations = await ReservationVIP
      .find()
      .populate('vehicule_reserve')
      .populate('reservation_definitive')
      .sort({ date_action: -1 });

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirmer une pré-réservation VIP et la transformer en réservation définitive
 * @route   PATCH /api/v1/rentals/vip/:id/confirm ou POST /api/v1/rentals/vip/:id/confirm
 * @access  Admin
 */
exports.confirmReservationVIP = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vip = await ReservationVIP.findById(id).populate('vehicule_reserve');
    if (!vip) {
      return res.status(404).json({
        success: false,
        message: 'Pré-réservation VIP introuvable.'
      });
    }

    if (vip.statut === 'CONFIRMEE') {
      return res.status(409).json({
        success: false,
        message: 'Cette pré-réservation VIP a déjà été confirmée.'
      });
    }

    // Récupération des informations client
    const clientData = req.body.client || {};
    const nom = (clientData.nom || req.body.nom || vip.nom_client || '').trim();
    const prenom = (clientData.prenom || req.body.prenom || vip.prenom_client || '').trim();
    const email = (clientData.email || req.body.email || vip.email_client || '').trim();
    const telephone = (clientData.telephone || req.body.telephone || vip.telephone_client || '').trim();
    const adresse = (clientData.adresse || req.body.adresse || vip.adresse_client || '').trim();
    const numero_permis = (clientData.numero_permis || req.body.numero_permis || vip.numero_permis || '').trim();

    // Véhicule associé
    const vehiculeId = req.body.vehicule?._id || req.body.vehicule || vip.vehicule_reserve?._id || vip.vehicule_reserve;

    // Dates
    const date_debut = req.body.date_debut || (vip.date_debut_reservation ? new Date(vip.date_debut_reservation).toISOString().split('T')[0] : null);
    let date_fin = req.body.date_fin;

    if (!date_fin && date_debut && vip.duree_reservation) {
      const calcEnd = new Date(date_debut);
      calcEnd.setDate(calcEnd.getDate() + Number(vip.duree_reservation));
      date_fin = calcEnd.toISOString().split('T')[0];
    }

    // Critère 3 : L’administrateur ne peut confirmer la pré-réservation que si toutes les informations sont saisies
    const missing = [];
    if (!nom) missing.push('nom');
    if (!prenom) missing.push('prenom');
    if (!email) missing.push('email');
    if (!telephone) missing.push('telephone');
    if (!adresse) missing.push('adresse');
    if (!vehiculeId) missing.push('vehicule');
    if (!date_debut) missing.push('date_debut');
    if (!date_fin) missing.push('date_fin');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Toutes les informations doivent être saisies pour confirmer la pré-réservation. Champs manquants : ${missing.join(', ')}.`,
        missing_fields: missing
      });
    }

    const startDate = new Date(date_debut);
    const endDate = new Date(date_fin);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être strictement postérieure à la date de début.'
      });
    }

    // Vérifier l'existence du véhicule
    const vehicle = await Vehicule.findById(vehiculeId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Le véhicule spécifié est introuvable.'
      });
    }

    // Générer une référence unique pour la réservation définitive
    const reference = 'VIP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Critère 4 : Création de la réservation définitive
    const definitiveReservation = await Reservation.create({
      reference,
      vehicule: vehiculeId,
      client: {
        nom,
        prenom,
        email,
        telephone,
        adresse,
        numero_permis
      },
      date_debut: startDate,
      date_fin: endDate,
      statut: 'CONFIRMEE',
      is_vip: true,
      pre_reservation_id: vip._id
    });

    // Mise à jour de la pré-réservation VIP en statut 'CONFIRMEE'
    vip.statut = 'CONFIRMEE';
    vip.email_client = email;
    vip.telephone_client = telephone;
    vip.adresse_client = adresse;
    if (numero_permis) vip.numero_permis = numero_permis;
    vip.reservation_definitive = definitiveReservation._id;
    await vip.save();

    await definitiveReservation.populate('vehicule');

    return res.status(200).json({
      success: true,
      message: `La pré-réservation VIP a été confirmée avec succès et transformée en réservation définitive (${reference}).`,
      data: definitiveReservation,
      pre_reservation: vip
    });
  } catch (error) {
    next(error);
  }
};
