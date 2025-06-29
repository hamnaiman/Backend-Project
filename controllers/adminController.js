const Admin = require('../models/Admin');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    console.log('🔐 Admin login request:', req.body.username);
    
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ 
      $or: [{ username }, { email: username }],
      password,
      isActive: true 
    });
    
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    console.log('✅ Admin login successful:', admin.username);
    res.status(200).json({ 
      message: 'Admin login successful', 
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });
    
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Error during admin login', error: error.message });
  }
};

// Create Admin
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ username }, { email }]
    });
    
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const newAdmin = new Admin({
      username,
      email,
      password,
      fullName,
      role: 'admin'
    });
    
    await newAdmin.save();
    
    console.log('✅ Admin created successfully:', username);
    res.status(201).json({ message: 'Admin created successfully' });
    
  } catch (error) {
    console.error('❌ Admin creation error:', error);
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};

// Get Pending Users
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    console.log(`📋 Found ${pendingUsers.length} pending users`);
    res.status(200).json({ users: pendingUsers });
    
  } catch (error) {
    console.error('❌ Error fetching pending users:', error);
    res.status(500).json({ message: 'Error fetching pending users', error: error.message });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    console.log(`📋 Found ${users.length}/${total} users`);
    res.status(200).json({ 
      users, 
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: users.length,
        totalUsers: total
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Approve User
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminUsername } = req.body;
    
    console.log(`🔄 Approving user ${id} by ${adminUsername}`);
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status === 'approved') {
      return res.status(400).json({ message: 'User is already approved' });
    }
    
    user.status = 'approved';
    user.approvedBy = adminUsername;
    user.approvedAt = new Date();
    await user.save();
    
    console.log(`✅ User approved successfully: ${user.email} by ${adminUsername}`);
    res.status(200).json({ 
      message: 'User approved successfully', 
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        approvedBy: user.approvedBy,
        approvedAt: user.approvedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error approving user:', error);
    res.status(500).json({ message: 'Error approving user', error: error.message });
  }
};

// Reject User
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUsername, reason } = req.body;
    
    console.log(`🔄 Rejecting user ${id} by ${adminUsername} - Reason: ${reason}`);
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status === 'rejected') {
      return res.status(400).json({ message: 'User is already rejected' });
    }
    
    user.status = 'rejected';
    user.approvedBy = adminUsername;
    user.approvedAt = new Date();
    user.rejectionReason = reason || 'No reason provided';
    await user.save();
    
    console.log(`❌ User rejected successfully: ${user.email} by ${adminUsername}`);
    res.status(200).json({ 
      message: 'User rejected successfully', 
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        approvedBy: user.approvedBy,
        approvedAt: user.approvedAt,
        rejectionReason: user.rejectionReason
      }
    });
    
  } catch (error) {
    console.error('❌ Error rejecting user:', error);
    res.status(500).json({ message: 'Error rejecting user', error: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields
    delete updateData._id;
    delete updateData.createdAt;
    
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`✅ User updated: ${user.email}`);
    res.status(200).json({ message: 'User updated successfully', user });
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user and profile
    await User.findByIdAndDelete(id);
    await Profile.findOneAndDelete({ email: user.email });
    
    console.log(`🗑️ User deleted permanently: ${user.email}`);
    res.status(200).json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: 'approved' }),
      User.countDocuments({ status: 'rejected' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5)
    ]);
    
    const [pending, approved, rejected, suspended, total, recentUsers] = stats;
    
    res.status(200).json({
      stats: {
        pending,
        approved,
        rejected,
        suspended,
        total,
        active: approved
      },
      recentUsers
    });
    
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  adminLogin,
  createAdmin,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
  getDashboardStats
};