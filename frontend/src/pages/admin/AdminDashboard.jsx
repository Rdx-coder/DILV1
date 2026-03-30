import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  FileText,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Filter,
  Search,
  Send,
  X,
  Trash2,
  BookOpen,
  Globe,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from '../../components/ui/sonner';
import { getAuthHeaders, logout, getAdminData } from '../../utils/auth';
import Sidebar from '../../components/admin/Sidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    formType: '',
    search: '',
  });

  // SEO & Reply
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
    fetchSeoPingHistory();
    fetchActivityFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const fetchActivityFeed = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/submissions?limit=5&sort=-createdAt`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setActivityFeed(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    }
  };

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
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      }).toString();

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

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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

  const totalPages = Math.ceil(
    (stats?.total || 0) / itemsPerPage
  );

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-main">
        {/* Top Navigation Bar */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {activeTab === 'seo' ? 'SEO Monitor' : 'Dashboard'}
            </h1>
            <p className="dashboard-subtitle">
              {activeTab === 'seo'
                ? 'Track your sitemap ping status'
                : `Welcome back, ${adminData?.name || 'Admin'}`}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              {/* Quick Actions */}
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => navigate('/admin/blogs/new')}>
                  <Plus size={20} />
                  <div>
                    <p>New Blog</p>
                    <span>Create article</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
                <button className="quick-action-btn" onClick={handleManualSitemapPing} disabled={pingingSitemap}>
                  <Globe size={20} />
                  <div>
                    <p>Ping Sitemap</p>
                    <span>{pingingSitemap ? 'Pinging...' : 'SEO engines'}</span>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* KPI Cards */}
              {stats && (
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <FileText size={24} />
                      <div className="kpi-trend">
                        <TrendingUp size={16} />
                        <span>+12%</span>
                      </div>
                    </div>
                    <p className="kpi-value">{stats.total}</p>
                    <p className="kpi-label">Total Submissions</p>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <Mail size={24} />
                      <div className="kpi-trend">
                        <TrendingUp size={16} />
                        <span>New</span>
                      </div>
                    </div>
                    <p className="kpi-value">{stats.byStatus.new}</p>
                    <p className="kpi-label">Awaiting Response</p>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <UserCheck size={24} />
                      <div className="kpi-trend">
                        <CheckCircle size={16} />
                        <span>Active</span>
                      </div>
                    </div>
                    <p className="kpi-value">{stats.byStatus.replied}</p>
                    <p className="kpi-label">Replied</p>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <Clock size={24} />
                      <div className="kpi-trend">
                        <TrendingUp size={16} />
                        <span>Recent</span>
                      </div>
                    </div>
                    <p className="kpi-value">{stats.recentSubmissions}</p>
                    <p className="kpi-label">Last 7 Days</p>
                  </div>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="dashboard-grid">
                {/* Recent Activity */}
                <div className="card activity-card">
                  <div className="card-header">
                    <h2>Recent Activity</h2>
                  </div>
                  <div className="activity-list">
                    {activityFeed.length === 0 ? (
                      <p className="empty-message">No recent activity</p>
                    ) : (
                      activityFeed.map((item) => (
                        <div key={item._id} className="activity-item">
                          <div className="activity-icon" style={{ backgroundColor: '#d9fb0620' }}>
                            <Mail size={16} />
                          </div>
                          <div className="activity-content">
                            <p className="activity-title">{item.name}</p>
                            <p className="activity-desc">{item.formType}</p>
                          </div>
                          <span className="activity-time">{formatDateShort(item.createdAt)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Submissions Overview */}
                <div className="card submissions-overview">
                  <div className="card-header">
                    <h2>Status Overview</h2>
                  </div>
                  <div className="status-overview">
                    {stats && (
                      <>
                        <div className="status-item">
                          <div className="status-info">
                            <p className="status-name">New</p>
                            <p className="status-count">{stats.byStatus.new}</p>
                          </div>
                          <div className="status-bar">
                            <div
                              className="status-bar-fill"
                              style={{
                                width: `${(stats.byStatus.new / stats.total) * 100}%`,
                                backgroundColor: '#f59e0b'
                              }}
                            />
                          </div>
                        </div>
                        <div className="status-item">
                          <div className="status-info">
                            <p className="status-name">In Progress</p>
                            <p className="status-count">{stats.byStatus.in_progress}</p>
                          </div>
                          <div className="status-bar">
                            <div
                              className="status-bar-fill"
                              style={{
                                width: `${(stats.byStatus.in_progress / stats.total) * 100}%`,
                                backgroundColor: '#3b82f6'
                              }}
                            />
                          </div>
                        </div>
                        <div className="status-item">
                          <div className="status-info">
                            <p className="status-name">Replied</p>
                            <p className="status-count">{stats.byStatus.replied}</p>
                          </div>
                          <div className="status-bar">
                            <div
                              className="status-bar-fill"
                              style={{
                                width: `${(stats.byStatus.replied / stats.total) * 100}%`,
                                backgroundColor: '#10b981'
                              }}
                            />
                          </div>
                        </div>
                        <div className="status-item">
                          <div className="status-info">
                            <p className="status-name">Closed</p>
                            <p className="status-count">{stats.byStatus.closed}</p>
                          </div>
                          <div className="status-bar">
                            <div
                              className="status-bar-fill"
                              style={{
                                width: `${(stats.byStatus.closed / stats.total) * 100}%`,
                                backgroundColor: '#8b5cf6'
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="card full-width">
                <div className="card-header">
                  <h2>Recent Submissions</h2>
                </div>

                {/* Filters */}
                <div className="table-filters">
                  <div className="filter-group">
                    <Filter size={16} />
                    <select
                      value={filters.status}
                      onChange={(e) => {
                        setFilters({ ...filters, status: e.target.value });
                        setCurrentPage(1);
                      }}
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
                    <Filter size={16} />
                    <select
                      value={filters.formType}
                      onChange={(e) => {
                        setFilters({ ...filters, formType: e.target.value });
                        setCurrentPage(1);
                      }}
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
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={filters.search}
                      onChange={(e) => {
                        setFilters({ ...filters, search: e.target.value });
                        setCurrentPage(1);
                      }}
                      className="filter-input"
                    />
                  </div>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="table-loading">Loading...</div>
                ) : submissions.length === 0 ? (
                  <div className="table-empty">No submissions found</div>
                ) : (
                  <>
                    <div className="table-wrapper">
                      <table className="dashboard-table">
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
                              <td className="truncate">{submission.subject || '-'}</td>
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
                              <td>{formatDateShort(submission.createdAt)}</td>
                              <td>
                                <div className="action-buttons-inline">
                                  <button
                                    onClick={() => openReplyModal(submission)}
                                    className="action-btn-small action-btn-primary"
                                    title="Reply"
                                  >
                                    <Send size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(submission._id)}
                                    className="action-btn-small action-btn-danger"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="table-pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>

                      <div className="pagination-info">
                        Page {currentPage} of {totalPages || 1}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <div className="card full-width">
              <div className="card-header">
                <h2>Sitemap Ping History</h2>
                <div className="seo-header-actions">
                  <button
                    className="btn-primary"
                    onClick={handleManualSitemapPing}
                    disabled={pingingSitemap}
                  >
                    <Globe size={16} />
                    {pingingSitemap ? 'Pinging...' : 'Ping Sitemap'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleRetryFailedNow}
                    disabled={retryingFailed || seoQueueSummary.queuedCount === 0}
                  >
                    {retryingFailed ? 'Retrying...' : 'Retry Failed'}
                  </button>
                </div>
              </div>

              <div className="seo-summary">
                <span className="seo-chip">
                  <Clock size={14} />
                  Queued: {seoQueueSummary.queuedCount}
                </span>
                <span className="seo-chip">
                  <Mail size={14} />
                  Exhausted: {seoQueueSummary.exhaustedCount}
                </span>
              </div>

              {seoPingLogs.length === 0 ? (
                <div className="empty-message">No sitemap ping activity yet</div>
              ) : (
                <div className="seo-logs-grid">
                  {seoPingLogs.map((item) => (
                    <div key={item._id} className="seo-card">
                      <div className="seo-card-header">
                        <div>
                          {(() => {
                            const totalTargets = Math.max(
                              0,
                              item.totalTargets ?? (Array.isArray(item.results) ? item.results.length : 0)
                            );
                            if (totalTargets === 0) {
                              return (
                                <>
                                  <span className={`seo-badge ${getSeoStatusBadgeClass(item)}`}>
                                    Modern mode
                                  </span>
                                  <p className="seo-card-title">No external ping targets</p>
                                </>
                              );
                            }

                            return (
                              <>
                                <span className={`seo-badge ${getSeoStatusBadgeClass(item)}`}>
                                  {item.success ? 'Success' : 'Failed'}
                                </span>
                                <p className="seo-card-title">
                                  {item.successCount}/{totalTargets} engines
                                </p>
                              </>
                            );
                          })()}
                        </div>
                        <button
                          onClick={() =>
                            setExpandedSeoLogId((prev) => (prev === item._id ? '' : item._id))
                          }
                          className="seo-expand-btn"
                        >
                          {expandedSeoLogId === item._id ? 'Hide' : 'Details'}
                        </button>
                      </div>

                      <div className="seo-card-body">
                        <p className="seo-card-desc">
                          {item.triggerType === 'auto' ? '🤖 Auto' : '👤 Manual'}{' '}
                          {item.reason ? `- ${item.reason}` : ''}
                        </p>
                        <p className="seo-card-time">{formatDate(item.createdAt)}</p>
                        {item.retryStatus && (
                          <span className="seo-retry-badge">Retry: {item.retryStatus}</span>
                        )}
                      </div>

                      {expandedSeoLogId === item._id && (
                        <div className="seo-card-details">
                          {(item.results || []).map((result, index) => (
                            <div key={`${item._id}-result-${index}`} className="seo-result">
                              <div className="seo-result-header">
                                <strong>{getEngineLabel(result.url)}</strong>
                                <span className={result.ok ? 'seo-ok' : 'seo-error'}>
                                  {result.ok ? '✓ OK' : '✗ Error'}
                                </span>
                              </div>
                              <p className="seo-result-url">{result.url}</p>
                              <p className="seo-result-code">HTTP {result.statusCode || 0}</p>
                              {result.error && (
                                <p className="seo-result-error">{result.error}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Reply Modal */}
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
                <p>
                  <strong>From:</strong> {selectedSubmission.email}
                </p>
                <p>
                  <strong>Subject:</strong> {selectedSubmission.subject}
                </p>
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
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeReplyModal} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSendReply} disabled={sendingReply} className="btn-primary">
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
