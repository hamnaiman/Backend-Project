const User = require('../models/User');

// Get All Approved Users
const getUsers = async (req, res) => {
  try {
    const { category, location, search, limit = 50 } = req.query;
    
    let query = { status: 'approved' };
    
    if (category && category !== 'Hydraulik') {
      query.category = new RegExp(category, 'i');
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }
    
    const users = await User.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.status(200).json({ users });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get Latest Users
const getLatestUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.status(200).json({ users });
    
  } catch (error) {
    console.error('❌ Error fetching latest users:', error);
    res.status(500).json({ message: 'Error fetching latest users', error: error.message });
  }
};

// Update User Rating
const updateUserRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update rating logic here
    user.rating = rating;
    user.reviews = (user.reviews || 0) + 1;
    await user.save();
    
    res.status(200).json({ message: 'Rating updated successfully', user });
    
  } catch (error) {
    console.error('❌ Error updating rating:', error);
    res.status(500).json({ message: 'Error updating rating', error: error.message });
  }
};

module.exports = {
  getUsers,
  getLatestUsers,
  updateUserRating
};