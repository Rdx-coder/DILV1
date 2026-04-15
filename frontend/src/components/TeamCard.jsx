import React, { useMemo, useState } from 'react';
import { Linkedin, Mail, Globe, Github } from 'lucide-react';

const TeamCard = ({ member }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
  const assetBase = (BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/api\/?$/, '').replace(/\/$/, '');
  const fallbackAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#3f4816"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#d9fb06" font-size="42" font-family="Arial, sans-serif">Team Member</text></svg>'
  )}`;

  const resolveImageUrl = (url) => {
    if (!url) return fallbackAvatar;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith('/uploads') && assetBase) {
          return `${assetBase}${parsed.pathname}`;
        }
      } catch (_err) {
        return url;
      }
      return url;
    }
    if (url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads') && assetBase) {
      return `${assetBase}${url}`;
    }
    if (url.startsWith('uploads/') && assetBase) {
      return `${assetBase}/${url}`;
    }
    return url;
  };

  const imageSrc = resolveImageUrl(member.image?.url);
  const fullBio = String(member.bio || '').trim();
  const shouldTruncateBio = fullBio.length > 150;
  const bioPreview = useMemo(() => {
    if (!shouldTruncateBio) return fullBio;
    return `${fullBio.slice(0, 150).trim()}...`;
  }, [fullBio, shouldTruncateBio]);

  return (
    <div className="team-card">
      <div className="team-card-image-wrapper">
        <img
          src={imageSrc}
          alt={member.image?.altText || member.name}
          className="team-card-image"
          loading="lazy"
          decoding="async"
        />
        <div className="team-card-overlay">
          <div className="team-card-social">
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link linkedin"
                title="LinkedIn Profile"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            )}
            {member.social?.email && (
              <a
                href={`mailto:${member.social.email}`}
                className="social-link email"
                title="Send Email"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            )}
            {member.social?.github && (
              <a
                href={member.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link github"
                title="GitHub"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            )}
            {member.social?.portfolio && (
              <a
                href={member.social.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link portfolio"
                title="Portfolio"
                aria-label="Portfolio"
              >
                <Globe size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="team-card-content">
        <h3 className="team-card-name">{member.name}</h3>
        <p className="team-card-role">{member.role}</p>
        {fullBio ? (
          <>
            <p className="team-card-bio">{isBioExpanded ? fullBio : bioPreview}</p>
            {shouldTruncateBio ? (
              <button
                type="button"
                className="team-bio-toggle"
                onClick={() => setIsBioExpanded((prev) => !prev)}
                aria-label={isBioExpanded ? 'Show shorter bio' : 'Show full bio'}
              >
                {isBioExpanded ? 'Show less' : 'Read full bio'}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TeamCard;
