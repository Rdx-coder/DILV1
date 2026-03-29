import React from 'react';
import { Shield, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { mockData } from '../mock';

const Transparency = () => {
  return (
    <div className="page-container">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Transparency & Ethics</h1>
          <p className="page-subtitle">
            Building trust through complete openness in our operations and commitment to ethical practices
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">Our Commitment to Transparency</h2>
              <p className="content-text">
                At Dangi Innovation Lab, transparency isn't just a value—it's the foundation of everything we do. 
                We believe that community trust must be earned through consistent openness, ethical operations, 
                and accountability.
              </p>
              <p className="content-text">
                Every rupee, every decision, and every process is documented and made accessible to our community. 
                We operate with the understanding that we are stewards of community resources and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Principles */}
      <section className="principles-section">
        <div className="container">
          <h2 className="section-title-center">Our Transparency Principles</h2>
          <div className="principles-grid">
            {mockData.transparencyPrinciples.map((principle) => (
              <div key={principle.id} className="principle-card">
                <Shield size={32} className="principle-icon-main" />
                <h3 className="principle-card-title">{principle.title}</h3>
                <p className="principle-card-description">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fund Usage */}
      <section className="fund-usage-section">
        <div className="container">
          <h2 className="section-title-center">How Funds Are Used</h2>
          <div className="fund-content">
            <p className="fund-intro">
              Every donation and resource is allocated with careful consideration and complete transparency. 
              Here's how we use community support:
            </p>
            <div className="fund-categories">
              <div className="fund-category">
                <div className="fund-icon">
                  <DollarSign size={28} />
                </div>
                <div className="fund-details">
                  <h3 className="fund-title">Program Delivery (60%)</h3>
                  <p className="fund-description">
                    Direct support for participants including learning resources, digital tools, and program materials
                  </p>
                </div>
              </div>
              <div className="fund-category">
                <div className="fund-icon">
                  <DollarSign size={28} />
                </div>
                <div className="fund-details">
                  <h3 className="fund-title">Platform & Technology (25%)</h3>
                  <p className="fund-description">
                    Maintaining our digital infrastructure, communication tools, and online learning platforms
                  </p>
                </div>
              </div>
              <div className="fund-category">
                <div className="fund-icon">
                  <DollarSign size={28} />
                </div>
                <div className="fund-details">
                  <h3 className="fund-title">Operations & Documentation (10%)</h3>
                  <p className="fund-description">
                    Essential administrative costs, legal compliance, and transparent record-keeping
                  </p>
                </div>
              </div>
              <div className="fund-category">
                <div className="fund-icon">
                  <DollarSign size={28} />
                </div>
                <div className="fund-details">
                  <h3 className="fund-title">Future Reserve (5%)</h3>
                  <p className="fund-description">
                    Sustainable growth and emergency support for participants in need
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Operations */}
      <section className="ethics-section">
        <div className="container">
          <h2 className="section-title-center">Our Ethical Framework</h2>
          <div className="ethics-content">
            <div className="ethics-card">
              <FileText size={32} className="ethics-icon" />
              <h3 className="ethics-title">Documented Selection Criteria</h3>
              <p className="ethics-text">
                All program selections follow clear, documented criteria that prioritize merit, need, and 
                community alignment. No favoritism, no backdoor entries—just fair evaluation.
              </p>
              <ul className="ethics-list">
                <li>Written application reviews</li>
                <li>Standardized evaluation rubrics</li>
                <li>Multiple reviewer consensus</li>
                <li>Documented decision rationale</li>
              </ul>
            </div>
            <div className="ethics-card">
              <CheckCircle size={32} className="ethics-icon" />
              <h3 className="ethics-title">Zero Cash Transactions</h3>
              <p className="ethics-text">
                We never handle physical cash. All financial transactions are digital, traceable, and documented 
                through legitimate banking and payment channels.
              </p>
              <ul className="ethics-list">
                <li>Digital payment systems only</li>
                <li>Complete transaction records</li>
                <li>Third-party audit trails</li>
                <li>Publicly accessible summaries</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Public Reporting */}
      <section className="reporting-section">
        <div className="container">
          <h2 className="content-heading">Public Reporting Approach</h2>
          <p className="content-text">
            We believe in proactive transparency. Rather than waiting for questions, we regularly share:
          </p>
          <div className="reporting-items">
            <div className="reporting-item">
              <h4 className="reporting-title">Quarterly Updates</h4>
              <p className="reporting-text">
                Detailed reports on program activities, participant progress, fund usage, and organizational decisions
              </p>
            </div>
            <div className="reporting-item">
              <h4 className="reporting-title">Financial Statements</h4>
              <p className="reporting-text">
                Complete breakdowns of income, expenses, and fund allocation with supporting documentation
              </p>
            </div>
            <div className="reporting-item">
              <h4 className="reporting-title">Impact Metrics</h4>
              <p className="reporting-text">
                Data on participant outcomes, program effectiveness, and long-term community impact
              </p>
            </div>
            <div className="reporting-item">
              <h4 className="reporting-title">Governance Records</h4>
              <p className="reporting-text">
                Meeting minutes, policy decisions, and organizational governance documentation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust-Based Operations */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-content">
            <h2 className="content-heading">Building Community Trust</h2>
            <p className="content-text">
              Trust is our most valuable asset. We earn it by:
            </p>
            <div className="trust-principles">
              <div className="trust-principle">
                <span className="trust-number">01</span>
                <div>
                  <h4 className="trust-title">Doing What We Say</h4>
                  <p className="trust-text">
                    Our commitments match our actions. No empty promises or misleading claims.
                  </p>
                </div>
              </div>
              <div className="trust-principle">
                <span className="trust-number">02</span>
                <div>
                  <h4 className="trust-title">Admitting Mistakes</h4>
                  <p className="trust-text">
                    When we err, we acknowledge it publicly and explain how we'll improve.
                  </p>
                </div>
              </div>
              <div className="trust-principle">
                <span className="trust-number">03</span>
                <div>
                  <h4 className="trust-title">Inviting Scrutiny</h4>
                  <p className="trust-text">
                    We welcome questions, audits, and community oversight of our operations.
                  </p>
                </div>
              </div>
              <div className="trust-principle">
                <span className="trust-number">04</span>
                <div>
                  <h4 className="trust-title">Prioritizing Community</h4>
                  <p className="trust-text">
                    Every decision puts community needs and wellbeing above organizational convenience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Questions */}
      <section className="questions-section">
        <div className="container">
          <div className="questions-content">
            <h2 className="content-heading">Have Questions?</h2>
            <p className="content-text">
              We believe in open dialogue. If you have questions about our operations, fund usage, or any 
              aspect of DIL, please don't hesitate to reach out. Transparency means being accessible and 
              responsive to community inquiries.
            </p>
            <a href="mailto:transparency@dangiinnovationlab.org" className="btn-primary">
              Contact Us About Transparency
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Transparency;
