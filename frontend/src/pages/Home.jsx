import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Lightbulb, GraduationCap, TrendingUp } from 'lucide-react';
import { mockData } from '../mock';

const Home = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img 
            src="https://images.pexels.com/photos/7437499/pexels-photo-7437499.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            alt="Community collaboration"
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Building a globally empowered Dangi community
          </h1>
          <p className="hero-subtitle">
            Through innovation, education, and leadership
          </p>
          <div className="hero-buttons">
            <Link to="/programs" className="btn-primary">
              Apply for Programs
            </Link>
            <Link to="/mentorship" className="btn-secondary">
              Become a Mentor
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="intro-section">
        <div className="container">
          <div className="intro-content">
            <h2 className="section-title">Welcome to Dangi Innovation Lab</h2>
            <p className="intro-text">
              Dangi Innovation Lab (DIL) is a non-profit, community-driven innovation and education organization 
              dedicated to empowering the Dangi community worldwide. Operating as a 100% digital-first platform, 
              we connect students, innovators, and professionals across India, Nepal, and beyond.
            </p>
            <p className="intro-text">
              Our mission is simple: to unlock potential through structured mentorship, innovation programs, 
              and a global network of changemakers who believe in collective growth.
            </p>
          </div>
        </div>
      </section>

      {/* Core Focus Areas */}
      <section className="focus-section">
        <div className="container">
          <h2 className="section-title-center">Our Core Focus Areas</h2>
          <div className="focus-grid">
            <div className="focus-card">
              <div className="focus-icon">
                <GraduationCap size={32} />
              </div>
              <h3 className="focus-title">Education</h3>
              <p className="focus-description">
                Personalized learning pathways and guidance for higher education opportunities globally
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <Lightbulb size={32} />
              </div>
              <h3 className="focus-title">Innovation</h3>
              <p className="focus-description">
                Foster creative problem-solving and breakthrough ideas through structured programs
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <TrendingUp size={32} />
              </div>
              <h3 className="focus-title">Startups</h3>
              <p className="focus-description">
                Transform ideas into viable ventures with mentorship and strategic guidance
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <Users size={32} />
              </div>
              <h3 className="focus-title">Community</h3>
              <p className="focus-description">
                Build a global network of professionals committed to collective growth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title-center">How DIL Works</h2>
          <div className="how-content">
            <div className="how-card">
              <div className="how-number">01</div>
              <h3 className="how-title">Online-First Model</h3>
              <p className="how-description">
                All programs, mentorship sessions, and resources are delivered digitally, ensuring accessibility 
                for community members worldwide.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">02</div>
              <h3 className="how-title">6-Month Innovation Cycles</h3>
              <p className="how-description">
                Structured programs that combine learning, mentorship, and practical application to achieve 
                meaningful outcomes.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">03</div>
              <h3 className="how-title">Global Mentorship Network</h3>
              <p className="how-description">
                Connect with experienced professionals and advisors who provide guidance tailored to your goals.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">04</div>
              <h3 className="how-title">Transparent & Ethical</h3>
              <p className="how-description">
                Community-driven governance with complete transparency in operations, fund usage, and decision-making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.studentsServed}+</div>
              <div className="stat-label">Students Served</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.mentors}+</div>
              <div className="stat-label">Active Mentors</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.activeProjects}+</div>
              <div className="stat-label">Active Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{mockData.stats.communities}+</div>
              <div className="stat-label">Global Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-description">
              Join a community of innovators, learners, and changemakers committed to collective growth.
            </p>
            <div className="cta-buttons">
              <Link to="/programs" className="btn-primary">
                Explore Programs <ArrowRight size={20} />
              </Link>
              <Link to="/support" className="btn-secondary">
                Support Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
