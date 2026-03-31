const mongoose = require('mongoose');

const seoPingLogSchema = new mongoose.Schema({
  sitemapUrl: {
    type: String,
    required: true,
    trim: true
  },
  triggerType: {
    type: String,
    enum: ['manual', 'auto'],
    default: 'manual',
    index: true
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 120,
    default: ''
  },
  success: {
    type: Boolean,
    default: false,
    index: true
  },
  successCount: {
    type: Number,
    default: 0
  },
  totalTargets: {
    type: Number,
    default: 1
  },
  retryStatus: {
    type: String,
    enum: ['none', 'queued', 'completed', 'exhausted'],
    default: 'none',
    index: true
  },
  attemptCount: {
    type: Number,
    default: 1
  },
  maxRetries: {
    type: Number,
    default: 4
  },
  nextRetryAt: {
    type: Date,
    default: null,
    index: true
  },
  lastError: {
    type: String,
    default: ''
  },
  results: {
    type: [
      {
        url: String,
        statusCode: Number,
        ok: Boolean,
        error: String,
        body: String
      }
    ],
    default: []
  },
  attemptHistory: {
    type: [
      {
        attemptNumber: Number,
        at: Date,
        successCount: Number,
        retryStatus: String,
        results: {
          type: [
            {
              url: String,
              statusCode: Number,
              ok: Boolean,
              error: String
            }
          ],
          default: []
        }
      }
    ],
    default: []
  }
}, {
  timestamps: true
});

seoPingLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SeoPingLog', seoPingLogSchema);
