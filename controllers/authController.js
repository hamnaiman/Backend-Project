const User = require('../models/User');

// Register User
const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create user with pending status
    const newUser = new User({
      ...userData,
      status: 'pending'
    });
    
    await newUser.save();
    
    console.log('✅ User registered (pending approval):', newUser.email);
    res.status(201).json({ 
      message: 'Registration successful. Please wait for admin approval.', 
      user: newUser 
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check approval status
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval. Please wait.' });
    }
    
    if (user.status === 'rejected') {
      return res.status(403).json({ 
        message: `Your account was rejected. Reason: ${user.rejectionReason || 'No reason provided'}` 
      });
    }
    
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact admin.' });
    }
    
    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Your account is not approved for login.' });
    }
    
    console.log('✅ User login successful:', user.email);
    res.status(200).json({ message: 'Login successful', user });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser
};