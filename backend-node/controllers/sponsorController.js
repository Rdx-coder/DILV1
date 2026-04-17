const fs = require('fs').promises;
const Sponsor = require('../models/Sponsor');
const { destroyImage, uploadImageAsset } = require('../utils/cloudinary');

const cleanupLocalUpload = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting uploaded file:', error);
    }
  }
};

const cleanupRemoteImage = async (image = {}) => {
  if (!image?.publicId) return;

  try {
    await destroyImage(image.publicId);
  } catch (error) {
    console.error('Error deleting Cloudinary asset:', error);
  }
};

const toSponsorResponse = (sponsorDoc) => {
  const sponsor = sponsorDoc.toObject ? sponsorDoc.toObject() : sponsorDoc;

  return {
    id: String(sponsor._id),
    name: sponsor.name,
    logoUrl: sponsor.logo?.url || '',
    logoAlt: sponsor.logo?.altText || sponsor.name,
    websiteUrl: sponsor.websiteUrl,
    tier: sponsor.tier || 'Partner',
    status: sponsor.status,
    createdAt: sponsor.createdAt,
    updatedAt: sponsor.updatedAt
  };
};

const buildSponsorQuery = (req, includeInactive = false) => {
  const query = {};
  const status = String(req.query.status || '').trim().toLowerCase();

  if (includeInactive) {
    if (status === 'active' || status === 'inactive') {
      query.status = status;
    }
  } else {
    query.status = 'active';
  }

  const tier = String(req.query.tier || '').trim();
  if (tier) {
    query.tier = tier;
  }

  const search = String(req.query.search || '').trim();
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tier: { $regex: search, $options: 'i' } }
    ];
  }

  return query;
};

exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find(buildSponsorQuery(req, false)).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors.map(toSponsorResponse)
    });
  } catch (error) {
    console.error('Get sponsors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsors'
    });
  }
};

exports.getAdminSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find(buildSponsorQuery(req, true)).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors.map(toSponsorResponse)
    });
  } catch (error) {
    console.error('Get admin sponsors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsors'
    });
  }
};

exports.createSponsor = async (req, res) => {
  let uploadedImage = null;

  try {
    let logo = {
      url: String(req.body.logoUrl || '').trim(),
      publicId: '',
      altText: String(req.body.logoAlt || req.body.name || '').trim()
    };

    if (req.file) {
      uploadedImage = await uploadImageAsset(req.file.path, {
        folder: 'dil/sponsors',
        publicIdBase: req.body.name || 'sponsor'
      });

      logo = {
        url: uploadedImage.secure_url || uploadedImage.url,
        publicId: uploadedImage.public_id,
        altText: String(req.body.logoAlt || req.body.name || '').trim()
      };
    }

    const sponsor = await Sponsor.create({
      name: String(req.body.name || '').trim(),
      logo,
      websiteUrl: String(req.body.websiteUrl || '').trim(),
      tier: String(req.body.tier || 'Partner').trim(),
      status: String(req.body.status || 'active').trim().toLowerCase()
    });

    return res.status(201).json({
      success: true,
      message: 'Sponsor created successfully',
      data: toSponsorResponse(sponsor)
    });
  } catch (error) {
    console.error('Create sponsor error:', error);
    if (uploadedImage?.public_id) {
      await cleanupRemoteImage({ publicId: uploadedImage.public_id });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create sponsor'
    });
  } finally {
    if (req.file?.path) {
      await cleanupLocalUpload(req.file.path);
    }
  }
};

exports.updateSponsor = async (req, res) => {
  let uploadedImage = null;

  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    const previousLogo = {
      publicId: sponsor.logo?.publicId || ''
    };

    if (req.body.name !== undefined) {
      sponsor.name = String(req.body.name).trim();
    }
    if (req.body.websiteUrl !== undefined) {
      sponsor.websiteUrl = String(req.body.websiteUrl).trim();
    }
    if (req.body.tier !== undefined) {
      sponsor.tier = String(req.body.tier).trim();
    }
    if (req.body.status !== undefined) {
      sponsor.status = String(req.body.status).trim().toLowerCase();
    }

    if (req.body.logoUrl !== undefined && !req.file) {
      sponsor.logo = {
        url: String(req.body.logoUrl || '').trim(),
        publicId: '',
        altText: String(req.body.logoAlt || sponsor.logo?.altText || sponsor.name).trim()
      };
    }

    if (req.body.logoAlt !== undefined) {
      sponsor.logo = {
        ...(sponsor.logo || {}),
        altText: String(req.body.logoAlt || sponsor.name).trim()
      };
    }

    if (req.file) {
      uploadedImage = await uploadImageAsset(req.file.path, {
        folder: 'dil/sponsors',
        publicIdBase: req.body.name || sponsor.name || 'sponsor'
      });

      sponsor.logo = {
        url: uploadedImage.secure_url || uploadedImage.url,
        publicId: uploadedImage.public_id,
        altText: String(req.body.logoAlt || sponsor.name).trim()
      };
    }

    await sponsor.save();

    if (req.file && previousLogo.publicId && previousLogo.publicId !== sponsor.logo.publicId) {
      await cleanupRemoteImage(previousLogo);
    }

    return res.status(200).json({
      success: true,
      message: 'Sponsor updated successfully',
      data: toSponsorResponse(sponsor)
    });
  } catch (error) {
    console.error('Update sponsor error:', error);
    if (uploadedImage?.public_id) {
      await cleanupRemoteImage({ publicId: uploadedImage.public_id });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update sponsor'
    });
  } finally {
    if (req.file?.path) {
      await cleanupLocalUpload(req.file.path);
    }
  }
};

exports.deleteSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    await Sponsor.deleteOne({ _id: sponsor._id });
    await cleanupRemoteImage(sponsor.logo);

    return res.status(200).json({
      success: true,
      message: 'Sponsor deleted successfully'
    });
  } catch (error) {
    console.error('Delete sponsor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sponsor'
    });
  }
};
