const express = require('express');
const { 
  getUsers, 
  getLatestUsers, 
  updateUserRating 
} = require('../controllers/userController');

const router = express.Router();

// GET /api/users
router.get('/', getUsers);

// GET /api/users/latest
router.get('/latest', getLatestUsers);

// PUT /api/users/:id/rating
router.put('/:id/rating', updateUserRating);

module.exports = router;