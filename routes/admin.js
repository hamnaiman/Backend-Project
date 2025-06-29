const express = require('express');
const {
  adminLogin,
  createAdmin,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser,
  getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

// POST /api/admin/login
router.post('/login', adminLogin);

// POST /api/admin/create
router.post('/create', createAdmin);

// GET /api/admin/users/pending
router.get('/users/pending', getPendingUsers);

// GET /api/admin/users
router.get('/users', getAllUsers);

// PATCH /api/admin/users/:id/approve
router.patch('/users/:id/approve', approveUser);

// PATCH /api/admin/users/:id/reject
router.patch('/users/:id/reject', rejectUser);

// PUT /api/admin/users/:id
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

module.exports = router;