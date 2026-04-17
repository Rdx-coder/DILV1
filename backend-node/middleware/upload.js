const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (uploadDir) => multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  return cb(null, true);
};

const createImageUpload = (directoryName = 'general') => {
  const uploadDir = path.join(__dirname, '..', 'uploads', directoryName);
  ensureDir(uploadDir);

  return multer({
    storage: createStorage(uploadDir),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  });
};

const upload = createImageUpload('blog');
const uploadTeam = createImageUpload('team');
const uploadProducts = createImageUpload('products');
const uploadSponsors = createImageUpload('sponsors');

module.exports = upload;
module.exports.uploadTeam = uploadTeam;
module.exports.uploadProducts = uploadProducts;
module.exports.uploadSponsors = uploadSponsors;
module.exports.createImageUpload = createImageUpload;
