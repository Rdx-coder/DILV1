const Event = require('../models/Event');

const parseBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return defaultValue;
};

const parseOrder = (value, defaultValue = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const buildEventPayload = (body) => {
  const fallbackDate = body.date ? new Date(body.date) : null;
  const startDate = body.startDate ? new Date(body.startDate) : fallbackDate;
  const endDate = body.endDate ? new Date(body.endDate) : null;
  return {
    title: String(body.title || '').trim(),
    type: String(body.type || 'Event').trim(),
    startDate: startDate instanceof Date && !Number.isNaN(startDate.getTime()) ? startDate : null,
    endDate: endDate instanceof Date && !Number.isNaN(endDate.getTime()) ? endDate : null,
    details: String(body.details || '').trim(),
    location: String(body.location || '').trim(),
    ctaUrl: String(body.ctaUrl || '').trim(),
    order: parseOrder(body.order, 0),
    isActive: parseBoolean(body.isActive, true)
  };
};

const mapEventForResponse = (eventDoc) => {
  const event = eventDoc.toJSON();
  return {
    ...event,
    startDate: event.startDate ? new Date(event.startDate).toISOString() : null,
    endDate: event.endDate ? new Date(event.endDate).toISOString() : null
  };
};

exports.getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .sort({ order: 1, startDate: 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events.map(mapEventForResponse)
    });
  } catch (error) {
    console.error('getPublicEvents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming events', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('-__v');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: mapEventForResponse(event) });
  } catch (error) {
    console.error('getEventById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event', error: error.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ order: 1, startDate: 1, createdAt: -1 }).select('-__v');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events.map(mapEventForResponse)
    });
  } catch (error) {
    console.error('getAllEvents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const payload = buildEventPayload(req.body);

    if (!payload.title || !payload.startDate) {
      return res.status(400).json({ success: false, message: 'Title and start date are required' });
    }

    const event = await Event.create(payload);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: mapEventForResponse(event)
    });
  } catch (error) {
    console.error('createEvent error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = buildEventPayload(req.body);

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.title = payload.title || event.title;
    event.type = payload.type || event.type;
    event.startDate = payload.startDate || event.startDate;
    event.endDate = payload.endDate || event.endDate;
    event.details = payload.details;
    event.location = payload.location;
    event.ctaUrl = payload.ctaUrl;
    event.order = payload.order;
    event.isActive = payload.isActive;

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: mapEventForResponse(event)
    });
  } catch (error) {
    console.error('updateEvent error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Event.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('deleteEvent error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};
