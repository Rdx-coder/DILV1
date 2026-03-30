const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  getTeamMember,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  reorderTeamMembers
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { uploadTeam } = require('../middleware/upload');

// Admin routes
router.get('/admin/all', protect, getAllTeamMembers);
router.post('/admin/create', protect, uploadTeam.single('image'), createTeamMember);
router.put('/admin/:id/update', protect, uploadTeam.single('image'), updateTeamMember);
router.delete('/admin/:id/delete', protect, deleteTeamMember);
router.post('/admin/reorder', protect, reorderTeamMembers);

// Public routes
router.get('/', getTeamMembers);
router.get('/:id', getTeamMember);

module.exports = router;
