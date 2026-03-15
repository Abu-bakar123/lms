// Role-Based Access Control Middleware

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is the owner or admin
const checkOwnershipOrAdmin = (model, ownerField = 'instructor') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Admin can do anything
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check if user is the owner
      const ownerId = resource[ownerField]?.toString();
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          message: 'Not authorized to perform this action'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware for instructor or admin
const isInstructorOrAdmin = (req, res, next) => {
  if (!['admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Only instructors and admins can perform this action'
    });
  }
  next();
};

// Middleware for admin only
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Only admins can perform this action'
    });
  }
  next();
};

module.exports = {
  authorize,
  checkOwnershipOrAdmin,
  isInstructorOrAdmin,
  isAdmin
};
