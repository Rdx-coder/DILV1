const { v2: cloudinary } = require('cloudinary');

const isCloudinaryConfigured = () => (
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET)
);

const ensureCloudinaryConfigured = () => {
  if (!isCloudinaryConfigured()) {
    const error = new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
};

const sanitizePublicIdBase = (value = '', fallback = 'asset') => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback;
};

const uploadImageAsset = async (filePath, { folder, publicIdBase = 'asset' } = {}) => {
  ensureCloudinaryConfigured();

  return cloudinary.uploader.upload(filePath, {
    folder: folder || 'dil/assets',
    resource_type: 'image',
    public_id: `${sanitizePublicIdBase(publicIdBase, 'asset')}-${Date.now()}`,
    overwrite: false,
    invalidate: true
  });
};

const uploadTeamMemberImage = async (filePath, memberName = 'team-member') => {
  return uploadImageAsset(filePath, {
    folder: 'dil/team-members',
    publicIdBase: memberName
  });
};

const destroyImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true
  });
};

module.exports = {
  destroyImage,
  isCloudinaryConfigured,
  uploadImageAsset,
  uploadTeamMemberImage
};
