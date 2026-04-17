import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { showcaseApi } from '../utils/showcaseApi';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await showcaseApi.getProductBySlug(slug);
        setProduct(payload.data || null);
      } catch (err) {
        console.error('Error loading product detail:', err);
        setProduct(null);
        setError('We could not find that product.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const pageUrl = `${FRONTEND_URL}/products/${slug}`;

  return (
    <div className="page-container">
      {product ? (
        <SEO
          title={`${product.title} | Dangi Innovation Lab`}
          description={product.description}
          url={pageUrl}
          canonical={pageUrl}
          image={product.imageUrl}
          type="article"
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: product.title,
            description: product.description,
            image: product.imageUrl,
            url: pageUrl,
            publisher: {
              '@type': 'Organization',
              name: 'Dangi Innovation Lab'
            }
          }}
        />
      ) : null}

      <section className="showcase-detail-section">
        <div className="container">
          {loading ? (
            <div className="showcase-detail-card showcase-skeleton">
              <div className="showcase-skeleton-image tall"></div>
              <div className="showcase-skeleton-line wide"></div>
              <div className="showcase-skeleton-line"></div>
              <div className="showcase-skeleton-line"></div>
            </div>
          ) : error || !product ? (
            <div className="empty-state-card">
              <h3 className="empty-state-title">Product not found</h3>
              <p className="empty-state-description">{error || 'This product is unavailable right now.'}</p>
              <Link to="/products" className="btn-secondary">Back to products</Link>
            </div>
          ) : (
            <article className="showcase-detail-card">
              <Link to="/products" className="showcase-back-link">Back to all products</Link>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.imageAlt || product.title}
                  className="showcase-detail-image"
                  loading="eager"
                />
              ) : null}
              <div className="showcase-detail-body">
                <p className="showcase-subtitle">Built by Dangi Innovation Lab</p>
                <h1 className="showcase-detail-title">{product.title}</h1>
                <p className="showcase-detail-description">{product.fullDescription || product.description}</p>
                <div className="showcase-detail-meta">
                  <span>Published {new Date(product.createdAt).toLocaleDateString()}</span>
                  <span>Status: {product.status}</span>
                </div>
                <div className="showcase-detail-actions">
                  <a
                    href={product.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    View Project <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
