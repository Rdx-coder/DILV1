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

const uploadTeamMemberImage = async (filePath, memberName = 'team-member') => {
  ensureCloudinaryConfigured();

  const publicIdBase = String(memberName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'team-member';

  return cloudinary.uploader.upload(filePath, {
    folder: 'dil/team-members',
    resource_type: 'image',
    public_id: `${publicIdBase}-${Date.now()}`,
    overwrite: false,
    invalidate: true
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
  uploadTeamMemberImage
};
