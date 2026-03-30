import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Mail } from 'lucide-react';

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl =
    process.env.REACT_APP_WHATSAPP_URL ||
    'https://wa.me/?text=Hi%20Dangi%20Innovation%20Lab%2C%20I%20need%20support.';

  return (
    <div className="floating-contact-widget" aria-live="polite">
      {isOpen ? (
        <div className="floating-contact-panel" role="menu" aria-label="Quick support options">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="floating-contact-action"
            role="menuitem"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle size={18} />
            WhatsApp Support
          </a>

          <Link
            to="/contact"
            className="floating-contact-action"
            role="menuitem"
            aria-label="Open contact page"
            onClick={() => setIsOpen(false)}
          >
            <Mail size={18} />
            Contact Form
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        className="floating-contact-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close support options' : 'Open support options'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};

export default FloatingContactButton;
