const express = require('express');
const { saveProfile, getProfile } = require('../controllers/profileController');

const router = express.Router();

// POST /api/profiles
router.post('/', saveProfile);

// GET /api/profiles/:email
router.get('/:email', getProfile);

module.exports = router;