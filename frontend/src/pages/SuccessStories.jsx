import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const SuccessStories = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const pageUrl = `${window.location.origin}/success-stories`;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/blogs?category=success-story&limit=20`);
        const data = await res.json();
        if (data.success && data.blogs) {
          setStories(data.blogs);
        }
      } catch (_error) {
        console.error('Failed to fetch success stories:', _error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    if (BACKEND_URL) {
      fetchStories();
    }
  }, [BACKEND_URL]);

  return (
    <div className="page-container">
      <SEO
        title="Success Stories | Dangi Innovation Lab"
        description="Explore success stories from Dangi Innovation Lab participants across mentorship, scholarships, and startup programs."
        url={pageUrl}
        canonical={pageUrl}
      />

      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Success Stories</h1>
          <p className="page-subtitle">
            Real outcomes from learners, builders, and mentors in the DIL community.
          </p>
        </div>
      </section>

      <section className="success-stories-section">
        <div className="container">
          {loading ? (
            <div className="empty-state-card" role="status">
              <h3 className="empty-state-title">Loading stories...</h3>
              <p className="empty-state-description">Fetching success stories from the community.</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="empty-state-card" role="status">
              <h3 className="empty-state-title">No success stories yet</h3>
              <p className="empty-state-description">Check back soon for inspiring stories from our community.</p>
            </div>
          ) : (
            <div className="success-stories-grid">
              {stories.map((story) => (
                <article key={story._id} className="success-story-card">
                  {story.coverImage && (
                    <img
                      src={story.coverImage}
                      alt={story.coverImageAlt || story.title}
                      className="success-story-image"
                    />
                  )}
                  <div className="success-story-content">
                    <h2 className="success-story-name">{story.title}</h2>
                    <p className="success-story-excerpt">{story.excerpt}</p>
                    <div className="success-story-meta">
                      <span className="success-story-author">{story.author}</span>
                      <span className="success-story-date">
                        {new Date(story.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${story.slug}`}
                      className="success-story-read-more"
                    >
                      Read Full Story →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SuccessStories;
