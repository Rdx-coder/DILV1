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
  Eye,
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
    <div className=\"admin-dashboard\">\n      {/* Header */}\n      <header className=\"admin-header\">\n        <div className=\"admin-header-content\">\n          <div>\n            <h1 className=\"admin-title\">Admin Dashboard</h1>\n            <p className=\"admin-subtitle\">Welcome, {adminData?.name || 'Admin'}</p>\n          </div>\n          <button onClick={handleLogout} className=\"btn-secondary\">\n            <LogOut size={18} />\n            Logout\n          </button>\n        </div>\n      </header>\n\n      {/* Stats Cards */}\n      {stats && (\n        <div className=\"admin-stats\">\n          <div className=\"stat-card\">\n            <div className=\"stat-icon\" style={{ color: '#d9fb06' }}>\n              <FileText size={32} />\n            </div>\n            <div>\n              <div className=\"stat-value\">{stats.total}</div>\n              <div className=\"stat-label\">Total Submissions</div>\n            </div>\n          </div>\n          <div className=\"stat-card\">\n            <div className=\"stat-icon\" style={{ color: '#f59e0b' }}>\n              <Mail size={32} />\n            </div>\n            <div>\n              <div className=\"stat-value\">{stats.byStatus.new}</div>\n              <div className=\"stat-label\">New</div>\n            </div>\n          </div>\n          <div className=\"stat-card\">\n            <div className=\"stat-icon\" style={{ color: '#3b82f6' }}>\n              <UserCheck size={32} />\n            </div>\n            <div>\n              <div className=\"stat-value\">{stats.byStatus.replied}</div>\n              <div className=\"stat-label\">Replied</div>\n            </div>\n          </div>\n          <div className=\"stat-card\">\n            <div className=\"stat-icon\" style={{ color: '#10b981' }}>\n              <FileText size={32} />\n            </div>\n            <div>\n              <div className=\"stat-value\">{stats.recentSubmissions}</div>\n              <div className=\"stat-label\">Last 7 Days</div>\n            </div>\n          </div>\n        </div>\n      )}\n\n      {/* Filters */}\n      <div className=\"admin-filters\">\n        <div className=\"filter-group\">\n          <Filter size={18} />\n          <select\n            value={filters.status}\n            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}\n            className=\"filter-select\"\n          >\n            <option value=\"\">All Status</option>\n            <option value=\"new\">New</option>\n            <option value=\"in_progress\">In Progress</option>\n            <option value=\"replied\">Replied</option>\n            <option value=\"closed\">Closed</option>\n          </select>\n        </div>\n\n        <div className=\"filter-group\">\n          <Filter size={18} />\n          <select\n            value={filters.formType}\n            onChange={(e) => setFilters({ ...filters, formType: e.target.value, page: 1 })}\n            className=\"filter-select\"\n          >\n            <option value=\"\">All Forms</option>\n            <option value=\"contact\">Contact</option>\n            <option value=\"application\">Application</option>\n            <option value=\"mentorship\">Mentorship</option>\n            <option value=\"newsletter\">Newsletter</option>\n          </select>\n        </div>\n\n        <div className=\"filter-search\">\n          <Search size={18} />\n          <input\n            type=\"text\"\n            placeholder=\"Search by name or email...\"\n            value={filters.search}\n            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}\n            className=\"filter-input\"\n          />\n        </div>\n      </div>\n\n      {/* Submissions Table */}\n      <div className=\"admin-table-container\">\n        {loading ? (\n          <div className=\"loading-state\">Loading submissions...</div>\n        ) : submissions.length === 0 ? (\n          <div className=\"empty-state\">No submissions found</div>\n        ) : (\n          <table className=\"admin-table\">\n            <thead>\n              <tr>\n                <th>Name</th>\n                <th>Email</th>\n                <th>Type</th>\n                <th>Subject</th>\n                <th>Status</th>\n                <th>Date</th>\n                <th>Actions</th>\n              </tr>\n            </thead>\n            <tbody>\n              {submissions.map((submission) => (\n                <tr key={submission._id}>\n                  <td>{submission.name}</td>\n                  <td>{submission.email}</td>\n                  <td>\n                    <span className=\"form-type-badge\">{submission.formType}</span>\n                  </td>\n                  <td>{submission.subject || '-'}</td>\n                  <td>\n                    <select\n                      value={submission.status}\n                      onChange={(e) => handleStatusChange(submission._id, e.target.value)}\n                      className={`status-select ${getStatusBadgeClass(submission.status)}`}\n                    >\n                      <option value=\"new\">New</option>\n                      <option value=\"in_progress\">In Progress</option>\n                      <option value=\"replied\">Replied</option>\n                      <option value=\"closed\">Closed</option>\n                    </select>\n                  </td>\n                  <td>{formatDate(submission.createdAt)}</td>\n                  <td>\n                    <div className=\"action-buttons\">\n                      <button\n                        onClick={() => openReplyModal(submission)}\n                        className=\"action-btn action-btn-primary\"\n                        title=\"Reply\"\n                      >\n                        <Send size={16} />\n                      </button>\n                      <button\n                        onClick={() => handleDelete(submission._id)}\n                        className=\"action-btn action-btn-danger\"\n                        title=\"Delete\"\n                      >\n                        <Trash2 size={16} />\n                      </button>\n                    </div>\n                  </td>\n                </tr>\n              ))}\n            </tbody>\n          </table>\n        )}\n      </div>\n\n      {/* Reply Modal */}\n      {replyModal && selectedSubmission && (\n        <div className=\"modal-overlay\" onClick={closeReplyModal}>\n          <div className=\"modal-content\" onClick={(e) => e.stopPropagation()}>\n            <div className=\"modal-header\">\n              <h2>Reply to {selectedSubmission.name}</h2>\n              <button onClick={closeReplyModal} className=\"modal-close\">\n                <X size={24} />\n              </button>\n            </div>\n\n            <div className=\"modal-body\">\n              <div className=\"submission-details\">\n                <p><strong>From:</strong> {selectedSubmission.email}</p>\n                <p><strong>Subject:</strong> {selectedSubmission.subject}</p>\n                {selectedSubmission.message && (\n                  <div className=\"original-message\">\n                    <strong>Original Message:</strong>\n                    <p>{selectedSubmission.message}</p>\n                  </div>\n                )}\n              </div>\n\n              <div className=\"form-group\">\n                <label className=\"form-label\">Subject</label>\n                <input\n                  type=\"text\"\n                  value={replyData.subject}\n                  onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}\n                  className=\"form-input\"\n                />\n              </div>\n\n              <div className=\"form-group\">\n                <label className=\"form-label\">Message</label>\n                <textarea\n                  value={replyData.message}\n                  onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}\n                  rows=\"8\"\n                  className=\"form-textarea\"\n                  placeholder=\"Type your reply here...\"\n                ></textarea>\n              </div>\n            </div>\n\n            <div className=\"modal-footer\">\n              <button onClick={closeReplyModal} className=\"btn-secondary\">\n                Cancel\n              </button>\n              <button\n                onClick={handleSendReply}\n                disabled={sendingReply}\n                className=\"btn-primary\"\n              >\n                {sendingReply ? 'Sending...' : (\n                  <>\n                    <Send size={18} />\n                    Send Reply\n                  </>\n                )}\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n};\n\nexport default AdminDashboard;
