import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react';

const Support = () => {
  return (
    <div className="page-container">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Support Our Mission</h1>
          <p className="page-subtitle">
            Help us empower the next generation of innovators and leaders from the Dangi community
          </p>
        </div>
      </section>

      {/* Why Support */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">Why Your Support Matters</h2>
              <p className="content-text">
                Every contribution to Dangi Innovation Lab directly impacts the lives of students, young professionals, 
                and innovators in our community. Your support enables us to provide high-quality mentorship, 
                learning resources, and opportunities that would otherwise be out of reach.
              </p>
              <p className="content-text">
                Unlike traditional nonprofits with high overhead costs, DIL operates with a 100% volunteer mentorship 
                model, ensuring that your contribution goes directly to programs and participants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Areas */}
      <section className="impact-areas-section">
        <div className="container">
          <h2 className="section-title-center">How Your Donation Helps</h2>
          <div className="impact-areas-grid">
            <div className="impact-area-card">
              <div className="impact-area-icon">
                <Users size={36} />
              </div>
              <h3 className="impact-area-title">Program Access</h3>
              <p className="impact-area-text">
                Enable talented individuals from underprivileged backgrounds to access our 6-month innovation cycles
              </p>
            </div>
            <div className="impact-area-card">
              <div className="impact-area-icon">
                <TrendingUp size={36} />
              </div>
              <h3 className="impact-area-title">Learning Resources</h3>
              <p className="impact-area-text">
                Provide participants with essential learning materials, software licenses, and educational tools
              </p>
            </div>
            <div className="impact-area-card">
              <div className="impact-area-icon">
                <Shield size={36} />
              </div>
              <h3 className="impact-area-title">Platform Operations</h3>
              <p className="impact-area-text">
                Maintain our digital infrastructure and tools that connect mentors with participants globally
              </p>
            </div>
            <div className="impact-area-card">
              <div className="impact-area-icon">
                <Heart size={36} />
              </div>
              <h3 className="impact-area-title">Emergency Support</h3>
              <p className="impact-area-text">
                Create a safety net for participants facing unexpected challenges during their program journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Funds Are Used */}
      <section className="fund-breakdown-section">
        <div className="container">
          <h2 className="section-title-center">Complete Transparency</h2>
          <p className="fund-breakdown-intro">
            We believe donors deserve to know exactly how their contributions are used. Here's our commitment:
          </p>
          <div className="fund-breakdown-list">
            <div className="fund-breakdown-item">
              <div className="breakdown-percentage">60%</div>
              <div className="breakdown-details">
                <h4 className="breakdown-title">Direct Program Support</h4>
                <p className="breakdown-text">
                  Learning resources, tools, and materials for participants
                </p>
              </div>
            </div>
            <div className="fund-breakdown-item">
              <div className="breakdown-percentage">25%</div>
              <div className="breakdown-details">
                <h4 className="breakdown-title">Technology & Platform</h4>
                <p className="breakdown-text">
                  Digital infrastructure, communication tools, and platform maintenance
                </p>
              </div>
            </div>
            <div className="fund-breakdown-item">
              <div className="breakdown-percentage">10%</div>
              <div className="breakdown-details">
                <h4 className="breakdown-title">Operations</h4>
                <p className="breakdown-text">
                  Administrative costs, legal compliance, and documentation
                </p>
              </div>
            </div>
            <div className="fund-breakdown-item">
              <div className="breakdown-percentage">5%</div>
              <div className="breakdown-details">
                <h4 className="breakdown-title">Reserve Fund</h4>
                <p className="breakdown-text">
                  Emergency support and sustainable growth initiatives
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Philosophy */}
      <section className="philosophy-support-section">
        <div className="container">
          <h2 className="content-heading">Our Ethical Funding Philosophy</h2>
          <div className="philosophy-points">
            <div className="philosophy-point">
              <h4 className="philosophy-point-title">No Cash Handling</h4>
              <p className="philosophy-point-text">
                All donations are processed through secure, traceable digital payment systems. We never handle physical cash.
              </p>
            </div>
            <div className="philosophy-point">
              <h4 className="philosophy-point-title">100% Documented</h4>
              <p className="philosophy-point-text">
                Every rupee is tracked, documented, and reported in our quarterly transparency reports.
              </p>
            </div>
            <div className="philosophy-point">
              <h4 className="philosophy-point-title">Community Recognition</h4>
              <p className="philosophy-point-text">
                With your permission, we acknowledge donors in our community reports (anonymous options available).
              </p>
            </div>
            <div className="philosophy-point">
              <h4 className="philosophy-point-title">Public Reporting</h4>
              <p className="philosophy-point-text">
                Regular updates on how donations are used and the impact they create in our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Support */}
      <section className="ways-support-section">
        <div className="container">
          <h2 className="section-title-center">Ways to Support</h2>
          <div className="ways-grid">
            <div className="way-card">
              <h3 className="way-title">Financial Contribution</h3>
              <p className="way-text">
                Make a one-time or recurring donation to support our programs and operations.
              </p>
            </div>
            <div className="way-card">
              <h3 className="way-title">Become a Mentor</h3>
              <p className="way-text">
                Contribute your time and expertise by mentoring program participants.
              </p>
            </div>
            <div className="way-card">
              <h3 className="way-title">Spread the Word</h3>
              <p className="way-text">
                Share DIL's mission with your network and help us reach more community members.
              </p>
            </div>
            <div className="way-card">
              <h3 className="way-title">Corporate Partnership</h3>
              <p className="way-text">
                Partner with us for CSR initiatives or employee mentorship programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="support-cta-section">
        <div className="container">
          <div className="support-cta-content">
            <h2 className="cta-title">Ready to Make an Impact?</h2>
            <p className="cta-description">
              For donation inquiries or to discuss partnership opportunities, please contact us. 
              Together, we can create lasting change in our community.
            </p>
            <div className="support-cta-buttons">
              <Link to="/contact" className="btn-primary">
                Contact Us About Donations <ArrowRight size={20} />
              </Link>
              <Link to="/transparency" className="btn-secondary">
                View Our Transparency Report
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
