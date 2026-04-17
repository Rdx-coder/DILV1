import React from 'react';
import { ExternalLink } from 'lucide-react';

const SponsorLogoCard = ({ sponsor }) => {
  return (
    <a
      href={sponsor.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="showcase-card sponsor-card"
      aria-label={`Visit ${sponsor.name}`}
    >
      <div className="sponsor-card-logo-wrap">
        {sponsor.logoUrl ? (
          <img
            src={sponsor.logoUrl}
            alt={sponsor.logoAlt || sponsor.name}
            className="sponsor-card-logo"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="sponsor-card-logo sponsor-card-logo-fallback" aria-hidden="true">
            {sponsor.name}
          </div>
        )}
      </div>
      <div className="sponsor-card-content">
        <p className="showcase-eyebrow">{sponsor.tier || 'Partner'}</p>
        <h3>{sponsor.name}</h3>
        <span className="sponsor-card-link">
          Visit website <ExternalLink size={14} />
        </span>
      </div>
    </a>
  );
};

export default SponsorLogoCard;
