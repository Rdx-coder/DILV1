import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Mail, 
  FileText, 
  UserCheck, 
  Filter,
  Search,
  Send,
  X,
  Trash2
} from 'lucide-react';
import { toast } from '../../components/ui/sonner';
import { getAuthHeaders, logout, getAdminData } from '../../utils/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    formType: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [replyModal, setReplyModal] = useState(false);
  const [replyData, setReplyData] = useState({
    subject: '',
    message: ''
  });
  const [sendingReply, setSendingReply] = useState(false);

  const adminData = getAdminData();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchStats();
    fetchSubmissions();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${BACKEND_URL}/api/admin/submissions?${queryParams}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleStatusChange = async (submissionId, newStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Status updated successfully');
        fetchSubmissions();
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openReplyModal = (submission) => {
    setSelectedSubmission(submission);
    setReplyData({
      subject: `Re: ${submission.subject || 'Your inquiry'}`,
      message: ''
    });
    setReplyModal(true);
  };

  const closeReplyModal = () => {
    setReplyModal(false);
    setSelectedSubmission(null);
    setReplyData({ subject: '', message: '' });
  };

  const handleSendReply = async () => {
    if (!replyData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingReply(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/submissions/${selectedSubmission._id}/reply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(replyData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Reply sent successfully');
        closeReplyModal();
        fetchSubmissions();
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Submission deleted successfully');
        fetchSubmissions();
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete submission');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      new: 'status-badge-new',
      in_progress: 'status-badge-progress',
      replied: 'status-badge-replied',
      closed: 'status-badge-closed'
    };
    return classes[status] || 'status-badge-default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Welcome, {adminData?.name || 'Admin'}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#d9fb06' }}>
              <FileText size={32} />
            </div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Submissions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#f59e0b' }}>
              <Mail size={32} />
            </div>
            <div>
              <div className="stat-value">{stats.byStatus.new}</div>
              <div className="stat-label">New</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#3b82f6' }}>
              <UserCheck size={32} />
            </div>
            <div>
              <div className="stat-value">{stats.byStatus.replied}</div>
              <div className="stat-label">Replied</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#10b981' }}>
              <FileText size={32} />
            </div>
            <div>
              <div className="stat-value">{stats.recentSubmissions}</div>
              <div className="stat-label">Last 7 Days</div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-filters">
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filters.formType}
            onChange={(e) => setFilters({ ...filters, formType: e.target.value, page: 1 })}
            className="filter-select"
          >
            <option value="">All Forms</option>
            <option value="contact">Contact</option>
            <option value="application">Application</option>
            <option value="mentorship">Mentorship</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>

        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="filter-input"
          />
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-state">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">No submissions found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id}>
                  <td>{submission.name}</td>
                  <td>{submission.email}</td>
                  <td>
                    <span className="form-type-badge">{submission.formType}</span>
                  </td>
                  <td>{submission.subject || '-'}</td>
                  <td>
                    <select
                      value={submission.status}
                      onChange={(e) => handleStatusChange(submission._id, e.target.value)}
                      className={`status-select ${getStatusBadgeClass(submission.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td>{formatDate(submission.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openReplyModal(submission)}
                        className="action-btn action-btn-primary"
                        title="Reply"
                      >
                        <Send size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="action-btn action-btn-danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {replyModal && selectedSubmission && (
        <div className="modal-overlay" onClick={closeReplyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reply to {selectedSubmission.name}</h2>
              <button onClick={closeReplyModal} className="modal-close">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="submission-details">
                <p><strong>From:</strong> {selectedSubmission.email}</p>
                <p><strong>Subject:</strong> {selectedSubmission.subject}</p>
                {selectedSubmission.message && (
                  <div className="original-message">
                    <strong>Original Message:</strong>
                    <p>{selectedSubmission.message}</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  value={replyData.subject}
                  onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  value={replyData.message}
                  onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
                  rows="8"
                  className="form-textarea"
                  placeholder="Type your reply here..."
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeReplyModal} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sendingReply}
                className="btn-primary"
              >
                {sendingReply ? 'Sending...' : (
                  <>
                    <Send size={18} />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
