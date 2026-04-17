const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 140
  },
  logo: {
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
  websiteUrl: {
    type: String,
    required: true,
    trim: true
  },
  tier: {
    type: String,
    enum: ['Gold', 'Silver', 'Partner'],
    default: 'Partner'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

sponsorSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Sponsor', sponsorSchema);
