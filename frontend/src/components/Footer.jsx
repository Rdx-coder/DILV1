import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3 className="footer-heading">Dangi Innovation Lab</h3>
            <p className="footer-text">
              Building a globally empowered Dangi community through innovation, education, and leadership.
            </p>
            <div className="footer-social">
              <a href="mailto:contact@dangiinnovationlab.org" className="social-link" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-subheading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/mentorship">Mentorship</Link></li>
              <li><Link to="/transparency">Transparency</Link></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div className="footer-section">
            <h4 className="footer-subheading">Get Involved</h4>
            <ul className="footer-links">
              <li><Link to="/programs">Apply for Programs</Link></li>
              <li><Link to="/mentorship">Become a Mentor</Link></li>
              <li><Link to="/support">Support Our Mission</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-subheading">Connect</h4>
            <p className="footer-text">100% Digital, Global Platform</p>
            <p className="footer-text">Serving India & Nepal</p>
            <p className="footer-text">
              <a href="mailto:contact@dangiinnovationlab.org" className="footer-email">
                contact@dangiinnovationlab.org
              </a>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Dangi Innovation Lab. All rights reserved.
          </p>
          <p className="footer-nonprofit">
            A 100% Community-Driven Non-Profit Organization
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
