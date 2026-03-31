import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Linkedin, Twitter, Facebook } from 'lucide-react';
import { withCsrfHeaders } from '../utils/csrf';
import { notify } from '../utils/notify';

const Footer = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    const email = newsletterEmail.trim();

    if (!email) {
      notify.error('Please enter your email.');
      return;
    }

    try {
      setIsSubscribing(true);
      const headers = await withCsrfHeaders(
        {
          'Content-Type': 'application/json'
        },
        BACKEND_URL
      );

      const response = await fetch(`${BACKEND_URL}/api/newsletter`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        notify.success(data.message || 'Subscribed successfully!');
        setNewsletterEmail('');
      } else {
        notify.error(data.message || 'Could not subscribe right now.');
      }
    } catch (_error) {
      notify.error('Could not subscribe right now.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3 className="footer-heading">Dangi Innovation Lab</h3>
            <p className="footer-text">
              Building globally empowered underserved communities through innovation, education, and leadership.
            </p>
            <div className="footer-social">
              <a href="mailto:contact@dangiinnovationlab.com" className="social-link" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
            <p className="footer-follow-cta">Follow us for updates and stories</p>
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
            <p className="footer-text">Serving Globally</p>
            <p className="footer-text">www.dangiinnovationlab.com</p>
            <p className="footer-text">
              <a href="mailto:contact@dangiinnovationlab.com" className="footer-email">
                contact@dangiinnovationlab.com
              </a>
            </p>

            <form className="footer-newsletter" onSubmit={handleNewsletterSubmit}>
              <label htmlFor="footer-newsletter-email" className="footer-subheading">Newsletter</label>
              <div className="footer-newsletter-row">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  className="footer-newsletter-input"
                  placeholder="you@example.com"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  required
                />
                <button type="submit" className="btn-primary footer-newsletter-btn" disabled={isSubscribing}>
                  {isSubscribing ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
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
