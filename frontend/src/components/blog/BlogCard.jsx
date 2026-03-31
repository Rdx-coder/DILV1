import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
    // Generate excerpt if not provided
    const getExcerpt = () => {
      if (blog.excerpt) return blog.excerpt;
      // Remove HTML tags and get first 150 characters
      const cleanText = blog.content?.replace(/<[^>]*>/g, ' ').trim() || '';
      const excerpt = cleanText.substring(0, 150);
      return excerpt.length < cleanText.length ? excerpt + '...' : excerpt;
    };

    const getReadingTime = () => {
      if (Number(blog.readingTime) > 0) return blog.readingTime;
      const text = (blog.content || blog.excerpt || '').replace(/<[^>]*>/g, ' ').trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      return Math.max(1, Math.ceil(words / 200));
    };

    const thumbnailFallback = `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2c3316"/><stop offset="100%" stop-color="#1a1c1b"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="#d9fb06" font-size="52" font-family="Arial, sans-serif">Dangi Innovation Lab</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#f3f8df" font-size="28" font-family="Arial, sans-serif">Blog Update</text></svg>'
    )}`;

    const imageSrc = blog.coverImage || thumbnailFallback;

  return (
    <article className="blog-card">
      <Link to={`/blog/${blog.slug}`}>
        <img
          className="blog-card-image"
          src={imageSrc}
          alt={blog.coverImageAlt || blog.title}
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span>{blog.category}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span>{getReadingTime()} min read</span>
        </div>

        <h3 className="blog-card-title">
          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="blog-card-excerpt">{getExcerpt()}</p>

        <div className="blog-card-tags">
          {(blog.tags || []).slice(0, 3).map((tag) => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="tag-chip tag-chip-link"
              aria-label={`Filter posts by tag ${tag}`}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
