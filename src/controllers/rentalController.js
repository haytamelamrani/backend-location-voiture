// Contrôleur des réservations
const ReservationVIP = require('../models/Rental');
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

    const reservation = await ReservationVIP.create({
      nom_client,
      prenom_client,
      vehicule_reserve,
      duree_reservation,
      date_action,
      date_debut_reservation
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
 * @desc    Annuler une réservation VIP sans la supprimer
 * @route   PATCH /api/v1/rentals/vip/:id/cancel
 */
exports.cancelReservationVIP = async (req, res, next) => {
  try {
    const reservation = await ReservationVIP.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation VIP introuvable.'
      });
    }

    if (reservation.statut === 'Annulée') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation est déjà annulée.',
        data: reservation
      });
    }

    reservation.statut = 'Annulée';
    await reservation.save();

    return res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès.',
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};
