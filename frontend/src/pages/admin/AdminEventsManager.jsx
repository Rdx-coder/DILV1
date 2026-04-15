import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { getAuthHeaders } from '../../utils/auth';
import { withCsrfHeaders } from '../../utils/csrf';
import { notify } from '../../utils/notify';
import Sidebar from '../../components/admin/Sidebar';
import SEO from '../../components/SEO';

const AdminEventsManager = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    startDate: '',
    endDate: '',
    details: '',
    location: '',
    ctaUrl: '',
    order: 0,
    isActive: true
  });

  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date - offsetMs).toISOString().slice(0, 16);
  };

  const formatEventDateRange = (startIso, endIso) => {
    if (!startIso) return 'Start date not set';
    const start = new Date(startIso).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    if (!endIso) return start;
    const end = new Date(endIso).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    return `${start} — ${end}`;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/events/admin/all`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.success) {
        setEvents(data.data || []);
      } else {
        notify.error(data.message || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      notify.error('Error loading events');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      startDate: '',
      endDate: '',
      details: '',
      location: '',
      ctaUrl: '',
      order: 0,
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (eventItem) => {
    setFormData({
      title: eventItem.title || '',
      type: eventItem.type || '',
      startDate: formatDateForInput(eventItem.startDate),
      endDate: formatDateForInput(eventItem.endDate),
      details: eventItem.details || '',
      location: eventItem.location || '',
      ctaUrl: eventItem.ctaUrl || '',
      order: eventItem.order || 0,
      isActive: eventItem.isActive
    });
    setEditingId(eventItem._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;

    try {
      const headers = await withCsrfHeaders(getAuthHeaders(), BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/api/events/admin/${id}/delete`, {
        method: 'DELETE',
        headers
      });
      const data = await response.json();

      if (data.success) {
        notify.success('Event deleted');
        fetchEvents();
      } else {
        notify.error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      notify.error('Delete failed');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.startDate.trim()) {
      notify.error('Please fill in the event title and start date');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        title: formData.title.trim(),
        type: formData.type.trim(),
        details: formData.details.trim(),
        location: formData.location.trim(),
        ctaUrl: formData.ctaUrl.trim()
      };
      const endpoint = editingId
        ? `${BACKEND_URL}/api/events/admin/${editingId}/update`
        : `${BACKEND_URL}/api/events/admin/create`;
      const method = editingId ? 'PUT' : 'POST';

      const headers = await withCsrfHeaders(getAuthHeaders(), BACKEND_URL);
      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        notify.success(editingId ? 'Event updated successfully' : 'Event created successfully');
        resetForm();
        fetchEvents();
      } else {
        notify.error(data.message || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      notify.error('Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        <div className="admin-team-manager">
          <SEO title="Admin Events" description="Manage upcoming program events and deadlines" />

          <div className="team-header">
            <div>
              <h2>Events Manager</h2>
              <p>Publish and manage upcoming program events, deadlines, and webinars.</p>
            </div>
            <button
              className="btn-primary"
              disabled={isSaving}
              onClick={() => {
                resetForm();
                setShowForm((prev) => !prev);
              }}
            >
              <Plus size={18} />
              {showForm ? 'Hide Form' : 'Add Event'}
            </button>
          </div>

          {showForm && (
            <div className="team-form-container">
              <div className="team-form">
                <div className="team-form-header">
                  <h3>{editingId ? 'Edit Event' : 'Add New Event'}</h3>
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
                  <div className="form-grid-two">
                    <div className="form-section">
                      <label htmlFor="event-title">Event Title *</label>
                      <input
                        id="event-title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Cohort 2026 Application Deadline"
                        className="form-input"
                      />
                    </div>
                    <div className="form-section">
                      <label htmlFor="event-startDate">Start Date & Time *</label>
                      <input
                        id="event-startDate"
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                      <p className="form-help">Enter the event time in your local timezone. Visitors in other time zones will see the converted local time.</p>
                    </div>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-section">
                      <label htmlFor="event-endDate">End Date & Time</label>
                      <input
                        id="event-endDate"
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                      <p className="form-help">Optional — leave empty for a same-day deadline or session.</p>
                    </div>
                    <div className="form-section">
                      <label htmlFor="event-type">Type</label>
                      <input
                        id="event-type"
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        placeholder="Workshop, Deadline, Webinar"
                        className="form-input"
                      />
                    </div>
                    <div className="form-section">
                      <label htmlFor="event-location">Location</label>
                      <input
                        id="event-location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Online / Delhi"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <label htmlFor="event-details">Details</label>
                    <textarea
                      id="event-details"
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      placeholder="Add a short description, agenda, or deadline instructions."
                      rows="4"
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-section">
                    <label htmlFor="event-cta">Link (Optional)</label>
                    <input
                      id="event-cta"
                      type="url"
                      name="ctaUrl"
                      value={formData.ctaUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="form-input"
                    />
                  </div>

                  <div className="form-grid-two">
                    <div className="form-section">
                      <label htmlFor="event-order">Display Order</label>
                      <input
                        id="event-order"
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-section">
                      <label className="checkbox-label" htmlFor="event-active">
                        <input
                          id="event-active"
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        <span>Publish on website</span>
                      </label>
                    </div>
                  </div>

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
                      {isSaving ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="team-list">
            {loading ? (
              <div className="empty-state-card" role="status">
                <h3 className="empty-state-title">Loading events...</h3>
                <p className="empty-state-description">Fetching the latest event schedule.</p>
              </div>
            ) : events.length === 0 ? (
              <div className="empty-state-card" role="status">
                <h3 className="empty-state-title">No events yet</h3>
                <p className="empty-state-description">Add your first upcoming event or deadline to publish it on the Programs page.</p>
              </div>
            ) : (
              <div className="team-items-grid">
                {events.map((eventItem) => (
                  <div key={eventItem._id} className="team-item-card">
                    <div className="team-item-content">
                      <h4>{eventItem.title}</h4>
                      <p className="team-role">{eventItem.type || 'Event'}</p>
                      <p className="team-bio">{formatEventDateRange(eventItem.startDate, eventItem.endDate)}</p>
                      {eventItem.location ? <p className="team-bio">{eventItem.location}</p> : null}
                      {eventItem.details ? <p className="team-bio">{eventItem.details}</p> : null}
                      {eventItem.ctaUrl ? (
                        <a href={eventItem.ctaUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                          Visit link
                        </a>
                      ) : null}
                    </div>
                    <div className="team-item-actions">
                      <button className="action-icon-btn action-edit" onClick={() => handleEdit(eventItem)} title="Edit event">
                        <Pencil size={16} />
                      </button>
                      <button className="action-icon-btn action-delete" onClick={() => handleDelete(eventItem._id)} title="Delete event">
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

export default AdminEventsManager;
