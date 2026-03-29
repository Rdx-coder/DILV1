const express = require('express');
const router = express.Router();
const { getPublishedBlogs, getBlogBySlug } = require('../controllers/blogController');

router.get('/blogs', getPublishedBlogs);
router.get('/blog/:slug', getBlogBySlug);

module.exports = router;
