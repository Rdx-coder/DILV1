import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import slugify from 'slugify';
import { toast } from '../../components/ui/sonner';
import { getAuthHeaders, getToken } from '../../utils/auth';
import SEO from '../../components/SEO';
import BlogEditor from '../../components/blog/BlogEditor';

const makeSlug = (value = '') =>
  slugify(value, { lower: true, strict: true, trim: true });

const isMeaningfulHtml = (html = '') => {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 0;
};

const isHttpUrl = (value = '') => /^https?:\/\//i.test(value.trim());

const AdminBlogEditor = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    coverImageAlt: '',
    tags: '',
    category: '',
    author: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!isEdit) return;

    const fetchBlog = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/blog/${id}`, {
          headers: getAuthHeaders()
        });

        if (res.status === 401) {
          navigate('/admin/login');
          return;
        }

        const data = await res.json();
        if (!data.success) {
          toast.error(data.message || 'Failed to load blog');
          return;
        }

        const blog = data.blog;
        setForm({
          title: blog.title || '',
          slug: blog.slug || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          coverImage: blog.coverImage || '',
          coverImageAlt: blog.coverImageAlt || '',
          tags: (blog.tags || []).join(', '),
          category: blog.category || '',
          author: blog.author || '',
          status: blog.status || 'draft',
          seoTitle: blog.seoTitle || '',
          seoDescription: blog.seoDescription || ''
        });
        setSlugEdited(Boolean(blog.slug));
        setImagePreview(blog.coverImage || '');
      } catch (_error) {
        toast.error('Failed to load blog');
      }
    };

    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const computedSlug = useMemo(() => makeSlug(form.title), [form.title]);

  useEffect(() => {
    if (slugEdited) return;
    setForm((prev) => ({ ...prev, slug: makeSlug(prev.title) }));
  }, [form.title, slugEdited]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (event) => {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: makeSlug(event.target.value) }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    // File upload will be sent together with blog payload as multipart FormData on submit.
    setForm((prev) => ({ ...prev, coverImage: '' }));
  };

  const handleCoverImageUrlChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, coverImage: value }));
    if (value.trim()) {
      setImagePreview(value.trim());
      setImageFile(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    if (!isMeaningfulHtml(form.content)) {
      toast.error('Content cannot be empty');
      return;
    }

    const hasCoverImage = Boolean(imageFile || form.coverImage.trim());
    if (form.status === 'published' && hasCoverImage && !form.coverImageAlt.trim()) {
      toast.error('Cover image alt text is required when publishing with a cover image');
      return;
    }

    const safeCoverImage = isHttpUrl(form.coverImage) ? form.coverImage.trim() : '';

    const payload = {
      ...form,
      slug: form.slug || computedSlug,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      coverImage: safeCoverImage
    };

    const endpoint = isEdit ? `${BACKEND_URL}/api/admin/blog/${id}` : `${BACKEND_URL}/api/admin/blog`;

    try {
      setSaving(true);

      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('slug', payload.slug);
        formData.append('content', payload.content);
        formData.append('excerpt', payload.excerpt || '');
        formData.append('category', payload.category);
        formData.append('author', payload.author || '');
        formData.append('status', payload.status || 'draft');
        formData.append('seoTitle', payload.seoTitle || '');
        formData.append('seoDescription', payload.seoDescription || '');
        formData.append('tags', JSON.stringify(payload.tags || []));
        formData.append('coverImageUrl', payload.coverImage || '');
        formData.append('coverImageAlt', payload.coverImageAlt || '');
        formData.append('coverImageFile', imageFile);

        res = await fetch(endpoint, {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${getToken()}`
          },
          body: formData
        });
      } else {
        res = await fetch(endpoint, {
          method: isEdit ? 'PUT' : 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }

      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch (_error) {
        data = {
          success: false,
          message: raw || `Request failed with status ${res.status}`
        };
      }

      if (res.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      if (data.success) {
        toast.success(isEdit ? 'Blog updated' : 'Blog created');
        navigate('/admin/blogs');
      } else {
        const validationMessage = Array.isArray(data.errors)
          ? data.errors.map((item) => `${item.field}: ${item.message}`).join(' | ')
          : '';
        toast.error(validationMessage || data.message || 'Publish failed');
      }
    } catch (error) {
      console.error('[BLOG_SUBMIT] Request failed:', error);
      toast.error(error.message || 'Network error while publishing blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-blog-editor-page">
      <SEO title={isEdit ? 'Edit Blog' : 'Create Blog'} description="Admin blog editor" />

      <div className="admin-blog-header">
        <h1>{isEdit ? 'Edit Blog' : 'Create Blog'}</h1>
        <div className="admin-blog-actions">
          <Link className="btn-secondary" to="/admin/blogs">
            <ArrowLeft size={16} /> Back
          </Link>
          <button className="btn-secondary" type="button" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={16} /> {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
        </div>
      </div>

      <form className="blog-editor-grid" onSubmit={handleSave}>
        <div className="blog-editor-main">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleFieldChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug</label>
            <input
              className="form-input"
              name="slug"
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="auto-generated-from-title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <BlogEditor
              value={form.content}
              backendUrl={BACKEND_URL}
              onChange={(value) => setForm({ ...form, content: value })}
            />
          </div>

          {showPreview ? (
            <div className="blog-preview">
              <h2>Preview</h2>
              <div dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
          ) : null}
        </div>

        <div className="blog-editor-side">
          <div className="form-group">
            <label className="form-label">Cover Image Upload</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="form-input" />
            {imageFile ? <small>Selected file: {imageFile.name}</small> : null}
            {imagePreview ? <img src={imagePreview} alt="Cover" className="cover-preview" /> : null}
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input
              className="form-input"
              name="coverImage"
              value={form.coverImage}
              onChange={handleCoverImageUrlChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image Alt Text</label>
            <input
              className="form-input"
              name="coverImageAlt"
              value={form.coverImageAlt}
              onChange={handleFieldChange}
              placeholder="Describe the cover image for screen readers and SEO"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              className="form-input"
              name="category"
              value={form.category}
              onChange={handleFieldChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              className="form-input"
              name="tags"
              value={form.tags}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Author</label>
            <input
              className="form-input"
              name="author"
              value={form.author}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Excerpt</label>
            <textarea
              className="form-input"
              name="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Title</label>
            <input
              className="form-input"
              name="seoTitle"
              value={form.seoTitle}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Description</label>
            <textarea
              className="form-input"
              name="seoDescription"
              rows={3}
              value={form.seoDescription}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              name="status"
              value={form.status}
              onChange={handleFieldChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Blog' : 'Create Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEditor;
