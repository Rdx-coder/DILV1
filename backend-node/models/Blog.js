const mongoose = require('mongoose');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');

function stripHtml(html = '') {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeRichHtml(html = '') {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr', 'blockquote',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's',
      'a', 'img',
      'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'details', 'summary'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
      details: ['open', 'class', 'data-type'],
      div: ['class', 'data-type'],
      summary: ['class'],
      '*': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
    }
  });
}

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 320
  },
  coverImage: {
    type: String,
    trim: true
  },
  coverImageAlt: {
    type: String,
    trim: true,
    maxlength: 180
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    enum: ['general', 'success-story', 'tutorial', 'announcement'],
    default: 'general',
    required: true,
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: 180
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: 320
  }
}, {
  timestamps: true
});

// Common query patterns: published lists by recency, category/status filtering, and tags.
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ category: 1, status: 1, createdAt: -1 });
blogSchema.index({ tags: 1, status: 1, createdAt: -1 });

blogSchema.pre('validate', async function(next) {
  try {
    if (this.isModified('content')) {
      this.content = sanitizeRichHtml(this.content || '');
    }

    if (this.isModified('excerpt')) {
      this.excerpt = stripHtml(this.excerpt || '').slice(0, 320);
    }

    if (this.isModified('seoTitle')) {
      this.seoTitle = stripHtml(this.seoTitle || '').slice(0, 180);
    }

    if (this.isModified('seoDescription')) {
      this.seoDescription = stripHtml(this.seoDescription || '').slice(0, 320);
    }

    if (this.isModified('coverImageAlt')) {
      this.coverImageAlt = stripHtml(this.coverImageAlt || '').slice(0, 180);
    }

    if (this.isModified('title') || this.isModified('slug') || !this.slug) {
      const slugSource = this.slug ? String(this.slug) : String(this.title || `blog-${Date.now()}`);

      const baseSlug = slugify(slugSource, {
        lower: true,
        strict: true,
        trim: true
      });

      let candidate = baseSlug || `blog-${Date.now()}`;
      let counter = 1;

      while (
        await this.constructor.exists({
          slug: candidate,
          _id: { $ne: this._id }
        })
      ) {
        candidate = `${baseSlug}-${counter}`;
        counter += 1;
      }

      this.slug = candidate;
    }

    if (!this.excerpt) {
      this.excerpt = stripHtml(this.content).slice(0, 220);
    }

    if (!this.seoTitle) {
      this.seoTitle = this.title;
    }

    if (!this.seoDescription) {
      this.seoDescription = (this.excerpt || stripHtml(this.content)).slice(0, 160);
    }

    if (this.coverImage && !this.coverImageAlt) {
      this.coverImageAlt = this.title;
    }

    this.tags = (this.tags || [])
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Blog', blogSchema);
