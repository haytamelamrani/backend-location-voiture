const Vehicule = require('../models/Car');

/**
 * @desc    Ajouter un nouveau véhicule
 * @route   POST /api/v1/cars
 * @access  Admin
 */
exports.createCar = async (req, res, next) => {
  try {
    const {
      marque,
      modele,
      type_vehicule,
      immatriculation,
      type_carburant,
      date_mise_en_service,
      kilometrage,
      consommation
    } = req.body;

    // Vérifier l'unicité de l'immatriculation
    const existingVehicle = await Vehicule.findOne({ immatriculation });
    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: `Un véhicule avec l'immatriculation "${immatriculation}" existe déjà.`
      });
    }

    // Création du véhicule en base
    const vehicle = await Vehicule.create({
      marque,
      modele,
      type_vehicule,
      immatriculation,
      type_carburant,
      date_mise_en_service,
      kilometrage,
      consommation
    });

    return res.status(201).json({
      success: true,
      message: 'Véhicule ajouté avec succès.',
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir la liste de tous les véhicules
 * @route   GET /api/v1/cars
 * @access  Public
 */
exports.getCars = async (req, res, next) => {
  try {
    const vehicles = await Vehicule.find().sort({ date_insertion: -1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtenir les détails d'un véhicule par ID
 * @route   GET /api/v1/cars/:id
 * @access  Public
 */
exports.getCarById = async (req, res, next) => {
  try {
    const vehicle = await Vehicule.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé.'
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};
