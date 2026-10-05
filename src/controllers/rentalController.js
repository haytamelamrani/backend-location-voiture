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
