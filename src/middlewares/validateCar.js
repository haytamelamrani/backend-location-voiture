/**
 * Middleware de validation des données d'entrée pour l'ajout d'un véhicule
 */

const ALLOWED_VEHICLE_TYPES = ['voiture', 'van'];
const ALLOWED_FUEL_TYPES = ['essence', 'hybride', 'diesel', 'électrique'];
const IMMATRICULATION_REGEX = /^[a-zA-Z]{2}[0-9]{3}[a-zA-Z]{2}$/;

function validateCar(req, res, next) {
  const errors = [];
  const body = req.body;

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Le corps de la requête est vide ou invalide.'
    });
  }

  // 1. Validation de la marque
  if (!body.marque || typeof body.marque !== 'string' || body.marque.trim() === '') {
    errors.push('Le champ "marque" est obligatoire et doit être une chaîne non vide.');
  }

  // 2. Validation du modèle
  if (!body.modele || typeof body.modele !== 'string' || body.modele.trim() === '') {
    errors.push('Le champ "modele" est obligatoire et doit être une chaîne non vide.');
  }

  // 3. Validation du type de véhicule
  if (!body.type_vehicule || typeof body.type_vehicule !== 'string') {
    errors.push(`Le champ "type_vehicule" est obligatoire (${ALLOWED_VEHICLE_TYPES.join(', ')}).`);
  } else {
    const normalizedType = body.type_vehicule.trim().toLowerCase();
    if (!ALLOWED_VEHICLE_TYPES.includes(normalizedType)) {
      errors.push(`Le type de véhicule "${body.type_vehicule}" est invalide. Valeurs autorisées : ${ALLOWED_VEHICLE_TYPES.join(', ')}.`);
    }
  }

  // 4. Validation de l'immatriculation (2 lettres, 3 chiffres, 2 lettres)
  if (!body.immatriculation || typeof body.immatriculation !== 'string') {
    errors.push('Le champ "immatriculation" est obligatoire.');
  } else {
    const cleanImmat = body.immatriculation.replace(/[\s-]/g, '').trim();
    if (!IMMATRICULATION_REGEX.test(cleanImmat)) {
      errors.push('Format d\'immatriculation invalide. Format attendu : 2 lettres, 3 chiffres, 2 lettres (ex: AB123CD ou AB-123-CD).');
    }
  }

  // 5. Validation du type de carburant
  if (!body.type_carburant || typeof body.type_carburant !== 'string') {
    errors.push(`Le champ "type_carburant" est obligatoire (${ALLOWED_FUEL_TYPES.join(', ')}).`);
  } else {
    const normalizedFuel = body.type_carburant.trim().toLowerCase();
    if (!ALLOWED_FUEL_TYPES.includes(normalizedFuel)) {
      errors.push(`Le type de carburant "${body.type_carburant}" est invalide. Valeurs autorisées : ${ALLOWED_FUEL_TYPES.join(', ')}.`);
    }
  }

  // 6. Validation de la date de mise en service
  if (!body.date_mise_en_service) {
    errors.push('Le champ "date_mise_en_service" est obligatoire.');
  } else {
    const parsedDate = new Date(body.date_mise_en_service);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Le champ "date_mise_en_service" doit être une date valide (ex: 2023-01-15).');
    } else if (parsedDate > new Date()) {
      errors.push('La date de mise en service ne peut pas être dans le futur.');
    }
  }

  // 7. Validation du kilométrage
  if (body.kilometrage === undefined || body.kilometrage === null || body.kilometrage === '') {
    errors.push('Le champ "kilometrage" est obligatoire.');
  } else {
    const km = Number(body.kilometrage);
    if (isNaN(km) || km < 0) {
      errors.push('Le champ "kilometrage" doit être un nombre positif ou nul.');
    }
  }

  // 8. Validation de la consommation
  if (body.consommation === undefined || body.consommation === null || body.consommation === '') {
    errors.push('Le champ "consommation" est obligatoire.');
  } else {
    const conso = Number(body.consommation);
    if (isNaN(conso) || conso < 0) {
      errors.push('Le champ "consommation" doit être un nombre positif ou nul.');
    }
  }

  // Si des erreurs sont détectées, on renvoie une 400 Bad Request
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données fournies.',
      errors
    });
  }

  // Normalisation des données pour les couches suivantes (controller / model)
  req.body.marque = body.marque.trim();
  req.body.modele = body.modele.trim();
  req.body.type_vehicule = body.type_vehicule.trim().toLowerCase();
  req.body.immatriculation = body.immatriculation.replace(/[\s-]/g, '').trim().toUpperCase();
  req.body.type_carburant = body.type_carburant.trim().toLowerCase();
  req.body.date_mise_en_service = new Date(body.date_mise_en_service);
  req.body.kilometrage = Number(body.kilometrage);
  req.body.consommation = Number(body.consommation);

  next();
}

module.exports = validateCar;
