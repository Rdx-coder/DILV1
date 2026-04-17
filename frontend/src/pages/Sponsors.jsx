import React, { useEffect, useMemo, useState } from 'react';
import SEO from '../components/SEO';
import SponsorLogoCard from '../components/catalog/SponsorLogoCard';
import { showcaseApi } from '../utils/showcaseApi';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tier, setTier] = useState('All');
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await showcaseApi.getSponsors();
        setSponsors(payload.data || []);
      } catch (err) {
        console.error('Error loading sponsors:', err);
        setSponsors([]);
        setError('Unable to load sponsors right now.');
      } finally {
        setLoading(false);
      }
    };

    loadSponsors();
  }, []);

  const tiers = useMemo(() => ['All', ...new Set(sponsors.map((item) => item.tier).filter(Boolean))], [sponsors]);
  const filteredSponsors = useMemo(() => (
    tier === 'All' ? sponsors : sponsors.filter((item) => item.tier === tier)
  ), [sponsors, tier]);

  return (
    <div className="page-container">
      <SEO
        title="Our Sponsors | Dangi Innovation Lab"
        description="Meet the sponsors and partners supporting Dangi Innovation Lab."
        url={`${FRONTEND_URL}/sponsors`}
        canonical={`${FRONTEND_URL}/sponsors`}
      />

      <section className="page-header showcase-page-hero sponsor-page-hero">
        <div className="container">
          <p className="showcase-subtitle">Our ecosystem</p>
          <h1 className="page-title">Our Sponsors & Partners</h1>
          <p className="page-subtitle">
            Organizations and collaborators who help our programs, research, and product work move faster with trust.
          </p>
        </div>
      </section>

      <section className="showcase-toolbar-section">
        <div className="container">
          <div className="showcase-toolbar">
            <div className="showcase-chip-group" role="tablist" aria-label="Sponsor tiers">
              {tiers.map((tierName) => (
                <button
                  key={tierName}
                  type="button"
                  className={`showcase-filter-chip${tier === tierName ? ' active' : ''}`}
                  onClick={() => setTier(tierName)}
                >
                  {tierName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-section">
        <div className="container">
          {loading ? (
            <div className="sponsor-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`sponsor-loading-${index}`} className="showcase-card showcase-skeleton sponsor-skeleton" aria-hidden="true">
                  <div className="showcase-skeleton-logo"></div>
                  <div className="showcase-skeleton-line"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state-card">
              <h3 className="empty-state-title">Unable to load sponsors</h3>
              <p className="empty-state-description">{error}</p>
            </div>
          ) : filteredSponsors.length === 0 ? (
            <div className="empty-state-card">
              <h3 className="empty-state-title">No sponsors in this tier yet</h3>
              <p className="empty-state-description">Choose another tier or check back as new partners are published.</p>
            </div>
          ) : (
            <div className="sponsor-grid">
              {filteredSponsors.map((sponsor) => (
                <SponsorLogoCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sponsors;
