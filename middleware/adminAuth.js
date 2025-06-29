const Admin = require('../models/Admin');

// Verify Admin Authentication
const verifyAdmin = async (req, res, next) => {
  try {
    const { adminId, adminUsername } = req.body;
    
    if (!adminId && !adminUsername) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }
    
    // If adminId is provided, verify by ID
    if (adminId) {
      const admin = await Admin.findById(adminId);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      req.admin = admin;
    }
    
    // If only username is provided, verify by username
    if (adminUsername && !adminId) {
      const admin = await Admin.findOne({ username: adminUsername, isActive: true });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      req.admin = admin;
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// Check Admin Role
const checkAdminRole = (allowedRoles = ['admin', 'super_admin', 'moderator']) => {
  return (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: 'Admin authentication required' });
      }
      
      if (!allowedRoles.includes(req.admin.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Role check error:', error);
      res.status(500).json({ message: 'Role verification error', error: error.message });
    }
  };
};

// Super Admin Only
const superAdminOnly = checkAdminRole(['super_admin']);

// Admin and Super Admin
const adminOnly = checkAdminRole(['admin', 'super_admin']);

// All Admin Roles
const anyAdmin = checkAdminRole(['admin', 'super_admin', 'moderator']);

module.exports = {
  verifyAdmin,
  checkAdminRole,
  superAdminOnly,
  adminOnly,
  anyAdmin
};