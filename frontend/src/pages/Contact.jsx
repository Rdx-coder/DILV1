import React, { useState } from 'react';
import { Mail, MapPin, Globe, Send } from 'lucide-react';
import { mockAPI } from '../mock';
import { toast } from '../components/ui/sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    interest: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await mockAPI.submitContact(formData);
      toast.success(response.message);
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        interest: 'general'
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
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
                    <a href="mailto:contact@dangiinnovationlab.org" className="contact-detail-value">
                      contact@dangiinnovationlab.org
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
                      Serving India & Nepal
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
                    className="form-input"
                    placeholder="Your name"
                  />
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
                    className="form-input"
                    placeholder="your.email@example.com"
                  />
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
                    className="form-input"
                    placeholder="Brief subject line"
                  />
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
                    className="form-textarea"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary btn-submit"
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
