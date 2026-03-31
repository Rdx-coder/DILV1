const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a team member name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Please provide a role/position'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  image: {
    filename: String,
    url: String,
    altText: {
      type: String,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    }
  },
  social: {
    linkedin: String,
    email: String,
    portfolio: String,
    github: String,
    twitter: String
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Common query patterns: public active members sorted by display order.
TeamMemberSchema.index({ isActive: 1, order: 1 });
TeamMemberSchema.index({ createdAt: -1 });

// Auto-update the updatedAt field
TeamMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Get image URL with fallback
TeamMemberSchema.methods.getImageUrl = function() {
  return this.image?.url || '/images/team-placeholder.jpg';
};

// Get sanitized data for frontend
TeamMemberSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    _id: obj._id,
    name: obj.name,
    role: obj.role,
    bio: obj.bio,
    image: {
      url: obj.image?.url || '/images/team-placeholder.jpg',
      altText: obj.image?.altText || `${obj.name} - ${obj.role}`
    },
    social: obj.social || {},
    order: obj.order,
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
