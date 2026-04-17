import React, { useEffect, useMemo, useState } from 'react';
import { Edit, ExternalLink, Plus, Trash2, Upload, X } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import { getToken } from '../../utils/auth';
import { withCsrfHeaders } from '../../utils/csrf';
import { notify } from '../../utils/notify';

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  fullDescription: '',
  projectUrl: '',
  status: 'active',
  imageAlt: ''
};

const AdminProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchProducts();
  }, []);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [products]
  );

  const getAuthorizedHeaders = async (headers = {}) => {
    const token = getToken();
    return withCsrfHeaders({
      ...headers,
      Authorization: `Bearer ${token}`
    }, BACKEND_URL);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to load products');
      }

      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      notify.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setImage(null);
    setImagePreview('');
    setEditingId('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result?.toString() || '');
    reader.readAsDataURL(file);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || '',
      slug: product.slug || '',
      description: product.description || '',
      fullDescription: product.fullDescription || '',
      projectUrl: product.projectUrl || '',
      status: product.status || 'active',
      imageAlt: product.imageAlt || ''
    });
    setImagePreview(product.imageUrl || '');
    setImage(null);
    setShowForm(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.projectUrl.trim()) {
      notify.error('Title, description, and project link are required');
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (image) {
        payload.append('image', image);
      }

      const response = await fetch(
        editingId ? `${BACKEND_URL}/api/admin/products/${editingId}` : `${BACKEND_URL}/api/admin/products`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: await getAuthorizedHeaders(),
          body: payload
        }
      );

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to save product');
      }

      notify.success(editingId ? 'Product updated' : 'Product created');
      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      notify.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: await getAuthorizedHeaders()
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to delete product');
      }

      notify.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      notify.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <div className="admin-team-manager">
          <div className="team-header">
            <div>
              <h2>Products</h2>
              <p>Manage the innovation portfolio shown on the homepage and products pages.</p>
            </div>
            <button type="button" className="btn-primary" onClick={openCreateForm}>
              <Plus size={18} />
              Add Product
            </button>
          </div>

          {showForm ? (
            <div className="team-form-container">
              <div className="team-form admin-showcase-form">
                <div className="team-form-header">
                  <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
                  <button
                    type="button"
                    className="form-close-btn"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form className="team-form-content" onSubmit={handleSubmit}>
                  <div className="form-section">
                    <label htmlFor="product-image">Cover image</label>
                    <div className="image-upload-area">
                      {imagePreview ? (
                        <div className="image-preview-container">
                          <img src={imagePreview} alt="Preview" className="image-preview" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => {
                              setImage(null);
                              setImagePreview('');
                            }}
                          >
                            <X size={16} /> Remove
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label" htmlFor="product-image">
                          <Upload size={28} />
                          <span>Upload product image</span>
                        </label>
                      )}
                      <input id="product-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-section">
                      <label htmlFor="product-title">Title</label>
                      <input id="product-title" name="title" className="form-input" value={formData.title} onChange={handleInputChange} />
                    </div>
                    <div className="form-section">
                      <label htmlFor="product-slug">Slug</label>
                      <input id="product-slug" name="slug" className="form-input" value={formData.slug} onChange={handleInputChange} placeholder="auto-generated if blank" />
                    </div>
                  </div>

                  <div className="form-section">
                    <label htmlFor="product-description">Short description</label>
                    <textarea id="product-description" name="description" className="form-textarea" rows="3" maxLength="240" value={formData.description} onChange={handleInputChange} />
                  </div>

                  <div className="form-section">
                    <label htmlFor="product-full-description">Full description</label>
                    <textarea id="product-full-description" name="fullDescription" className="form-textarea" rows="6" value={formData.fullDescription} onChange={handleInputChange} />
                  </div>

                  <div className="form-grid-two">
                    <div className="form-section">
                      <label htmlFor="product-url">Project URL</label>
                      <input id="product-url" name="projectUrl" type="url" className="form-input" value={formData.projectUrl} onChange={handleInputChange} />
                    </div>
                    <div className="form-section">
                      <label htmlFor="product-image-alt">Image alt text</label>
                      <input id="product-image-alt" name="imageAlt" className="form-input" value={formData.imageAlt} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-section">
                    <label htmlFor="product-status">Status</label>
                    <select id="product-status" name="status" className="form-input" value={formData.status} onChange={handleInputChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}</button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          <div className="team-list">
            {loading ? (
              <div className="loading-state">Loading products...</div>
            ) : sortedProducts.length === 0 ? (
              <div className="empty-state-card">
                <h3 className="empty-state-title">No products yet</h3>
                <p className="empty-state-description">Create your first product to publish it on the homepage and portfolio page.</p>
              </div>
            ) : (
              <div className="showcase-admin-grid">
                {sortedProducts.map((product) => (
                  <article key={product.id} className="team-item-card showcase-admin-card">
                    <div className="showcase-admin-image-wrap">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.imageAlt || product.title} className="showcase-admin-image" />
                      ) : (
                        <div className="showcase-admin-image showcase-admin-image-fallback">{product.title}</div>
                      )}
                    </div>
                    <div className="team-item-content">
                      <div className="showcase-admin-headline">
                        <h4>{product.title}</h4>
                        <span className={`showcase-status-badge ${product.status}`}>{product.status}</span>
                      </div>
                      <p className="team-bio">{product.description}</p>
                      <div className="showcase-admin-links">
                        <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">Details</a>
                        <a href={product.projectUrl} target="_blank" rel="noopener noreferrer">Project <ExternalLink size={14} /></a>
                      </div>
                    </div>
                    <div className="team-item-actions">
                      <button type="button" className="action-icon-btn action-edit" onClick={() => openEditForm(product)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button type="button" className="action-icon-btn action-delete" onClick={() => handleDelete(product.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProductsManager;
