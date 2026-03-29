const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true,
    enum: ['contact', 'application', 'mentorship', 'newsletter']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  interest: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'replied', 'closed'],
    default: 'new'
  },
  replies: [{
    message: String,
    sentBy: String,
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Map,
    of: String
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for better query performance
submissionSchema.index({ email: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ formType: 1 });
submissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
