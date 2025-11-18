// backend/middleware/roleMiddleware.js

const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
      // Convert single role to array for consistency
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!roles.includes(req.user.role)) {
          return res.status(403).json({ msg: 'Access denied: insufficient permissions.' });
      }
      next();
  };
};

module.exports = roleMiddleware;
