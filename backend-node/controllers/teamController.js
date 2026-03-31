const TeamMember = require('../models/TeamMember');
const fs = require('fs').promises;
const path = require('path');

const parseSocial = (social) => {
  if (!social) return {};
  if (typeof social === 'object') return social;
  try {
    return JSON.parse(social);
  } catch (_err) {
    return {};
  }
};

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

const isTransactionUnsupportedError = (error) => {
  const message = String(error?.message || '');
  return (
    message.includes('Transaction numbers are only allowed') ||
    message.includes('replica set') ||
    message.includes('standalone')
  );
};

const withOptionalTransaction = async (operation) => {
  const session = await TeamMember.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } catch (error) {
    if (!isTransactionUnsupportedError(error)) {
      throw error;
    }
    // Fallback for standalone MongoDB deployments where transactions are unavailable.
    return operation(null);
  } finally {
    await session.endSession();
  }
};

const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (typeof forwardedProto === 'string' && forwardedProto.length > 0)
    ? forwardedProto.split(',')[0].trim()
    : req.protocol;
  return `${protocol}://${req.get('host')}`;
};

const normalizeImageUrl = (req, rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  const requestBase = getRequestBaseUrl(req);

  if (rawUrl.startsWith('/uploads/')) {
    return `${requestBase}${rawUrl}`;
  }

  if (rawUrl.startsWith('uploads/')) {
    return `${requestBase}/${rawUrl}`;
  }

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.pathname.startsWith('/uploads/')) {
        return `${requestBase}${parsed.pathname}`;
      }
      return rawUrl;
    } catch (_err) {
      return rawUrl;
    }
  }

  return rawUrl;
};

const mapMemberForResponse = (req, memberDoc) => {
  const member = memberDoc.toObject();
  const imageUrl = normalizeImageUrl(req, member.image?.url);

  return {
    ...member,
    image: {
      ...(member.image || {}),
      url: imageUrl || ''
    }
  };
};

// Get all active team members (public)
exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');

    const responseData = teamMembers.map((member) => mapMemberForResponse(req, member));

    res.status(200).json({
      success: true,
      count: responseData.length,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: error.message
    });
  }
};

// Get single team member (public)
exports.getTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: mapMemberForResponse(req, member)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team member',
      error: error.message
    });
  }
};

// Get all team members for admin (including inactive)
exports.getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find()
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');

    const responseData = teamMembers.map((member) => mapMemberForResponse(req, member));

    res.status(200).json({
      success: true,
      count: responseData.length,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: error.message
    });
  }
};

// Create team member
exports.createTeamMember = async (req, res) => {
  try {
    const { name, role, bio, social, order, isActive } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and role'
      });
    }

    let imageData = {};

    // Handle image upload
    if (req.file) {
      const imagePath = `/uploads/team/${req.file.filename}`;
      imageData = {
        filename: req.file.filename,
        url: imagePath,
        altText: name || 'Team member'
      };
    }

    const memberData = {
      name: name.trim(),
      role: role.trim(),
      bio: bio || '',
      image: imageData,
      social: parseSocial(social),
      order: parseOrder(order, 0),
      isActive: parseBoolean(isActive, true)
    };

    const duplicateWindowStart = new Date(Date.now() - 10000);
    const existingDuplicate = await TeamMember.findOne({
      name: memberData.name,
      role: memberData.role,
      createdAt: { $gte: duplicateWindowStart }
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate submission detected. Please wait a moment before trying again.'
      });
    }

    const member = await withOptionalTransaction(async (session) => {
      if (session) {
        const docs = await TeamMember.create([memberData], { session });
        return docs[0];
      }
      return TeamMember.create(memberData);
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: mapMemberForResponse(req, member)
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(path.join(__dirname, '../', req.file.path));
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error creating team member',
      error: error.message
    });
  }
};

// Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, bio, social, order, isActive } = req.body;

    let member = await TeamMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Handle image replacement
    if (req.file) {
      // Delete old image
      if (member.image?.filename) {
        try {
          await fs.unlink(
            path.join(__dirname, '../uploads/team/', member.image.filename)
          );
        } catch (err) {
          console.error('Error deleting old file:', err);
        }
      }
    }

    member = await withOptionalTransaction(async (session) => {
      const doc = session
        ? await TeamMember.findById(id).session(session)
        : await TeamMember.findById(id);

      if (!doc) {
        const notFoundError = new Error('Team member not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (req.file) {
        doc.image = {
          filename: req.file.filename,
          url: `/uploads/team/${req.file.filename}`,
          altText: name || doc.name || 'Team member'
        };
      }

      if (name) doc.name = name;
      if (role) doc.role = role;
      if (bio !== undefined) doc.bio = bio;
      if (social !== undefined) doc.social = parseSocial(social);
      if (order !== undefined) doc.order = parseOrder(order, doc.order);
      if (isActive !== undefined) doc.isActive = parseBoolean(isActive, doc.isActive);

      await doc.save({ session: session || undefined });
      return doc;
    });

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: mapMemberForResponse(req, member)
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(path.join(__dirname, '../', req.file.path));
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error updating team member',
      error: error.message
    });
  }
};

// Delete team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await TeamMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Delete image file
    if (member.image?.filename) {
      try {
        await fs.unlink(
          path.join(__dirname, '../uploads/team/', member.image.filename)
        );
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await withOptionalTransaction(async (session) => {
      if (session) {
        await TeamMember.deleteOne({ _id: id }, { session });
        return;
      }
      await TeamMember.deleteOne({ _id: id });
    });

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting team member',
      error: error.message
    });
  }
};

// Reorder team members
exports.reorderTeamMembers = async (req, res) => {
  try {
    const { members } = req.body; // Array of { id, order }

    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide members array'
      });
    }

    for (const { id, order } of members) {
      await TeamMember.updateOne({ _id: id }, { order });
    }

    res.status(200).json({
      success: true,
      message: 'Team members reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reordering team members',
      error: error.message
    });
  }
};
