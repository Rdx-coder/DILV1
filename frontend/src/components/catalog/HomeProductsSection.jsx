import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { showcaseApi } from '../../utils/showcaseApi';

const HomeProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await showcaseApi.getProducts({ limit: 6 });
        setProducts(payload.data || []);
      } catch (err) {
        console.error('Error loading home products:', err);
        setProducts([]);
        setError('Unable to load products right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="showcase-section">
      <div className="container">
        <div className="showcase-section-header">
          <div>
            <p className="showcase-subtitle">Built by Dangi Innovation Lab</p>
            <h2 className="section-title">Our Products</h2>
          </div>
          <Link to="/products" className="btn-secondary">See all products</Link>
        </div>

        {loading ? (
          <div className="showcase-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`product-skeleton-${index}`} className="showcase-card showcase-skeleton" aria-hidden="true">
                <div className="showcase-skeleton-image"></div>
                <div className="showcase-skeleton-line wide"></div>
                <div className="showcase-skeleton-line"></div>
                <div className="showcase-skeleton-line short"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state-card">
            <h3 className="empty-state-title">Products are loading behind the scenes</h3>
            <p className="empty-state-description">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state-card">
            <h3 className="empty-state-title">Our next builds are on the way</h3>
            <p className="empty-state-description">New projects will appear here as soon as they are ready to share.</p>
          </div>
        ) : (
          <div className="showcase-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeProductsSection;
