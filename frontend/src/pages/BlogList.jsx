import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import BlogCard from '../components/blog/BlogCard';

const BlogList = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });

  const filters = useMemo(() => ({
    page: Number(searchParams.get('page') || 1),
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    search: searchParams.get('search') || ''
  }), [searchParams]);

  const hasFilter = Boolean(filters.category || filters.tag || filters.search || filters.page > 1);
  const listCanonical = `${window.location.origin}/blog`;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(filters.page),
          limit: '6',
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.tag ? { tag: filters.tag } : {}),
          ...(filters.search ? { search: filters.search } : {})
        });

        const res = await fetch(`${BACKEND_URL}/api/blogs?${query.toString()}`);
        const data = await res.json();

        if (data.success) {
          setBlogs(data.blogs);
          setCategories(data.categories || []);
          setMeta({ page: data.page, pages: data.pages });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [BACKEND_URL, filters]);

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
        />

        <select
          className="form-input"
          value={filters.category}
          onChange={(e) => updateFilter({ category: e.target.value, page: 1 })}
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
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="empty-state">No blogs found for selected filters</div>
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
          disabled={meta.page <= 1}
          onClick={() => updateFilter({ page: meta.page - 1 })}
        >
          Previous
        </button>

        <span>Page {meta.page} of {meta.pages}</span>

        <button
          className="btn-secondary"
          disabled={meta.page >= meta.pages}
          onClick={() => updateFilter({ page: meta.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogList;
