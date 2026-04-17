import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const truncate = (value = '', maxLength = 120) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
};

const ProductCard = ({ product, compact = false }) => {
  const imageAlt = product.imageAlt || product.title;

  return (
    <article className={`showcase-card product-card${compact ? ' compact' : ''}`}>
      <Link to={`/products/${product.slug}`} className="product-card-image-link" aria-label={`View ${product.title}`}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={imageAlt}
            className="product-card-image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="product-card-image product-card-image-fallback" aria-hidden="true">
            <span>{product.title}</span>
          </div>
        )}
      </Link>

      <div className="product-card-content">
        <p className="showcase-eyebrow">Built by Dangi Innovation Lab</p>
        <h3 className="product-card-title">
          <Link to={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        <p className="product-card-description">{truncate(product.description || '', compact ? 90 : 120)}</p>
        <div className="product-card-actions">
          <Link to={`/products/${product.slug}`} className="btn-secondary">
            Explore Details
          </Link>
          {product.projectUrl ? (
            <a
              href={product.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              View Project <ExternalLink size={16} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
