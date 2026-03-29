const express = require('express');
const router = express.Router();
const { submitContact, submitApplication, subscribeNewsletter } = require('../controllers/submissionController');

router.post('/contact', submitContact);
router.post('/application', submitApplication);
router.post('/newsletter', subscribeNewsletter);

module.exports = router;