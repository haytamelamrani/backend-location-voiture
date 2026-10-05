/**
 * Middleware de validation des données d'entrée pour la pré-réservation VIP
 * Champs attendus : nom_client, prenom_client, duree_reservation,
 * date_action, date_debut_reservation (+ vehicule_reserve : ID du véhicule)
 */
const mongoose = require('mongoose');

// Comparaison sur la date seule (sans l'heure) pour autoriser une réservation le jour même
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function validateReservationVIP(req, res, next) {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Le corps de la requête est vide ou invalide.'
    });
  }

  // 1. Nom du client
  if (!body.nom_client || typeof body.nom_client !== 'string' || body.nom_client.trim() === '') {
    errors.push('Le champ "nom_client" est obligatoire et doit être une chaîne non vide.');
  }

  // 2. Prénom du client
  if (!body.prenom_client || typeof body.prenom_client !== 'string' || body.prenom_client.trim() === '') {
    errors.push('Le champ "prenom_client" est obligatoire et doit être une chaîne non vide.');
  }

  // 3. Véhicule réservé (ObjectId)
  if (!body.vehicule_reserve || !mongoose.Types.ObjectId.isValid(body.vehicule_reserve)) {
    errors.push('Le champ "vehicule_reserve" est obligatoire et doit être un identifiant de véhicule valide.');
  }

  // 4. Durée de réservation (en jours, entier >= 1)
  if (body.duree_reservation === undefined || body.duree_reservation === null || body.duree_reservation === '') {
    errors.push('Le champ "duree_reservation" est obligatoire.');
  } else {
    const duree = Number(body.duree_reservation);
    if (!Number.isInteger(duree) || duree < 1) {
      errors.push('Le champ "duree_reservation" doit être un nombre entier de jours supérieur ou égal à 1.');
    }
  }

  // 5. Date d'action (facultative : date du jour par défaut)
  let dateAction = new Date();
  if (body.date_action !== undefined && body.date_action !== null && body.date_action !== '') {
    dateAction = new Date(body.date_action);
    if (isNaN(dateAction.getTime())) {
      errors.push('Le champ "date_action" doit être une date valide (ex: 2026-10-05).');
    }
  }

  // 6. Date de début de la réservation
  if (!body.date_debut_reservation) {
    errors.push('Le champ "date_debut_reservation" est obligatoire.');
  } else {
    const dateDebut = new Date(body.date_debut_reservation);
    if (isNaN(dateDebut.getTime())) {
      errors.push('Le champ "date_debut_reservation" doit être une date valide (ex: 2026-11-01).');
    } else if (!isNaN(dateAction.getTime()) && startOfDay(dateDebut) < startOfDay(dateAction)) {
      errors.push('La date de début de réservation ne peut pas être antérieure à la date d\'action.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données fournies.',
      errors
    });
  }

  // Normalisation des données pour les couches suivantes (controller / model)
  req.body.nom_client = body.nom_client.trim();
  req.body.prenom_client = body.prenom_client.trim();
  req.body.duree_reservation = Number(body.duree_reservation);
  req.body.date_action = dateAction;
  req.body.date_debut_reservation = new Date(body.date_debut_reservation);

  next();
}

module.exports = validateReservationVIP;
