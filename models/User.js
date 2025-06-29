const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  category: String,
  location: String,
  work: String,
  years: String,
  profileType: { type: String, default: 'individual' },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  // Admin approval system
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'suspended'], 
    default: 'pending' 
  },
  approvedBy: String,
  approvedAt: Date,
  rejectionReason: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);