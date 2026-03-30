import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/blog', label: 'Blog' },
    { path: '/programs', label: 'Programs' },
    { path: '/mentorship', label: 'Mentorship' },
    { path: '/transparency', label: 'Transparency' },
    { path: '/support', label: 'Support' },
    { path: '/contact', label: 'Contact' }
  ];
  
  const aboutDropdown = [
    { path: '/about', label: 'About Us' },
    { path: '/team', label: 'Team Member' }
  ];

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <div className="logo-text">DIL</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* About Dropdown */}
          <div className="nav-dropdown" onMouseEnter={() => setIsAboutDropdownOpen(true)} onMouseLeave={() => setIsAboutDropdownOpen(false)}>
            <button className="nav-link dropdown-toggle">
              About
              <ChevronDown size={16} />
            </button>
            {isAboutDropdownOpen && (
              <div className="dropdown-menu">
                {aboutDropdown.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile About Dropdown */}
          <div className="mobile-nav-section">
            <button className="mobile-nav-toggle" onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}>
              About
              <ChevronDown size={16} className={isAboutDropdownOpen ? 'rotated' : ''} />
            </button>
            {isAboutDropdownOpen && (
              <div className="mobile-dropdown">
                {aboutDropdown.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAboutDropdownOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
