import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  return (
    <article className="blog-card">
      {blog.coverImage ? (
        <Link to={`/blog/${blog.slug}`}>
          <img className="blog-card-image" src={blog.coverImage} alt={blog.coverImageAlt || blog.title} loading="lazy" />
        </Link>
      ) : null}

      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span>{blog.category}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span>{blog.readingTime} min read</span>
        </div>

        <h3 className="blog-card-title">
          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h3>

        <p className="blog-card-excerpt">{blog.excerpt}</p>

        <div className="blog-card-tags">
          {(blog.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">#{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
