import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pencil, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from '../../components/ui/sonner';
import { getAuthHeaders } from '../../utils/auth';
import SEO from '../../components/SEO';

const AdminBlogs = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/blogs?limit=50`, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        navigate('/admin/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.message || 'Failed to load blogs');
      }
    } catch (_error) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Blog deleted');
        fetchBlogs();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (_error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="admin-blog-page">
      <SEO title="Admin Blogs" description="Manage blog posts" />

      <div className="admin-blog-header">
        <h1>Blog Manager</h1>
        <div className="admin-blog-actions">
          <Link className="btn-secondary" to="/admin/dashboard">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <Link className="btn-primary" to="/admin/blog/new">
            <Plus size={16} /> New Blog
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="empty-state">No blog posts found</div>
      ) : (
        <div className="admin-blog-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td>{blog.category}</td>
                  <td>
                    <span className={`status-badge-${blog.status === 'published' ? 'replied' : 'progress'}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions-inline">
                      <button className="action-btn btn-edit" onClick={() => navigate(`/admin/blog/edit/${blog._id}`)}>
                        <Pencil size={15} />
                      </button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(blog._id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
