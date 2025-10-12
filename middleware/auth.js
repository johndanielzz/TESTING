const jwt = require('jsonwebtoken');

module.exports = function(requiredRole) {
  // requiredRole is optional: 'admin' etc.
  return function(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // contains id and role
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden - insufficient rights' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalid' });
    }
  };
};
