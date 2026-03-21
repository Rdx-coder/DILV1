const Submission = require('../models/Submission');
const emailService = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, interest } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    const submission = await Submission.create({
      formType: 'contact',
      name,
      email,
      subject,
      message,
      interest,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send auto-reply email
    await emailService.sendWelcomeEmail(email, name);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      submission: {
        id: submission._id,
        name: submission.name,
        email: submission.email
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Submit application form
// @route   POST /api/application
// @access  Public
exports.submitApplication = async (req, res) => {
  try {
    const { name, email, phone, program, message } = req.body;

    if (!name || !email || !program) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and program'
      });
    }

    const submission = await Submission.create({
      formType: 'application',
      name,
      email,
      phone,
      subject: `Application for ${program}`,
      message,
      metadata: { program },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await emailService.sendWelcomeEmail(email, name);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      submission: {
        id: submission._id,
        name: submission.name,
        email: submission.email
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Check if already subscribed
    const existing = await Submission.findOne({
      formType: 'newsletter',
      email: email.toLowerCase()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    }

    const submission = await Submission.create({
      formType: 'newsletter',
      name: name || 'Subscriber',
      email,
      subject: 'Newsletter Subscription',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      submission: {
        id: submission._id,
        email: submission.email
      }
    });
  } catch (error) {
    console.error('Subscribe newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
