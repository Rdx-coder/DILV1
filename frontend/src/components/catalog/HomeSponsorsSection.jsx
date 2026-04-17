import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SponsorLogoCard from './SponsorLogoCard';
import { showcaseApi } from '../../utils/showcaseApi';

const HomeSponsorsSection = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <section className="showcase-section sponsors-home-section">
      <div className="container">
        <div className="showcase-section-header">
          <div>
            <p className="showcase-subtitle">Trusted collaborators</p>
            <h2 className="section-title">Our Sponsors & Partners</h2>
          </div>
          <Link to="/sponsors" className="btn-secondary">View all sponsors</Link>
        </div>

        {loading ? (
          <div className="sponsor-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`sponsor-skeleton-${index}`} className="showcase-card showcase-skeleton sponsor-skeleton" aria-hidden="true">
                <div className="showcase-skeleton-logo"></div>
                <div className="showcase-skeleton-line"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state-card">
            <h3 className="empty-state-title">Sponsor logos are temporarily unavailable</h3>
            <p className="empty-state-description">{error}</p>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="empty-state-card">
            <h3 className="empty-state-title">Partnerships will appear here soon</h3>
            <p className="empty-state-description">We are actively onboarding sponsors, collaborators, and ecosystem partners.</p>
          </div>
        ) : (
          <div className="sponsor-grid">
            {sponsors.map((sponsor) => (
              <SponsorLogoCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeSponsorsSection;
