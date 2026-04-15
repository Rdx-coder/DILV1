const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const {
  getPublicEvents,
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 180 }),
  body('type').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid date/time'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('End date must be a valid date/time'),
  body('date').optional({ checkFalsy: true }).isISO8601().withMessage('Date must be a valid date'),
  body('details').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('location').optional({ checkFalsy: true }).trim().isLength({ max: 180 }),
  body('ctaUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('CTA URL must be a valid URL'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer'),
  body('isActive').optional().isBoolean().withMessage('Active flag must be true or false')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid event id')
];

router.get('/events', getPublicEvents);
router.get('/events/:id', idValidation, validateRequest, getEventById);

router.use('/events/admin', protect);
router.get('/events/admin/all', getAllEvents);
router.post('/events/admin/create', eventValidation, validateRequest, createEvent);
router.put('/events/admin/:id/update', idValidation, eventValidation, validateRequest, updateEvent);
router.delete('/events/admin/:id/delete', idValidation, validateRequest, deleteEvent);

module.exports = router;
