const Profile = require('../models/Profile');

// Save Profile
const saveProfile = async (req, res) => {
  try {
    const profileData = req.body;
    
    const existingProfile = await Profile.findOne({ email: profileData.email });
    
    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await Profile.findOneAndUpdate(
        { email: profileData.email },
        profileData,
        { new: true }
      );
      console.log('✅ Profile updated for:', profileData.email);
      res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
    } else {
      // Create new profile
      const newProfile = new Profile(profileData);
      await newProfile.save();
      console.log('✅ Profile created for:', profileData.email);
      res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
    }
    
  } catch (error) {
    console.error('❌ Profile save error:', error);
    res.status(500).json({ message: 'Error saving profile', error: error.message });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const { email } = req.params;
    
    const profile = await Profile.findOne({ email });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.status(200).json({ profile });
    
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

module.exports = {
  saveProfile,
  getProfile
};