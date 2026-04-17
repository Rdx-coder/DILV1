import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/catalog/ProductCard';
import SEO from '../components/SEO';
import { showcaseApi } from '../utils/showcaseApi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await showcaseApi.getProducts();
        setProducts(payload.data || []);
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
        setError('Unable to load products at the moment.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((product) =>
      [product.title, product.description, product.fullDescription]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [products, search]);

  return (
    <div className="page-container">
      <SEO
        title="Our Products | Dangi Innovation Lab"
        description="Explore the innovation portfolio built by Dangi Innovation Lab, from prototypes to production-ready projects."
        url={`${FRONTEND_URL}/products`}
        canonical={`${FRONTEND_URL}/products`}
      />

      <section className="page-header showcase-page-hero">
        <div className="container">
          <p className="showcase-subtitle">Built by Dangi Innovation Lab</p>
          <h1 className="page-title">Innovations We Build</h1>
          <p className="page-subtitle">
            A growing portfolio of products shaped through community-led research, engineering, and rapid iteration.
          </p>
        </div>
      </section>

      <section className="showcase-toolbar-section">
        <div className="container">
          <div className="showcase-toolbar">
            <input
              type="search"
              className="form-input showcase-search"
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
            <div className="showcase-filter-chip" aria-label="Current filter">All active products</div>
          </div>
        </div>
      </section>

      <section className="showcase-section">
        <div className="container">
          {loading ? (
            <div className="showcase-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`products-loading-${index}`} className="showcase-card showcase-skeleton" aria-hidden="true">
                  <div className="showcase-skeleton-image"></div>
                  <div className="showcase-skeleton-line wide"></div>
                  <div className="showcase-skeleton-line"></div>
                  <div className="showcase-skeleton-line short"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state-card">
              <h3 className="empty-state-title">Unable to load products</h3>
              <p className="empty-state-description">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state-card">
              <h3 className="empty-state-title">{products.length === 0 ? 'No products published yet' : 'No products match your search'}</h3>
              <p className="empty-state-description">
                {products.length === 0
                  ? 'Once new innovation projects are published, they will appear here.'
                  : 'Try another keyword to explore more of the portfolio.'}
              </p>
            </div>
          ) : (
            <div className="showcase-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
