const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [180, 'Title cannot exceed 180 characters']
  },
  type: {
    type: String,
    trim: true,
    maxlength: [80, 'Event type cannot exceed 80 characters'],
    default: 'Event'
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date']
  },
  details: {
    type: String,
    trim: true,
    maxlength: [1000, 'Details cannot exceed 1000 characters'],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    maxlength: [180, 'Location cannot exceed 180 characters'],
    default: ''
  },
  ctaUrl: {
    type: String,
    trim: true,
    default: ''
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

EventSchema.index({ isActive: 1, order: 1, date: 1 });

EventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

EventSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    _id: obj._id,
    title: obj.title,
    type: obj.type || 'Event',
    date: obj.date,
    details: obj.details,
    location: obj.location,
    ctaUrl: obj.ctaUrl,
    order: obj.order,
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

module.exports = mongoose.model('Event', EventSchema);
