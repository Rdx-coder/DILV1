const Blog = require('../models/Blog');
const { pingSitemapByBaseUrl } = require('./seoController');

function stripHtml(html = '') {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function getReadingTime(content = '') {
  const words = stripHtml(content).split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function serializeBlog(blogDoc) {
  const blog = blogDoc.toObject ? blogDoc.toObject() : blogDoc;
  return {
    ...blog,
    readingTime: getReadingTime(blog.content)
  };
}

function normalizeTags(input) {
  if (Array.isArray(input)) {
    return input;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function buildBlogPayload(req) {
  const payload = {
    ...req.body
  };

  if (req.file) {
    payload.coverImage = `${req.protocol}://${req.get('host')}/uploads/blog/${req.file.filename}`;
  } else if (req.body.coverImageUrl) {
    payload.coverImage = req.body.coverImageUrl;
  }

  payload.tags = normalizeTags(req.body.tags);
  payload.coverImageAlt = (req.body.coverImageAlt || '').trim();
  delete payload.coverImageUrl;

  return payload;
}

function triggerSitemapPing(req, reason) {
  const frontendBase = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

  // Fire and forget to keep publish API fast and resilient.
  void pingSitemapByBaseUrl(frontendBase, {
    triggerType: 'auto',
    reason
  })
    .then((result) => {
      console.log(`[SEO_PING] ${reason}:`, {
        sitemapUrl: result.sitemapUrl,
        success: result.success,
        successCount: result.successCount
      });
    })
    .catch((error) => {
      console.error(`[SEO_PING] ${reason} failed:`, error.message || error);
    });
}

// @desc    Upload blog cover image
// @route   POST /api/admin/blog/upload
// @access  Private
exports.uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/blog/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Upload blog image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
};

// @desc    Create blog
// @route   POST /api/admin/blog
// @access  Private
exports.createBlog = async (req, res) => {
  try {
    const payload = buildBlogPayload(req);
    payload.author = payload.author || req.admin?.name || 'Admin';

    const blog = await Blog.create(payload);

    if (blog.status === 'published') {
      triggerSitemapPing(req, 'blog_create_published');
    }

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: serializeBlog(blog)
    });
  } catch (error) {
    console.error('Create blog error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A blog with the same slug already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((item) => ({
          field: item.path,
          message: item.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating blog'
    });
  }
};

// @desc    Update blog
// @route   PUT /api/admin/blog/:id
// @access  Private
exports.updateBlog = async (req, res) => {
  try {
    const existing = await Blog.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const previousStatus = existing.status;
    const payload = buildBlogPayload(req);
    Object.assign(existing, payload);
    await existing.save();

    if (existing.status === 'published' && (previousStatus !== 'published' || Object.keys(payload).length > 0)) {
      triggerSitemapPing(req, previousStatus === 'published' ? 'blog_update_published' : 'blog_status_promoted_to_published');
    }

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog: serializeBlog(existing)
    });
  } catch (error) {
    console.error('Update blog error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A blog with the same slug already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((item) => ({
          field: item.path,
          message: item.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating blog'
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/admin/blog/:id
// @access  Private
exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting blog'
    });
  }
};

// @desc    Get all blogs (admin)
// @route   GET /api/admin/blogs
// @access  Private
exports.getAdminBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      tag
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (tag) query.tags = { $in: [String(tag).toLowerCase()] };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Blog.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      blogs: blogs.map(serializeBlog)
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching blogs'
    });
  }
};

// @desc    Get blog by id (admin)
// @route   GET /api/admin/blog/:id
// @access  Private
exports.getAdminBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    return res.status(200).json({
      success: true,
      blog: serializeBlog(blog)
    });
  } catch (error) {
    console.error('Get admin blog by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching blog'
    });
  }
};

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
exports.getPublishedBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      category,
      tag
    } = req.query;

    const query = { status: 'published' };

    if (category) query.category = { $regex: category, $options: 'i' };
    if (tag) query.tags = { $in: [String(tag).toLowerCase()] };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [blogs, total, categories] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Blog.countDocuments(query),
      Blog.distinct('category', { status: 'published' })
    ]);

    return res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      categories,
      blogs: blogs.map(serializeBlog)
    });
  } catch (error) {
    console.error('Get published blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching blogs'
    });
  }
};

// @desc    Get single blog by slug
// @route   GET /api/blog/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const relatedPosts = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title slug excerpt coverImage category createdAt author tags');

    return res.status(200).json({
      success: true,
      blog: serializeBlog(blog),
      relatedPosts: relatedPosts.map(serializeBlog)
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching blog details'
    });
  }
};
