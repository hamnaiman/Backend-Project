const User = require('../models/User');

// Verify User Authentication
const verifyUser = async (req, res, next) => {
  try {
    const { userId, userEmail } = req.body;
    
    if (!userId && !userEmail) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    
    let user;
    
    // Find user by ID or Email
    if (userId) {
      user = await User.findById(userId);
    } else if (userEmail) {
      user = await User.findOne({ email: userEmail });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is approved and active
    if (user.status !== 'approved') {
      return res.status(403).json({ 
        message: `Account status: ${user.status}. Contact admin for assistance.` 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    console.error('❌ User authentication error:', error);
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// Check User Status
const checkUserStatus = (allowedStatuses = ['approved']) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User authentication required' });
      }
      
      if (!allowedStatuses.includes(req.user.status)) {
        return res.status(403).json({ 
          message: `Access denied. Current status: ${req.user.status}` 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('❌ Status check error:', error);
      res.status(500).json({ message: 'Status verification error', error: error.message });
    }
  };
};

// Only Approved Users
const approvedUsersOnly = checkUserStatus(['approved']);

module.exports = {
  verifyUser,
  checkUserStatus,
  approvedUsersOnly
};