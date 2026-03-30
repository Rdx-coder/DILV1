import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Linkedin,
  Mail,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from '../../components/ui/sonner';
import { getAuthHeaders } from '../../utils/auth';
import Sidebar from '../../components/admin/Sidebar';

const AdminTeamManager = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const assetBase = (BACKEND_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    order: 0,
    isActive: true,
    social: {
      linkedin: '',
      email: '',
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
        toast.error('Failed to load team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Error loading team members');
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
      toast.error('Please fill in name and role');
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: form
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Team member updated' : 'Team member created');
        setShowForm(false);
        resetForm();
        fetchTeamMembers();
      } else {
        toast.error(data.message || 'Failed to save team member');
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Error saving team member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member) => {
    const social = member.social && typeof member.social === 'object'
      ? member.social
      : { linkedin: '', email: '', portfolio: '' };

    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      order: member.order || 0,
      isActive: member.isActive,
      social: {
        linkedin: social.linkedin || '',
        email: social.email || '',
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
      const response = await fetch(`${BACKEND_URL}/api/team/admin/${id}/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Team member deleted');
        fetchTeamMembers();
      } else {
        toast.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Error deleting team member');
    }
  };

  const handleMoveOrder = async (member, direction) => {
    try {
      const newOrder = direction === 'up' ? member.order - 1 : member.order + 1;

      const response = await fetch(`${BACKEND_URL}/api/team/admin/${member._id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ order: newOrder })
      });

      const data = await response.json();

      if (data.success) {
        fetchTeamMembers();
      } else {
        toast.error('Failed to reorder');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Error reordering team member');
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
                <label>Member Photo</label>
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
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="form-input"
                  />
                </div>
                <div className="form-section">
                  <label>Role/Position *</label>
                  <input
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
                <label>Bio</label>
                <textarea
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
                <label className="section-title">Social Links</label>
                <div className="form-grid-three">
                  <div>
                    <label className="sub-label">
                      <Linkedin size={14} /> LinkedIn
                    </label>
                    <input
                      type="url"
                      name="social.linkedin"
                      value={formData.social.linkedin}
                      onChange={handleInputChange}
                      placeholder="linkedin.com/in/..."
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="sub-label">
                      <Mail size={14} /> Email
                    </label>
                    <input
                      type="email"
                      name="social.email"
                      value={formData.social.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="sub-label">
                      <Globe size={14} /> Portfolio
                    </label>
                    <input
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
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-section">
                  <label className="checkbox-label">
                    <input
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
              <div className="empty-state">
                <p>No team members yet. Add one to get started!</p>
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
