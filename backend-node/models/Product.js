const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 240
  },
  fullDescription: {
    type: String,
    default: '',
    trim: true,
    maxlength: 6000
  },
  image: {
    url: {
      type: String,
      default: ''
    },
    publicId: {
      type: String,
      default: ''
    },
    altText: {
      type: String,
      default: ''
    }
  },
  projectUrl: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
