// middleware/admin.js
module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization') || '';
  // expect admin token: decode by jwt (use auth middleware earlier)
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};
