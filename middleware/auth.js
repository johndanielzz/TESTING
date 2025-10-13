const jwt = require('jsonwebtoken');
module.exports = function(requiredRole) {
  return async function(req, res, next) {
    try {
      const token = req.header('Authorization')?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};
