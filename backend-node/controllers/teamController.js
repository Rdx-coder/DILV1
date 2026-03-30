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

    const member = await TeamMember.create(memberData);

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

      member.image = {
        filename: req.file.filename,
        url: `/uploads/team/${req.file.filename}`,
        altText: name || member.name || 'Team member'
      };
    }

    // Update fields
    if (name) member.name = name;
    if (role) member.role = role;
    if (bio !== undefined) member.bio = bio;
    if (social !== undefined) member.social = parseSocial(social);
    if (order !== undefined) member.order = parseOrder(order, member.order);
    if (isActive !== undefined) member.isActive = parseBoolean(isActive, member.isActive);

    member = await member.save();

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

    await TeamMember.deleteOne({ _id: id });

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
