const express = require('express');
const fs = require('fs');
const router = express.Router();
const sizeOf = require('image-size');
const {
  getSubmissions,
  getSubmission,
  updateStatus,
  replyToSubmission,
  deleteSubmission,
  getStats
} = require('../controllers/adminController');
const { pingSitemap, getSitemapPingHistory, retryFailedSitemapPings } = require('../controllers/seoController');
const {
  uploadBlogImage,
  createBlog,
  updateBlog,
  deleteBlog,
  getAdminBlogs,
  getAdminBlogById
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateRequest = require('../middleware/validateRequest');
const { body, param } = require('express-validator');

const handleBlogFileUpload = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  upload.single('coverImageFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed'
      });
    }

    if (req.file) {
      try {
        const dimensions = sizeOf(req.file.path);
        const width = dimensions?.width || 0;
        const height = dimensions?.height || 0;

        // Enforce minimum Open Graph-friendly dimensions for cover images.
        if (width < 1200 || height < 630) {
          fs.unlink(req.file.path, () => {});
          return res.status(400).json({
            success: false,
            message: 'Cover image must be at least 1200x630 pixels for SEO/social previews'
          });
        }
      } catch (_error) {
        if (req.file?.path) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(400).json({
          success: false,
          message: 'Invalid image file. Please upload a valid image.'
        });
      }
    }

    return next();
  });
};

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 180 }),
  body('slug').optional({ checkFalsy: true }).trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-friendly (lowercase letters, numbers and hyphens)'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('excerpt').optional({ checkFalsy: true }).trim().isLength({ max: 320 }),
  body('coverImage').optional({ checkFalsy: true }).trim().isURL().withMessage('Cover image must be a valid URL'),
  body('coverImageUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Cover image URL must be a valid URL'),
  body('coverImageAlt').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 180 }).withMessage('Cover image alt text must be between 3 and 180 characters'),
  body('tags').optional().custom((value) => Array.isArray(value) || typeof value === 'string').withMessage('Tags must be an array or comma-separated string'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ max: 80 }),
  body('author').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  body('seoTitle').optional({ checkFalsy: true }).trim().isLength({ max: 180 }),
  body('seoDescription').optional({ checkFalsy: true }).trim().isLength({ max: 320 }),
  body().custom((value, { req }) => {
    const status = (req.body.status || '').toLowerCase();
    const hasCoverImage = Boolean(req.file || req.body.coverImage || req.body.coverImageUrl);
    const altText = String(req.body.coverImageAlt || '').trim();

    if (status === 'published' && hasCoverImage && !altText) {
      throw new Error('Cover image alt text is required when publishing with a cover image');
    }

    return true;
  })
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid blog id')
];

// All routes are protected
router.use(protect);

router.get('/submissions', getSubmissions);
router.get('/submissions/:id', getSubmission);
router.put('/submissions/:id/status', updateStatus);
router.post('/submissions/:id/reply', replyToSubmission);
router.delete('/submissions/:id', deleteSubmission);
router.get('/stats', getStats);
router.post('/seo/ping-sitemap', pingSitemap);
router.get('/seo/ping-history', getSitemapPingHistory);
router.post('/seo/retry-failed', retryFailedSitemapPings);

router.post('/blog/upload', upload.single('image'), uploadBlogImage);
router.post('/blog', handleBlogFileUpload, blogValidation, validateRequest, createBlog);
router.put('/blog/:id', handleBlogFileUpload, idValidation, blogValidation, validateRequest, updateBlog);
router.delete('/blog/:id', idValidation, validateRequest, deleteBlog);
router.get('/blogs', getAdminBlogs);
router.get('/blog/:id', idValidation, validateRequest, getAdminBlogById);

module.exports = router;