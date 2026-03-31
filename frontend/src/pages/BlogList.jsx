import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import BlogCard from '../components/blog/BlogCard';

const BlogList = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [retryNonce, setRetryNonce] = useState(0);

  const filters = useMemo(() => ({
    page: Number(searchParams.get('page') || 1),
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    search: searchParams.get('search') || ''
  }), [searchParams]);

  const hasFilter = Boolean(filters.category || filters.tag || filters.search || filters.page > 1);
  const listCanonical = `${window.location.origin}/blog`;
  const quickTags = useMemo(() => {
    const counts = new Map();
    blogs.forEach((item) => {
      (item.tags || []).forEach((tag) => {
        const nextCount = (counts.get(tag) || 0) + 1;
        counts.set(tag, nextCount);
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [blogs]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError('');

      if (!BACKEND_URL || !/^https?:\/\//i.test(BACKEND_URL)) {
        setBlogs([]);
        setCategories([]);
        setMeta({ page: 1, pages: 1 });
        setError('Blog service URL is not configured. Please check your environment setup.');
        setLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams({
          page: String(filters.page),
          limit: '6',
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.tag ? { tag: filters.tag } : {}),
          ...(filters.search ? { search: filters.search } : {})
        });

        const res = await fetch(`${BACKEND_URL}/api/blogs?${query.toString()}`);
        if (!res.ok) {
          throw new Error(`Unable to fetch blog posts (HTTP ${res.status}).`);
        }

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || 'Unable to fetch blog posts right now.');
        }

        setBlogs(data.blogs || []);
        setCategories(data.categories || []);
        setMeta({ page: data.page || 1, pages: data.pages || 1 });
      } catch (err) {
        setBlogs([]);
        setCategories([]);
        setMeta({ page: 1, pages: 1 });
        setError(err?.message || 'Failed to fetch blog posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [BACKEND_URL, filters, retryNonce]);

  const updateFilter = (next) => {
    const merged = { ...filters, ...next };
    const params = {
      ...(merged.page > 1 ? { page: String(merged.page) } : {}),
      ...(merged.category ? { category: merged.category } : {}),
      ...(merged.tag ? { tag: merged.tag } : {}),
      ...(merged.search ? { search: merged.search } : {})
    };
    setSearchParams(params);
  };

  return (
    <div className="blog-list-page container">
      <SEO
        title="Blog | Dangi Innovation Lab"
        description="Read latest insights, updates, and stories from Dangi Innovation Lab"
        url={listCanonical}
        canonical={listCanonical}
        noIndex={hasFilter}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Dangi Innovation Lab Blog',
          url: listCanonical,
          description: 'Latest blog posts from Dangi Innovation Lab.',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: blogs.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${window.location.origin}/blog/${item.slug}`,
              name: item.title
            }))
          }
        }}
      />

      <section className="page-header">
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">Insights, stories and practical guidance for students and builders</p>
      </section>

      <div className="blog-filters">
        <input
          className="form-input"
          placeholder="Search blog posts..."
          value={filters.search}
          onChange={(e) => updateFilter({ search: e.target.value, page: 1 })}
                  aria-label="Search blog posts"
        />

        <select
          className="form-input"
          value={filters.category}
          onChange={(e) => updateFilter({ category: e.target.value, page: 1 })}
                  aria-label="Filter blog posts by category"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <input
          className="form-input"
          placeholder="Filter by tag"
          value={filters.tag}
          onChange={(e) => updateFilter({ tag: e.target.value, page: 1 })}
                  aria-label="Filter blog posts by tag"
        />
      </div>

      {(filters.search || filters.category || filters.tag) ? (
        <div className="active-filter-row" aria-label="Active blog filters">
          {filters.search ? (
            <button type="button" className="tag-chip tag-chip-link" onClick={() => updateFilter({ search: '', page: 1 })}>
              Search: {filters.search} x
            </button>
          ) : null}
          {filters.category ? (
            <button type="button" className="tag-chip tag-chip-link" onClick={() => updateFilter({ category: '', page: 1 })}>
              Category: {filters.category} x
            </button>
          ) : null}
          {filters.tag ? (
            <button type="button" className="tag-chip tag-chip-link" onClick={() => updateFilter({ tag: '', page: 1 })}>
              Tag: #{filters.tag} x
            </button>
          ) : null}
        </div>
      ) : null}

      {quickTags.length > 0 ? (
        <div className="blog-quick-tags" aria-label="Popular tags">
          {quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-chip tag-chip-link"
              onClick={() => updateFilter({ tag, page: 1 })}
            >
              #{tag}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="blog-grid" aria-label="Loading blog posts">
          {Array.from({ length: 6 }).map((_, index) => (
            <article key={`blog-skeleton-${index}`} className="blog-card blog-card-skeleton" aria-hidden="true">
              <div className="blog-card-image skeleton-box"></div>
              <div className="blog-card-content">
                <div className="skeleton-line skeleton-subtitle"></div>
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line skeleton-short"></div>
              </div>
            </article>
          ))}
        </div>
      ) : error ? (
        <div className="empty-state-card" role="alert">
          <h3 className="empty-state-title">Unable to load blog posts</h3>
          <p className="empty-state-description">{error}</p>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setRetryNonce((prev) => prev + 1)}
          >
            Retry
          </button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="empty-state-card" role="status">
          <h3 className="empty-state-title">No blogs found</h3>
          <p className="empty-state-description">Try changing your search, category, or tag filters to discover more posts.</p>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => updateFilter({ page: 1, category: '', tag: '', search: '' })}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}

      <div className="blog-pagination">
        <button
          className="btn-secondary"
          disabled={Boolean(error) || meta.page <= 1}
          onClick={() => updateFilter({ page: meta.page - 1 })}
                  aria-label="Previous page"
        >
          Previous
        </button>

        <span>Page {meta.page} of {meta.pages}</span>

        <button
          className="btn-secondary"
          disabled={Boolean(error) || meta.page >= meta.pages}
          onClick={() => updateFilter({ page: meta.page + 1 })}
                  aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogList;
