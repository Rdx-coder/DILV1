import React, { useState } from 'react';
import { Mail, MapPin, Globe, Send } from 'lucide-react';
import { withCsrfHeaders } from '../utils/csrf';
import { notify } from '../utils/notify';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    interest: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    const trimmed = String(value || '').trim();

    if (name === 'name') {
      if (!trimmed) return 'Name is required';
      if (trimmed.length < 2) return 'Name must be at least 2 characters';
      return '';
    }

    if (name === 'email') {
      if (!trimmed) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address';
      return '';
    }

    if (name === 'subject') {
      if (!trimmed) return 'Subject is required';
      if (trimmed.length < 3) return 'Subject must be at least 3 characters';
      return '';
    }

    if (name === 'message') {
      if (!trimmed) return 'Message is required';
      if (trimmed.length < 10) return 'Message must be at least 10 characters';
      return '';
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message)
    };

    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      notify.error('Please fix form errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const headers = await withCsrfHeaders(
        {
          'Content-Type': 'application/json',
        },
        BACKEND_URL
      );
      const response = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        notify.success(data.message || 'Message sent successfully.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          interest: 'general'
        });
        setFieldErrors({});
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        notify.error(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      notify.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Get in Touch</h1>
          <p className="page-subtitle">
            Have questions? Want to collaborate? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccess && (
        <div 
          className="success-modal-overlay"
          role="dialog"
          aria-labelledby="success-modal-title"
          aria-modal="true"
        >
          <div className="success-modal">
            <div className="success-modal-header">
              <h3 id="success-modal-title">Thank You!</h3>
            </div>
            <div className="success-modal-body">
              <p>Your message has been sent successfully.</p>
              <p>We'll review your inquiry and get back to you within 2-3 business days.</p>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="btn-primary"
                          aria-label="Close success message"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Content */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-layout">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="contact-info-title">Connect With Us</h2>
              <p className="contact-info-text">
                Whether you're interested in our programs, want to become a mentor, or have questions 
                about our mission, we're here to help.
              </p>

              <div className="contact-details">
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="contact-detail-title">Email</h4>
                    <a href="mailto:contact@dangiinnovationlab.com" className="contact-detail-value">
                      contact@dangiinnovationlab.com
                    </a>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h4 className="contact-detail-title">Location</h4>
                    <p className="contact-detail-value">
                      100% Digital Platform<br />
                      Serving Globally
                    </p>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="contact-detail-title">Operating Model</h4>
                    <p className="contact-detail-value">
                      Online-first, globally accessible
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-partnerships">
                <h3 className="partnerships-title">Collaboration & Partnerships</h3>
                <p className="partnerships-text">
                  We welcome partnerships with organizations, educational institutions, and individuals 
                  who share our vision of community empowerment.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`form-input ${fieldErrors.name ? 'form-input-error' : ''}`}
                    placeholder="Your name"
                    aria-invalid={Boolean(fieldErrors.name)}
                  />
                  {fieldErrors.name ? <p className="form-error-text">{fieldErrors.name}</p> : null}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`form-input ${fieldErrors.email ? 'form-input-error' : ''}`}
                    placeholder="your.email@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  {fieldErrors.email ? <p className="form-error-text">{fieldErrors.email}</p> : null}
                </div>

                <div className="form-group">
                  <label htmlFor="interest" className="form-label">I'm interested in *</label>
                  <select
                    id="interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="programs">Applying for Programs</option>
                    <option value="mentorship">Becoming a Mentor</option>
                    <option value="partnership">Partnership/Collaboration</option>
                    <option value="donation">Donation Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`form-input ${fieldErrors.subject ? 'form-input-error' : ''}`}
                    placeholder="Brief subject line"
                    aria-invalid={Boolean(fieldErrors.subject)}
                  />
                  {fieldErrors.subject ? <p className="form-error-text">{fieldErrors.subject}</p> : null}
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className={`form-textarea ${fieldErrors.message ? 'form-input-error' : ''}`}
                    placeholder="Tell us more about your inquiry..."
                    aria-invalid={Boolean(fieldErrors.message)}
                  ></textarea>
                  {fieldErrors.message ? <p className="form-error-text">{fieldErrors.message}</p> : null}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary btn-submit"
                                  aria-label={isSubmitting ? "Sending your message" : "Send your message"}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title-center">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4 className="faq-question">How long does it take to hear back?</h4>
              <p className="faq-answer">
                We typically respond to inquiries within 2-3 business days. For program applications, 
                the review process may take 1-2 weeks.
              </p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">Can I schedule a call?</h4>
              <p className="faq-answer">
                Yes! Mention your preferred time in the message, and we'll arrange a video call 
                to discuss your inquiry in detail.
              </p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">Do you have physical offices?</h4>
              <p className="faq-answer">
                No, we operate 100% digitally to maximize accessibility and keep costs low. 
                All interactions happen online via video calls and digital platforms.
              </p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">How can I stay updated?</h4>
              <p className="faq-answer">
                Follow us on social media and check our transparency page for regular updates 
                on programs, impact, and community activities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
