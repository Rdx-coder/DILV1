import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import TeamCard from '../components/TeamCard';
import SEO from '../components/SEO';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'https://dangiinnovationlab.com';

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/team`);
      const data = await response.json();

      if (data.success) {
        setTeamMembers(data.data || []);
      } else {
        setError('Failed to load team members');
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Error loading team data');
    } finally {
      setLoading(false);
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Team - DIL Innovation Lab',
    description: 'Meet the talented team members and coordinators at Dangi Innovation Lab',
    url: `${FRONTEND_URL}/team`,
    publisher: {
      '@type': 'Organization',
      name: 'DIL Innovation Lab',
      logo: {
        '@type': 'ImageObject',
        url: `${FRONTEND_URL}/logo.png`
      }
    },
    hasPart: teamMembers.map(member => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
      description: member.bio,
      image: member.image?.url || '/images/team-placeholder.jpg',
      url: member.social?.portfolio || undefined,
      sameAs: [
        member.social?.linkedin,
        member.social?.portfolio,
        member.social?.email ? `mailto:${member.social.email}` : undefined
      ].filter(Boolean)
    }))
  };

  return (
    <>
      <SEO
        title="Team - DIL Innovation Lab | Meet Our Coordinators & Members"
        description="Discover the talented team members and coordinators driving innovation at Dangi Innovation Lab. Learn about their expertise and connect with them."
        keywords="team, coordinators, members, innovation, DIL, experts"
        url={`${FRONTEND_URL}/team`}
        image={`${FRONTEND_URL}/og-team.jpg`}
        type="website"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <main className="team-page">
        {/* Hero Section */}
        <section className="team-hero">
          <div className="container">
            <div className="team-hero-content">
              <h1 className="team-hero-title">Meet Our Team</h1>
              <p className="team-hero-subtitle">
                Get to know the brilliant minds behind Dangi Innovation Lab
              </p>
            </div>
          </div>
        </section>

        {/* Team Grid Section */}
        <section className="team-section">
          <div className="container">
            {loading ? (
              <div className="team-loading">
                <div className="spinner"></div>
                <p>Loading team members...</p>
              </div>
            ) : error ? (
              <div className="team-error">
                <p>{error}</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="team-empty">
                <p>Team members coming soon!</p>
              </div>
            ) : (
              <div className="team-grid">
                {teamMembers.map((member) => (
                  <TeamCard key={member._id} member={member} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="team-cta">
          <div className="container">
            <div className="cta-content">
              <h2>Want to Join Our Team?</h2>
              <p>We're always looking for passionate innovators and problem solvers.</p>
              <a href="/contact" className="cta-button">
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>

    </>
  );
};

export default Team;
