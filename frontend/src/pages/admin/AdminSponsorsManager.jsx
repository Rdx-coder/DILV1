import React, { useEffect, useMemo, useState } from 'react';
import { Edit, ExternalLink, Plus, Trash2, Upload, X } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import { getToken } from '../../utils/auth';
import { withCsrfHeaders } from '../../utils/csrf';
import { notify } from '../../utils/notify';

const emptyForm = {
  name: '',
  websiteUrl: '',
  tier: 'Partner',
  status: 'active',
  logoAlt: ''
};

const AdminSponsorsManager = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchSponsors();
  }, []);

  const orderedSponsors = useMemo(
    () => [...sponsors].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [sponsors]
  );

  const getAuthorizedHeaders = async (headers = {}) => {
    const token = getToken();
    return withCsrfHeaders({
      ...headers,
      Authorization: `Bearer ${token}`
    }, BACKEND_URL);
  };

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/sponsors`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to load sponsors');
      }

      setSponsors(data.data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      notify.error(error.message || 'Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setLogo(null);
    setLogoPreview('');
    setEditingId('');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogo(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result?.toString() || '');
    reader.readAsDataURL(file);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (sponsor) => {
    setEditingId(sponsor.id);
    setFormData({
      name: sponsor.name || '',
      websiteUrl: sponsor.websiteUrl || '',
      tier: sponsor.tier || 'Partner',
      status: sponsor.status || 'active',
      logoAlt: sponsor.logoAlt || ''
    });
    setLogo(null);
    setLogoPreview(sponsor.logoUrl || '');
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.websiteUrl.trim()) {
      notify.error('Name and website URL are required');
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      if (logo) {
        payload.append('logo', logo);
      }

      const response = await fetch(
        editingId ? `${BACKEND_URL}/api/admin/sponsors/${editingId}` : `${BACKEND_URL}/api/admin/sponsors`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: await getAuthorizedHeaders(),
          body: payload
        }
      );

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to save sponsor');
      }

      notify.success(editingId ? 'Sponsor updated' : 'Sponsor created');
      setShowForm(false);
      resetForm();
      fetchSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      notify.error(error.message || 'Failed to save sponsor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sponsor?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/sponsors/${id}`, {
        method: 'DELETE',
        headers: await getAuthorizedHeaders()
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to delete sponsor');
      }

      notify.success('Sponsor deleted');
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      notify.error(error.message || 'Failed to delete sponsor');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <div className="admin-team-manager">
          <div className="team-header">
            <div>
              <h2>Sponsors & Partners</h2>
              <p>Manage logos, tiers, and website links across the homepage and sponsors page.</p>
            </div>
            <button type="button" className="btn-primary" onClick={openCreateForm}>
              <Plus size={18} />
              Add Sponsor
            </button>
          </div>

          {showForm ? (
            <div className="team-form-container">
              <div className="team-form admin-showcase-form">
                <div className="team-form-header">
                  <h3>{editingId ? 'Edit Sponsor' : 'Add Sponsor'}</h3>
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
                    <label htmlFor="sponsor-logo">Logo</label>
                    <div className="image-upload-area">
                      {logoPreview ? (
                        <div className="image-preview-container">
                          <img src={logoPreview} alt="Logo preview" className="image-preview sponsor-preview" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => {
                              setLogo(null);
                              setLogoPreview('');
                            }}
                          >
                            <X size={16} /> Remove
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label" htmlFor="sponsor-logo">
                          <Upload size={28} />
                          <span>Upload sponsor logo</span>
                        </label>
                      )}
                      <input id="sponsor-logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </div>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-section">
                      <label htmlFor="sponsor-name">Name</label>
                      <input id="sponsor-name" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-section">
                      <label htmlFor="sponsor-tier">Tier</label>
                      <select id="sponsor-tier" name="tier" className="form-input" value={formData.tier} onChange={handleInputChange}>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Partner">Partner</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-section">
                      <label htmlFor="sponsor-url">Website URL</label>
                      <input id="sponsor-url" name="websiteUrl" type="url" className="form-input" value={formData.websiteUrl} onChange={handleInputChange} />
                    </div>
                    <div className="form-section">
                      <label htmlFor="sponsor-logo-alt">Logo alt text</label>
                      <input id="sponsor-logo-alt" name="logoAlt" className="form-input" value={formData.logoAlt} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-section">
                    <label htmlFor="sponsor-status">Status</label>
                    <select id="sponsor-status" name="status" className="form-input" value={formData.status} onChange={handleInputChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Sponsor' : 'Create Sponsor'}</button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}

          <div className="team-list">
            {loading ? (
              <div className="loading-state">Loading sponsors...</div>
            ) : orderedSponsors.length === 0 ? (
              <div className="empty-state-card">
                <h3 className="empty-state-title">No sponsors yet</h3>
                <p className="empty-state-description">Create your first sponsor or partner profile to publish it on the website.</p>
              </div>
            ) : (
              <div className="showcase-admin-grid sponsor-admin-grid">
                {orderedSponsors.map((sponsor) => (
                  <article key={sponsor.id} className="team-item-card showcase-admin-card sponsor-admin-card">
                    <div className="showcase-admin-image-wrap sponsor-logo-wrap">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt={sponsor.logoAlt || sponsor.name} className="showcase-admin-image sponsor-admin-image" />
                      ) : (
                        <div className="showcase-admin-image showcase-admin-image-fallback">{sponsor.name}</div>
                      )}
                    </div>
                    <div className="team-item-content">
                      <div className="showcase-admin-headline">
                        <h4>{sponsor.name}</h4>
                        <span className={`showcase-status-badge ${sponsor.status}`}>{sponsor.status}</span>
                      </div>
                      <p className="team-role">{sponsor.tier}</p>
                      <div className="showcase-admin-links">
                        <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
                          Website <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                    <div className="team-item-actions">
                      <button type="button" className="action-icon-btn action-edit" onClick={() => openEditForm(sponsor)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button type="button" className="action-icon-btn action-delete" onClick={() => handleDelete(sponsor.id)} title="Delete">
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

export default AdminSponsorsManager;
