const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitContact, submitApplication, subscribeNewsletter } = require('../controllers/submissionController');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const submissionLimiter = rateLimit({
	windowMs: parseInt(process.env.PUBLIC_FORM_WINDOW_MS || String(15 * 60 * 1000), 10),
	max: parseInt(process.env.PUBLIC_FORM_MAX_REQUESTS || '8', 10),
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: 'Too many submissions. Please try again later.'
	}
});

// Contact form validation
const contactValidation = [
	body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 80 }).escape(),
	body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
	body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 180 }).escape(),
	body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 5, max: 5000 }).escape(),
	body('interest').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).escape()
];

// Application form validation
const applicationValidation = [
	body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 80 }).escape(),
	body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
	body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }).escape(),
	body('program').trim().notEmpty().withMessage('Program is required').isLength({ min: 2, max: 120 }).escape(),
	body('message').optional({ checkFalsy: true }).trim().isLength({ max: 5000 }).escape()
];

// Newsletter subscription validation
const newsletterValidation = [
	body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
	body('name').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).escape()
];

router.post('/contact', submissionLimiter, contactValidation, validateRequest, submitContact);
router.post('/application', submissionLimiter, applicationValidation, validateRequest, submitApplication);
router.post('/newsletter', submissionLimiter, newsletterValidation, validateRequest, subscribeNewsletter);

module.exports = router;