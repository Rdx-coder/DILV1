const express = require('express');
const router = express.Router();
const {
  getSubmissions,
  getSubmission,
  updateStatus,
  replyToSubmission,
  deleteSubmission,
  getStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/submissions', getSubmissions);
router.get('/submissions/:id', getSubmission);
router.put('/submissions/:id/status', updateStatus);
router.post('/submissions/:id/reply', replyToSubmission);
router.delete('/submissions/:id', deleteSubmission);
router.get('/stats', getStats);

module.exports = router;