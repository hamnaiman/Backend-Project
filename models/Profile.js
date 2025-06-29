const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  email: String,
  about: { type: String, default: 'Lorem ipsum dolor sit amet consectetur.' },
  services: { type: Array, default: [] },
  contact: { type: Object, default: {} },
  profilePicture: String,
  images: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);