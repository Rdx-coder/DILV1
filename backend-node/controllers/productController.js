const fs = require('fs').promises;
const slugify = require('slugify');
const Product = require('../models/Product');
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

const createSlugBase = (value = '') => {
  const slug = slugify(String(value || ''), {
    lower: true,
    strict: true,
    trim: true
  });

  return slug || `product-${Date.now()}`;
};

const generateUniqueSlug = async (title, providedSlug, currentId = null) => {
  const baseSlug = createSlugBase(providedSlug || title);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Product.findOne({
      slug: candidate,
      ...(currentId ? { _id: { $ne: currentId } } : {})
    }).select('_id');

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
};

const toProductResponse = (productDoc) => {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;

  return {
    id: String(product._id),
    title: product.title,
    slug: product.slug,
    description: product.description,
    fullDescription: product.fullDescription || '',
    imageUrl: product.image?.url || '',
    imageAlt: product.image?.altText || product.title,
    projectUrl: product.projectUrl,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

const buildProductQuery = (req, includeInactive = false) => {
  const query = {};
  const status = String(req.query.status || '').trim().toLowerCase();
  const search = String(req.query.search || '').trim();

  if (includeInactive) {
    if (status === 'active' || status === 'inactive') {
      query.status = status;
    }
  } else {
    query.status = 'active';
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { fullDescription: { $regex: search, $options: 'i' } }
    ];
  }

  return query;
};

exports.getProducts = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const products = await Product.find(buildProductQuery(req, false))
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(toProductResponse)
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: 'active'
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: toProductResponse(product)
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find(buildProductQuery(req, true)).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(toProductResponse)
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

exports.createProduct = async (req, res) => {
  let uploadedImage = null;

  try {
    const slug = await generateUniqueSlug(req.body.title, req.body.slug);
    let image = {
      url: String(req.body.imageUrl || '').trim(),
      publicId: '',
      altText: String(req.body.imageAlt || req.body.title || '').trim()
    };

    if (req.file) {
      uploadedImage = await uploadImageAsset(req.file.path, {
        folder: 'dil/products',
        publicIdBase: req.body.title || slug
      });

      image = {
        url: uploadedImage.secure_url || uploadedImage.url,
        publicId: uploadedImage.public_id,
        altText: String(req.body.imageAlt || req.body.title || '').trim()
      };
    }

    const product = await Product.create({
      title: String(req.body.title || '').trim(),
      slug,
      description: String(req.body.description || '').trim(),
      fullDescription: String(req.body.fullDescription || '').trim(),
      image,
      projectUrl: String(req.body.projectUrl || '').trim(),
      status: String(req.body.status || 'active').trim().toLowerCase()
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: toProductResponse(product)
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (uploadedImage?.public_id) {
      await cleanupRemoteImage({ publicId: uploadedImage.public_id });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  } finally {
    if (req.file?.path) {
      await cleanupLocalUpload(req.file.path);
    }
  }
};

exports.updateProduct = async (req, res) => {
  let uploadedImage = null;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousImage = {
      publicId: product.image?.publicId || ''
    };

    if (req.body.title !== undefined) {
      product.title = String(req.body.title).trim();
    }
    if (req.body.description !== undefined) {
      product.description = String(req.body.description).trim();
    }
    if (req.body.fullDescription !== undefined) {
      product.fullDescription = String(req.body.fullDescription).trim();
    }
    if (req.body.projectUrl !== undefined) {
      product.projectUrl = String(req.body.projectUrl).trim();
    }
    if (req.body.status !== undefined) {
      product.status = String(req.body.status).trim().toLowerCase();
    }
    if (req.body.slug !== undefined || req.body.title !== undefined) {
      product.slug = await generateUniqueSlug(
        req.body.title || product.title,
        req.body.slug || product.slug,
        product._id
      );
    }

    if (req.body.imageUrl !== undefined && !req.file) {
      product.image = {
        url: String(req.body.imageUrl || '').trim(),
        publicId: '',
        altText: String(req.body.imageAlt || product.image?.altText || product.title).trim()
      };
    }

    if (req.body.imageAlt !== undefined) {
      product.image = {
        ...(product.image || {}),
        altText: String(req.body.imageAlt || product.title).trim()
      };
    }

    if (req.file) {
      uploadedImage = await uploadImageAsset(req.file.path, {
        folder: 'dil/products',
        publicIdBase: req.body.title || product.title || product.slug
      });

      product.image = {
        url: uploadedImage.secure_url || uploadedImage.url,
        publicId: uploadedImage.public_id,
        altText: String(req.body.imageAlt || product.title).trim()
      };
    }

    await product.save();

    if (req.file && previousImage.publicId && previousImage.publicId !== product.image.publicId) {
      await cleanupRemoteImage(previousImage);
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: toProductResponse(product)
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (uploadedImage?.public_id) {
      await cleanupRemoteImage({ publicId: uploadedImage.public_id });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  } finally {
    if (req.file?.path) {
      await cleanupLocalUpload(req.file.path);
    }
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.deleteOne({ _id: product._id });
    await cleanupRemoteImage(product.image);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};
