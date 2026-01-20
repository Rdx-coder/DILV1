import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Globe, TrendingUp, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { mockData } from '../mock';

const Mentorship = () => {
  return (
    <div className="page-container">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Mentorship & Community</h1>
          <p className="page-subtitle">
            Connect with experienced professionals and a global network committed to collective growth
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">The Power of Mentorship</h2>
              <p className="content-text">
                At the heart of DIL is our mentorship model. We believe that guidance from someone who has 
                walked your path can accelerate your growth and help you avoid common pitfalls.
              </p>
              <p className="content-text">
                Our mentors are professionals from around the world who volunteer their time because they 
                believe in community empowerment. They bring real-world experience, industry insights, and 
                genuine commitment to your success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Benefits */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title-center">What Mentorship Provides</h2>
          <div className="benefits-grid">
            {mockData.mentorshipBenefits.map((benefit) => (
              <div key={benefit.id} className="benefit-card">
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role of Mentors */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">The Role of Our Mentors</h2>
              <p className="content-text">
                Our mentors serve as guides, advisors, and supporters throughout your 6-month journey. They:
              </p>
              <ul className="content-list">
                <li>Provide one-on-one guidance tailored to your goals</li>
                <li>Share insights from their professional experience</li>
                <li>Help you navigate challenges and make informed decisions</li>
                <li>Connect you with relevant opportunities and resources</li>
                <li>Review your progress and provide constructive feedback</li>
                <li>Support your long-term career and personal development</li>
              </ul>
              <p className="content-text">
                All mentorship is provided voluntarily, with mentors dedicating their time because they 
                believe in the mission of community empowerment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Collaboration */}
      <section className="collaboration-section">
        <div className="container">
          <h2 className="section-title-center">Community Collaboration Model</h2>
          <div className="collaboration-grid">
            <div className="collaboration-card">
              <Globe size={32} className="collaboration-icon" />
              <h3 className="collaboration-title">Global Network</h3>
              <p className="collaboration-text">
                Connect with Dangi community members and allies worldwide, creating a support system 
                that transcends geographical boundaries.
              </p>
            </div>
            <div className="collaboration-card">
              <MessageCircle size={32} className="collaboration-icon" />
              <h3 className="collaboration-title">Peer Learning</h3>
              <p className="collaboration-text">
                Collaborate with fellow program participants, share experiences, and learn from each 
                other's journeys and challenges.
              </p>
            </div>
            <div className="collaboration-card">
              <Heart size={32} className="collaboration-icon" />
              <h3 className="collaboration-title">Alumni Network</h3>
              <p className="collaboration-text">
                Join a growing community of successful alumni who continue to support and mentor 
                the next generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inclusion Policy */}
      <section className="inclusion-section">
        <div className="container">
          <div className="inclusion-content">
            <h2 className="content-heading">Our Inclusion Policy</h2>
            <p className="content-text">
              DIL operates with a community-priority approach. This means:
            </p>
            <div className="inclusion-principles">
              <div className="inclusion-principle">
                <UserCheck size={24} className="principle-icon" />
                <div>
                  <h4 className="principle-title">Community First</h4>
                  <p className="principle-text">
                    Members of the Dangi community receive priority in program selection and resource allocation
                  </p>
                </div>
              </div>
              <div className="inclusion-principle">
                <Globe size={24} className="principle-icon" />
                <div>
                  <h4 className="principle-title">Open Collaboration</h4>
                  <p className="principle-text">
                    We welcome like-minded individuals who share our values and want to contribute to community growth
                  </p>
                </div>
              </div>
              <div className="inclusion-principle">
                <TrendingUp size={24} className="principle-icon" />
                <div>
                  <h4 className="principle-title">Merit and Need</h4>
                  <p className="principle-text">
                    Decisions are based on potential, commitment, and alignment with program goals
                  </p>
                </div>
              </div>
            </div>
            <p className="content-text">
              This approach ensures we strengthen our community while remaining open to meaningful 
              collaboration with others who share our vision.
            </p>
          </div>
        </div>
      </section>

      {/* Become a Mentor */}
      <section className="become-mentor-section">
        <div className="container">
          <div className="become-mentor-content">
            <h2 className="section-title-center">Become a Mentor</h2>
            <p className="become-mentor-text">
              If you're an experienced professional who wants to give back to the community, we'd love to 
              have you join our mentorship network. Your knowledge and guidance can transform lives.
            </p>
            <div className="mentor-requirements">
              <h3 className="requirements-title">What We Look For:</h3>
              <ul className="requirements-list">
                <li>Professional experience in relevant fields</li>
                <li>Commitment to dedicate 2-4 hours per month</li>
                <li>Genuine interest in community empowerment</li>
                <li>Patience and willingness to guide others</li>
                <li>Alignment with DIL's values and mission</li>
              </ul>
            </div>
            <div className="mentor-cta">
              <Link to="/contact" className="btn-primary">
                Apply to Become a Mentor <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits of Contributing */}
      <section className="contribution-section">
        <div className="container">
          <h2 className="section-title-center">Benefits of Mentoring</h2>
          <div className="contribution-grid">
            <div className="contribution-item">
              <h4 className="contribution-title">Make Real Impact</h4>
              <p className="contribution-text">
                Directly influence someone's career trajectory and life journey
              </p>
            </div>
            <div className="contribution-item">
              <h4 className="contribution-title">Stay Connected</h4>
              <p className="contribution-text">
                Maintain strong ties with your community and global network
              </p>
            </div>
            <div className="contribution-item">
              <h4 className="contribution-title">Learn and Grow</h4>
              <p className="contribution-text">
                Gain fresh perspectives and insights from mentee interactions
              </p>
            </div>
            <div className="contribution-item">
              <h4 className="contribution-title">Build Legacy</h4>
              <p className="contribution-text">
                Create lasting change that extends beyond your direct involvement
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Mentorship;
