const express = require('express');
const router = express.Router();
const { getSponsors } = require('../controllers/sponsorController');

router.get('/', getSponsors);

module.exports = router;
