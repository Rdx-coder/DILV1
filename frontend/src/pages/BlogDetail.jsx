import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';

const BlogDetail = () => {
  const { slug } = useParams();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/blog/${slug}`);
        const data = await res.json();

        if (data.success) {
          setBlog(data.blog);
          setRelatedPosts(data.relatedPosts || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [BACKEND_URL, slug]);

  const safeHtml = useMemo(
    () => DOMPurify.sanitize(blog?.content || ''),
    [blog?.content]
  );

  const readingTime = useMemo(() => {
    if (Number(blog?.readingTime) > 0) return blog.readingTime;
    const text = String(blog?.content || blog?.excerpt || '').replace(/<[^>]*>/g, ' ').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }, [blog?.content, blog?.excerpt, blog?.readingTime]);

  const displayExcerpt = useMemo(() => {
    if (blog?.excerpt) return blog.excerpt;
    const text = String(blog?.content || '').replace(/<[^>]*>/g, ' ').trim();
    const trimmed = text.slice(0, 180);
    return trimmed.length < text.length ? `${trimmed}...` : trimmed;
  }, [blog?.content, blog?.excerpt]);

  const currentUrl = `${window.location.origin}/blog/${slug}`;
  const shareText = encodeURIComponent(blog?.title || 'Dangi Innovation Lab Blog');
  const encodedUrl = encodeURIComponent(currentUrl);

  if (loading) {
    return <div className="container empty-state">Loading blog...</div>;
  }

  if (!blog) {
    return <div className="container empty-state">Blog not found</div>;
  }

  return (
    <article className="blog-detail-page container">
      <SEO
        title={blog.seoTitle || blog.title}
        description={blog.seoDescription || blog.excerpt}
        image={blog.ogImageUrl || blog.coverImage}
        url={currentUrl}
        canonical={currentUrl}
        type="article"
        publishedTime={blog.createdAt}
        modifiedTime={blog.updatedAt || blog.createdAt}
        keywords={Array.isArray(blog.tags) ? blog.tags.join(', ') : ''}
        author={blog.author}
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: window.location.origin
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Blog',
                  item: `${window.location.origin}/blog`
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: blog.title,
                  item: currentUrl
                }
              ]
            },
            {
              '@type': 'BlogPosting',
              headline: blog.seoTitle || blog.title,
              description: blog.seoDescription || blog.excerpt,
              image: blog.coverImage,
              author: {
                '@type': 'Person',
                name: blog.author
              },
              publisher: {
                '@type': 'Organization',
                name: 'Dangi Innovation Lab'
              },
              datePublished: blog.createdAt,
              dateModified: blog.updatedAt || blog.createdAt,
              articleSection: blog.category,
              keywords: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
              wordCount: String((blog.content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length),
              mainEntityOfPage: currentUrl
            }
          ]
        }}
      />

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumbs-sep">/</span>
        <Link to="/blog">Blog</Link>
        <span className="breadcrumbs-sep">/</span>
        <span className="breadcrumbs-current">{blog.title}</span>
      </nav>

      <header className="blog-detail-header">
        <p className="blog-detail-meta">
          <span>{blog.category}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span>{blog.author}</span>
          <span>{readingTime} min read</span>
        </p>
        <h1>{blog.title}</h1>
        <p className="blog-detail-excerpt">{displayExcerpt}</p>
        {Array.isArray(blog.tags) && blog.tags.length > 0 ? (
          <div className="blog-detail-tags">
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className="tag-chip tag-chip-link"
                aria-label={`View posts tagged ${tag}`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {blog.coverImage ? (
        <img
          src={blog.coverImage}
          alt={blog.coverImageAlt || blog.title}
          className="blog-detail-cover"
          loading="lazy"
          decoding="async"
        />
      ) : null}

      <div className="blog-share-row">
        <a
          className="btn-secondary"
          href={`https://wa.me/?text=${shareText}%20${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          Share on WhatsApp
        </a>
        <a
          className="btn-secondary"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          Share on Facebook
        </a>
        <a
          className="btn-secondary"
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          Share on Twitter
        </a>
        <a
          className="btn-secondary"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          Share on LinkedIn
        </a>
      </div>

      <section className="blog-detail-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />

      <section className="blog-related">
        <h2>Related Posts</h2>
        {relatedPosts.length === 0 ? (
          <p>No related posts found.</p>
        ) : (
          <div className="blog-related-list">
            {relatedPosts.map((item) => (
              <Link key={item._id} to={`/blog/${item.slug}`} className="related-card">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.coverImageAlt || item.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div>
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </article>
  );
};

export default BlogDetail;
