const Submission = require('../models/Submission');
const emailService = require('../utils/emailService');

// @desc    Get all submissions with filters
// @route   GET /api/admin/submissions
// @access  Private
exports.getSubmissions = async (req, res) => {
  try {
    const { 
      status, 
      formType, 
      search, 
      startDate, 
      endDate,
      page = 1,
      limit = 20,
      sortBy = '-createdAt'
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by form type
    if (formType) {
      query.formType = formType;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const submissions = await Submission.find(query)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single submission
// @route   GET /api/admin/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update submission status
// @route   PUT /api/admin/submissions/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'in_progress', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reply to submission
// @route   POST /api/admin/submissions/:id/reply
// @access  Private
exports.replyToSubmission = async (req, res) => {
  try {
    const { message, subject } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Send email reply
    const emailResult = await emailService.sendReply({
      to: submission.email,
      subject: subject || `Re: ${submission.subject || 'Your inquiry'}`,
      message,
      originalSubmission: submission
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: emailResult.message || 'Failed to send email. Please check email configuration.'
      });
    }

    // Add reply to submission
    submission.replies.push({
      message,
      sentBy: req.admin.email,
      sentAt: new Date()
    });

    // Update status to replied
    submission.status = 'replied';
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      submission
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/admin/submissions/:id
// @access  Private
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    await submission.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Use aggregation pipeline for efficient stats calculation
    const statsResult = await Submission.aggregate([
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byFormType: [
            { $group: { _id: '$formType', count: { $sum: 1 } } }
          ],
          recentCount: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Parse aggregation results
    const result = statsResult[0];
    const totalSubmissions = result.totalCount[0]?.count || 0;
    const recentSubmissions = result.recentCount[0]?.count || 0;

    // Parse status counts
    const statusMap = {};
    result.byStatus.forEach(item => {
      statusMap[item._id] = item.count;
    });

    // Parse form type counts
    const formTypeMap = {};
    result.byFormType.forEach(item => {
      formTypeMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalSubmissions,
        byStatus: {
          new: statusMap['new'] || 0,
          inProgress: statusMap['in_progress'] || 0,
          replied: statusMap['replied'] || 0,
          closed: statusMap['closed'] || 0
        },
        byFormType: {
          contact: formTypeMap['contact'] || 0,
          application: formTypeMap['application'] || 0,
          mentorship: formTypeMap['mentorship'] || 0,
          newsletter: formTypeMap['newsletter'] || 0
        },
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
