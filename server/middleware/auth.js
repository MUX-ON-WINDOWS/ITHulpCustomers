const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jouw-geheime-sleutel-wijzig-dit';

// Middleware om te verifiëren of gebruiker is ingelogd
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Toegang geweigerd. Geen token opgegeven.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Ongeldige of verlopen token.' });
    }
    req.user = user;
    next();
  });
};

// Middleware om te controleren of gebruiker admin is
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Toegang geweigerd. Admin rechten vereist.' });
  }
  next();
};

// Middleware om te controleren of gebruiker admin of eigenaar is
const requireAdminOrOwner = (req, res, next) => {
  if (req.user.rol === 'admin') {
    return next();
  }
  // Voor niet-admin: controleer of gebruiker eigenaar is van de resource
  // Dit wordt per endpoint geïmplementeerd
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOwner,
  JWT_SECRET
};
