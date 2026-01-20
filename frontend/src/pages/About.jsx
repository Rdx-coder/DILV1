import React from 'react';
import { Target, Eye, Heart, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="page-container">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">About Dangi Innovation Lab</h1>
          <p className="page-subtitle">
            A community-driven movement empowering the next generation of innovators and leaders
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">Who We Are</h2>
              <p className="content-text">
                Dangi Innovation Lab (DIL) is a non-profit organization founded on the belief that every member 
                of our community deserves access to quality education, mentorship, and opportunities to innovate.
              </p>
              <p className="content-text">
                We operate as a 100% digital-first platform, connecting students, young professionals, and innovators 
                from the Dangi community across India, Nepal, and around the world with experienced mentors and 
                advisors who are committed to giving back.
              </p>
              <p className="content-text">
                Our approach is simple: combine structured programs with personalized mentorship to unlock potential 
                and create lasting impact. We believe in transparency, ethical operations, and putting community needs first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="vm-section">
        <div className="container">
          <div className="vm-grid">
            <div className="vm-card">
              <div className="vm-icon">
                <Eye size={40} />
              </div>
              <h3 className="vm-title">Our Vision</h3>
              <p className="vm-text">
                To build a globally empowered Dangi community where every individual has access to education, 
                innovation opportunities, and the support needed to achieve their full potential.
              </p>
            </div>

            <div className="vm-card">
              <div className="vm-icon">
                <Target size={40} />
              </div>
              <h3 className="vm-title">Our Mission</h3>
              <p className="vm-text">
                To provide structured mentorship, innovation programs, and global connections that enable 
                community members to pursue higher education, build startups, conduct research, and create 
                meaningful social impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why DIL Exists */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">Why We Exist</h2>
              <p className="content-text">
                Despite having talent and ambition, many members of our community lack access to the resources, 
                networks, and guidance needed to pursue their goals. Traditional educational and professional 
                pathways often feel out of reach.
              </p>
              <p className="content-text">
                DIL was created to bridge this gap. We provide:
              </p>
              <ul className="content-list">
                <li>Structured programs that make complex goals achievable</li>
                <li>Access to mentors who understand your journey</li>
                <li>A supportive community of peers and advisors</li>
                <li>Transparent operations you can trust</li>
                <li>Digital-first approach that reaches everyone, everywhere</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Community-Driven Philosophy */}
      <section className="philosophy-section">
        <div className="container">
          <h2 className="section-title-center">Our Philosophy</h2>
          <div className="philosophy-grid">
            <div className="philosophy-card">
              <div className="philosophy-icon">
                <Heart size={32} />
              </div>
              <h3 className="philosophy-title">Community First</h3>
              <p className="philosophy-text">
                Every decision prioritizes the needs and growth of community members
              </p>
            </div>

            <div className="philosophy-card">
              <div className="philosophy-icon">
                <Globe size={32} />
              </div>
              <h3 className="philosophy-title">Global Perspective</h3>
              <p className="philosophy-text">
                Local roots with a commitment to world-class standards and opportunities
              </p>
            </div>

            <div className="philosophy-card">
              <div className="philosophy-icon">
                <Target size={32} />
              </div>
              <h3 className="philosophy-title">Impact Over Scale</h3>
              <p className="philosophy-text">
                We measure success by meaningful outcomes, not numbers alone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operating Model */}
      <section className="content-section">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2 className="content-heading">Our Operating Model</h2>
              <p className="content-text">
                DIL operates as a 100% online platform, ensuring accessibility and scalability without 
                compromising on quality or personal connection.
              </p>
              <div className="model-features">
                <div className="model-feature">
                  <h4 className="model-feature-title">Digital-First Delivery</h4>
                  <p className="model-feature-text">
                    All programs, mentorship sessions, and resources are delivered online, making them 
                    accessible to anyone with an internet connection.
                  </p>
                </div>
                <div className="model-feature">
                  <h4 className="model-feature-title">Transparent Operations</h4>
                  <p className="model-feature-text">
                    No cash handling, documented processes, and regular public reporting ensure complete 
                    accountability to our community.
                  </p>
                </div>
                <div className="model-feature">
                  <h4 className="model-feature-title">Volunteer-Driven</h4>
                  <p className="model-feature-text">
                    Our mentors and advisors contribute their time and expertise voluntarily, ensuring 
                    resources go directly to programs and participants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Long-term Impact */}
      <section className="impact-section">
        <div className="container">
          <h2 className="section-title-center">Long-Term Impact Goals</h2>
          <div className="impact-content">
            <p className="impact-text">
              Our vision extends beyond individual success stories. We aim to:
            </p>
            <div className="impact-goals">
              <div className="impact-goal">
                <span className="impact-number">01</span>
                <p className="impact-goal-text">
                  Create a self-sustaining ecosystem where successful alumni mentor the next generation
                </p>
              </div>
              <div className="impact-goal">
                <span className="impact-number">02</span>
                <p className="impact-goal-text">
                  Build global recognition for Dangi community members in education, innovation, and leadership
                </p>
              </div>
              <div className="impact-goal">
                <span className="impact-number">03</span>
                <p className="impact-goal-text">
                  Establish best practices for community-driven nonprofit innovation that others can replicate
                </p>
              </div>
              <div className="impact-goal">
                <span className="impact-number">04</span>
                <p className="impact-goal-text">
                  Strengthen connections within the global Dangi diaspora through shared purpose and collaboration
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
