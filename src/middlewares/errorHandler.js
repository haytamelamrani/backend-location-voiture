/**
 * Middleware centralisé pour la gestion des erreurs Express
 */
function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Erreur interne du serveur';
  let errors = undefined;

  // Erreur Mongoose : Violation de contrainte d'unicité (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `Un enregistrement avec cette valeur pour "${duplicatedField}" existe déjà.`;
  }

  // Erreur Mongoose : Validation échouée
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Erreur de validation des données.';
    errors = Object.values(err.errors).map(val => val.message);
  }

  // Erreur Mongoose : Identifiant (ObjectId) malformé
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Format d'identifiant invalide pour la ressource "${err.path}".`;
  }

  // Erreur syntaxique dans le JSON reçu
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Format JSON invalide dans le corps de la requête.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
