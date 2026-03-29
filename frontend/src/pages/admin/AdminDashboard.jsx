import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Mail, 
  FileText, 
  UserCheck, 
  Globe,
  Filter,
  Search,
  Send,
  X,
  Trash2,
  BookOpen
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
  const [seoPingLogs, setSeoPingLogs] = useState([]);
  const [pingingSitemap, setPingingSitemap] = useState(false);
  const [retryingFailed, setRetryingFailed] = useState(false);
  const [seoQueueSummary, setSeoQueueSummary] = useState({ queuedCount: 0, exhaustedCount: 0 });
  const [expandedSeoLogId, setExpandedSeoLogId] = useState('');

  const adminData = getAdminData();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchStats();
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchSeoPingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSeoPingHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/seo/ping-history?limit=8`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSeoPingLogs(data.logs || []);
        setSeoQueueSummary({
          queuedCount: data.queuedCount || 0,
          exhaustedCount: data.exhaustedCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching SEO ping history:', error);
    }
  };

  const handleManualSitemapPing = async () => {
    try {
      setPingingSitemap(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/seo/ping-sitemap`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Sitemap pinged successfully');
      } else {
        toast.error(data.message || 'Sitemap ping failed');
      }

      fetchSeoPingHistory();
    } catch (error) {
      toast.error('Failed to ping sitemap');
    } finally {
      setPingingSitemap(false);
    }
  };

  const handleRetryFailedNow = async () => {
    try {
      setRetryingFailed(true);
      const response = await fetch(`${BACKEND_URL}/api/admin/seo/retry-failed`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ limit: 12 })
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Retry queue processed (${data.processed || 0} logs)`);
      } else {
        toast.error(data.message || 'Retry queue processing failed');
      }

      fetchSeoPingHistory();
    } catch (error) {
      toast.error('Failed to process retry queue');
    } finally {
      setRetryingFailed(false);
    }
  };

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

  const getSeoStatusBadgeClass = (log) => {
    const totalTargets = Math.max(0, log.totalTargets ?? (Array.isArray(log.results) ? log.results.length : 0));
    if (totalTargets === 0) return 'seo-badge-neutral';
    const ratio = (log.successCount || 0) / totalTargets;
    if (ratio >= 1) return 'seo-badge-success';
    if (ratio > 0) return 'seo-badge-partial';
    return 'seo-badge-failed';
  };

  const getEngineLabel = (url = '') => {
    if (url.includes('google')) return 'Google';
    if (url.includes('bing')) return 'Bing';
    return 'Search Engine';
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
          <button onClick={() => navigate('/admin/blogs')} className="btn-secondary">
            <BookOpen size={18} />
            Blog Manager
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

      <section className="admin-seo-monitor">
        <div className="admin-seo-monitor-header">
          <h2>SEO Monitor</h2>
          <div className="admin-seo-actions">
            <button className="btn-secondary" type="button" onClick={handleManualSitemapPing} disabled={pingingSitemap}>
              <Globe size={16} />
              {pingingSitemap ? 'Pinging...' : 'Ping Sitemap'}
            </button>
            <button className="btn-secondary" type="button" onClick={handleRetryFailedNow} disabled={retryingFailed || seoQueueSummary.queuedCount === 0}>
              {retryingFailed ? 'Retrying...' : 'Retry Failed Now'}
            </button>
          </div>
        </div>

        <div className="admin-seo-summary-row">
          <span className="admin-seo-summary-chip">Queued retries: {seoQueueSummary.queuedCount}</span>
          <span className="admin-seo-summary-chip">Exhausted: {seoQueueSummary.exhaustedCount}</span>
        </div>

        {seoPingLogs.length === 0 ? (
          <div className="empty-state">No sitemap ping activity yet</div>
        ) : (
          <div className="admin-seo-log-list">
            {seoPingLogs.map((item) => (
              <div key={item._id} className="admin-seo-log-item">
                <div>
                  <p className="admin-seo-log-title-row">
                    {(() => {
                      const totalTargets = Math.max(0, item.totalTargets ?? (Array.isArray(item.results) ? item.results.length : 0));
                      if (totalTargets === 0) {
                        return (
                          <>
                            <span className={`admin-seo-status-badge ${getSeoStatusBadgeClass(item)}`}>
                              Modern mode
                            </span>
                            <strong>No external ping targets</strong>
                          </>
                        );
                      }

                      return (
                        <>
                          <span className={`admin-seo-status-badge ${getSeoStatusBadgeClass(item)}`}>
                            {item.success ? 'Success' : 'Failed'}
                          </span>
                          <strong>{item.successCount}/{totalTargets} engines</strong>
                        </>
                      );
                    })()}
                    {item.retryStatus ? <span className="admin-seo-retry-status">Retry: {item.retryStatus}</span> : null}
                  </p>
                  <p>{item.triggerType === 'auto' ? 'Auto trigger' : 'Manual trigger'} {item.reason ? `- ${item.reason}` : ''}</p>
                </div>
                <div className="admin-seo-log-right">
                  <p>{formatDate(item.createdAt)}</p>
                  <button
                    type="button"
                    className="admin-seo-detail-toggle"
                    onClick={() => setExpandedSeoLogId((prev) => (prev === item._id ? '' : item._id))}
                  >
                    {expandedSeoLogId === item._id ? 'Hide details' : 'View details'}
                  </button>
                </div>

                {expandedSeoLogId === item._id ? (
                  <div className="admin-seo-log-details">
                    {(item.results || []).map((result, index) => (
                      <div key={`${item._id}-result-${index}`} className="admin-seo-engine-row">
                        <div>
                          <strong>{getEngineLabel(result.url)}</strong>
                          <p>{result.url}</p>
                        </div>
                        <div className="admin-seo-engine-meta">
                          <span className={result.ok ? 'seo-engine-ok' : 'seo-engine-fail'}>
                            {result.ok ? 'OK' : 'Error'}
                          </span>
                          <span>HTTP {result.statusCode || 0}</span>
                        </div>
                        {result.error ? <p className="seo-engine-error">{result.error}</p> : null}
                        {result.body ? <pre>{String(result.body).slice(0, 280)}</pre> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

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
