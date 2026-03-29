import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, GraduationCap, Microscope, Code, Users, ArrowRight, CheckCircle, Clock, Target } from 'lucide-react';
import { mockData } from '../mock';

const Programs = () => {
  const iconMap = {
    Rocket: Rocket,
    GraduationCap: GraduationCap,
    Microscope: Microscope,
    Code: Code,
    Users: Users
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Our Programs</h1>
          <p className="page-subtitle">
            Structured 6-month innovation cycles designed to transform your goals into reality
          </p>
        </div>
      </section>

      {/* Program Overview */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">The 6-Month Innovation Cycle</h2>
              <p className="content-text">
                Our flagship program is a comprehensive 6-month journey that combines structured learning, 
                personalized mentorship, and practical application. Each cycle is designed to take you from 
                where you are to where you want to be.
              </p>
              <div className="program-features">
                <div className="program-feature">
                  <CheckCircle size={24} className="feature-icon" />
                  <div>
                    <h4 className="feature-title">Personalized Roadmaps</h4>
                    <p className="feature-text">Custom plans aligned with your goals and current situation</p>
                  </div>
                </div>
                <div className="program-feature">
                  <CheckCircle size={24} className="feature-icon" />
                  <div>
                    <h4 className="feature-title">Expert Mentorship</h4>
                    <p className="feature-text">Regular guidance from experienced professionals in your field</p>
                  </div>
                </div>
                <div className="program-feature">
                  <CheckCircle size={24} className="feature-icon" />
                  <div>
                    <h4 className="feature-title">Learning Resources</h4>
                    <p className="feature-text">Curated materials and structured curriculum for skill building</p>
                  </div>
                </div>
                <div className="program-feature">
                  <CheckCircle size={24} className="feature-icon" />
                  <div>
                    <h4 className="feature-title">Community Support</h4>
                    <p className="feature-text">Connect with peers on similar journeys for collaboration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Tracks */}
      <section className="programs-section">
        <div className="container">
          <h2 className="section-title-center">Program Tracks</h2>
          <div className="programs-grid">
            {mockData.programs.map((program) => {
              const IconComponent = iconMap[program.icon];
              return (
                <div key={program.id} className="program-card">
                  <div className="program-icon">
                    <IconComponent size={36} />
                  </div>
                  <h3 className="program-title">{program.title}</h3>
                  <p className="program-description">{program.description}</p>
                  <div className="program-duration">
                    <Clock size={16} />
                    <span>{program.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="eligibility-section">
        <div className="container">
          <h2 className="section-title-center">Who Can Apply?</h2>
          <div className="eligibility-content">
            <div className="eligibility-card">
              <Target size={32} className="eligibility-icon" />
              <h3 className="eligibility-title">Primary Eligibility</h3>
              <ul className="eligibility-list">
                <li>Members of the Dangi community (priority)</li>
                <li>Age 16 and above</li>
                <li>Committed to 6-month program duration</li>
                <li>Access to internet and basic computer skills</li>
                <li>Clear goals and willingness to learn</li>
              </ul>
            </div>
            <div className="eligibility-card">
              <Users size={32} className="eligibility-icon" />
              <h3 className="eligibility-title">Community-Priority Policy</h3>
              <p className="eligibility-text">
                DIL prioritizes members of the Dangi community in all program selections. We believe in 
                strengthening our community first while remaining open to collaboration with like-minded 
                individuals who share our values.
              </p>
              <p className="eligibility-text">
                Limited spots may be available for non-community members in exceptional cases, based on 
                alignment with our mission and available capacity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Provided */}
      <section className="support-section">
        <div className="container">
          <h2 className="section-title-center">What You'll Receive</h2>
          <div className="support-grid">
            <div className="support-item">
              <h4 className="support-title">Mentorship</h4>
              <p className="support-text">
                One-on-one guidance from experienced professionals who understand your journey and goals
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Roadmaps</h4>
              <p className="support-text">
                Personalized action plans with clear milestones and checkpoints throughout the 6 months
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Learning Programs</h4>
              <p className="support-text">
                Structured curriculum and resources tailored to your track and learning style
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Digital Funding Support</h4>
              <p className="support-text">
                Guidance on accessing scholarships, grants, and funding opportunities (where applicable)
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Global Exposure</h4>
              <p className="support-text">
                Connect with international advisors and opportunities beyond geographical boundaries
              </p>
            </div>
            <div className="support-item">
              <h4 className="support-title">Community Network</h4>
              <p className="support-text">
                Lifetime access to our alumni network and community of innovators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Begin Your Journey?</h2>
            <p className="cta-description">
              Applications for the next cohort open soon. Join a community committed to your growth.
            </p>
            <Link to="/contact" className="btn-primary">
              Apply Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Programs;
