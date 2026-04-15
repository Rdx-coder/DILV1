import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Linkedin,
  Github,
  Mail,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getAuthHeaders } from '../../utils/auth';
import { withCsrfHeaders } from '../../utils/csrf';
import { notify } from '../../utils/notify';
import Sidebar from '../../components/admin/Sidebar';

const AdminTeamManager = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
  const assetBase = (BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/api\/?$/, '').replace(/\/$/, '');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    order: 0,
    isActive: true,
    social: {
      linkedin: '',
      email: '',
      github: '',
      portfolio: ''
    }
  });

  const [image, setImage] = useState(null);

  const resolveImageUrl = (url) => {
    const fallbackAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#3f4816"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#d9fb06" font-size="42" font-family="Arial, sans-serif">Team Member</text></svg>'
    )}`;

    if (!url) return fallbackAvatar;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith('/uploads')) {
          return `${assetBase}${parsed.pathname}`;
        }
      } catch (_err) {
        return url;
      }
      return url;
    }
    if (url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads')) return `${assetBase}${url}`;
    if (url.startsWith('uploads/')) return `${assetBase}/${url}`;
    return url;
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/team/admin/all`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.success) {
        setTeamMembers(data.data || []);
      } else {
        notify.error('Failed to load team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      notify.error('Error loading team members');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) {
      return;
    }

    if (!formData.name.trim() || !formData.role.trim()) {
      notify.error('Please fill in name and role');
      return;
    }

    try {
      setIsSaving(true);
      const form = new FormData();
      form.append('name', formData.name);
      form.append('role', formData.role);
      form.append('bio', formData.bio);
      form.append('order', formData.order);
      form.append('isActive', formData.isActive);
      form.append('social', JSON.stringify(formData.social));

      if (image) {
        form.append('image', image);
      }

      const url = editingId
        ? `${BACKEND_URL}/api/team/admin/${editingId}/update`
        : `${BACKEND_URL}/api/team/admin/create`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: await withCsrfHeaders(
          {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          BACKEND_URL
        ),
        body: form
      });

      const data = await response.json();

      if (data.success) {
        notify.success(editingId ? 'Team member updated' : 'Team member created');
        setShowForm(false);
        resetForm();
        fetchTeamMembers();
      } else {
        notify.error(data.message || 'Failed to save team member');
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      notify.error('Error saving team member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member) => {
    const social = member.social && typeof member.social === 'object'
      ? member.social
      : { linkedin: '', email: '', github: '', portfolio: '' };

    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      order: member.order || 0,
      isActive: member.isActive,
      social: {
        linkedin: social.linkedin || '',
        email: social.email || '',
        github: social.github || '',
        portfolio: social.portfolio || ''
      }
    });
    setImagePreview(resolveImageUrl(member.image?.url));
    setEditingId(member._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      const headers = await withCsrfHeaders(getAuthHeaders(), BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/api/team/admin/${id}/delete`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (data.success) {
        notify.success('Team member deleted');
        fetchTeamMembers();
      } else {
        notify.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      notify.error('Error deleting team member');
    }
  };

  const handleMoveOrder = async (member, direction) => {
    try {
      const newOrder = direction === 'up' ? member.order - 1 : member.order + 1;

      const response = await fetch(`${BACKEND_URL}/api/team/admin/${member._id}/update`, {
        method: 'PUT',
        headers: await withCsrfHeaders(
          {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          BACKEND_URL
        ),
        body: JSON.stringify({ order: newOrder })
      });

      const data = await response.json();

      if (data.success) {
        notify.success('Team member order updated');
        fetchTeamMembers();
      } else {
        notify.error('Failed to reorder');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      notify.error('Error reordering team member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      bio: '',
      order: 0,
      isActive: true,
      social: {
        linkedin: '',
        email: '',
        github: '',
        portfolio: ''
      }
    });
    setImage(null);
    setImagePreview(null);
    setEditingId(null);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <div className="admin-team-manager">
          <div className="team-header">
            <div>
              <h2>Team Members</h2>
              <p>Manage your team and coordinators</p>
            </div>
            <button
              className="btn-primary"
              disabled={isSaving}
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
            >
              <Plus size={18} />
              Add Team Member
            </button>
          </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="team-form-container">
          <div className="team-form">
            <div className="team-form-header">
              <h3>{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="form-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="team-form-content">
              {/* Image Upload */}
              <div className="form-section">
                <label htmlFor="member-photo">Member Photo</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImage(null);
                        }}
                        className="remove-image-btn"
                      >
                        <X size={16} /> Remove
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <Upload size={32} />
                      <span>Click to upload image</span>
                      <input
                        id="member-photo"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name & Role */}
              <div className="form-grid-two">
                <div className="form-section">
                  <label htmlFor="member-name">Full Name *</label>
                  <input
                    id="member-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="form-input"
                  />
                </div>
                <div className="form-section">
                  <label htmlFor="member-role">Role/Position *</label>
                  <input
                    id="member-role"
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Co-founder, CTO"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="form-section">
                <label htmlFor="member-bio">Bio</label>
                <textarea
                  id="member-bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief bio or description..."
                  rows="3"
                  className="form-textarea"
                />
              </div>

              {/* Social Links */}
              <div className="form-section">
                <p className="section-title">Social Links</p>
                <div className="form-grid-three">
                  <div>
                    <label className="sub-label" htmlFor="member-linkedin">
                      <Linkedin size={14} /> LinkedIn
                    </label>
                    <input
                      id="member-linkedin"
                      type="url"
                      name="social.linkedin"
                      value={formData.social.linkedin}
                      onChange={handleInputChange}
                      placeholder="linkedin.com/in/..."
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="sub-label" htmlFor="member-email">
                      <Mail size={14} /> Email
                    </label>
                    <input
                      id="member-email"
                      type="email"
                      name="social.email"
                      value={formData.social.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="sub-label" htmlFor="member-github">
                      <Github size={14} /> GitHub
                    </label>
                    <input
                      id="member-github"
                      type="url"
                      name="social.github"
                      value={formData.social.github}
                      onChange={handleInputChange}
                      placeholder="github.com/username"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="sub-label" htmlFor="member-portfolio">
                      <Globe size={14} /> Portfolio
                    </label>
                    <input
                      id="member-portfolio"
                      type="url"
                      name="social.portfolio"
                      value={formData.social.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Order & Status */}
              <div className="form-grid-two">
                <div className="form-section">
                  <label htmlFor="member-order">Display Order</label>
                  <input
                    id="member-order"
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-section">
                  <label className="checkbox-label" htmlFor="member-active">
                    <input
                      id="member-active"
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Publish on website</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : (editingId ? 'Update Member' : 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* Team Members List */}
          <div className="team-list">
            {loading ? (
              <div className="loading-state">Loading team members...</div>
            ) : teamMembers.length === 0 ? (
              <div className="empty-state-card" role="status">
                <h3 className="empty-state-title">No team members yet</h3>
                <p className="empty-state-description">Create your first team profile to publish members on the public Team page.</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                >
                  <Plus size={18} /> Add Team Member
                </button>
              </div>
            ) : (
              <div className="team-items-grid">
                {teamMembers.map((member, index) => (
                  <div key={member._id} className="team-item-card">
                <div className="team-item-image">
                  <img
                    src={resolveImageUrl(member.image?.url)}
                    alt={member.name}
                    className="team-member-photo"
                  />
                  {!member.isActive && <span className="inactive-badge">Unpublished</span>}
                </div>

                <div className="team-item-content">
                  <h4>{member.name}</h4>
                  <p className="team-role">{member.role}</p>
                  {member.bio && <p className="team-bio">{member.bio}</p>}

                  <div className="team-social-links">
                    {member.social?.linkedin && (
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        <Linkedin size={16} />
                      </a>
                    )}
                    {member.social?.email && (
                      <a href={`mailto:${member.social.email}`} title="Email">
                        <Mail size={16} />
                      </a>
                    )}
                    {member.social?.github && (
                      <a href={member.social.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                        <Github size={16} />
                      </a>
                    )}
                    {member.social?.portfolio && (
                      <a href={member.social.portfolio} target="_blank" rel="noopener noreferrer" title="Portfolio">
                        <Globe size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="team-item-actions">
                  {index > 0 && (
                    <button
                      onClick={() => handleMoveOrder(member, 'up')}
                      className="action-icon-btn"
                      title="Move up"
                    >
                      <ArrowUp size={16} />
                    </button>
                  )}
                  {index < teamMembers.length - 1 && (
                    <button
                      onClick={() => handleMoveOrder(member, 'down')}
                      className="action-icon-btn"
                      title="Move down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(member)}
                    className="action-icon-btn action-edit"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="action-icon-btn action-delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTeamManager;
