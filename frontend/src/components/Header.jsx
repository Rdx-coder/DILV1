import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';

const THEME_STORAGE_KEY = 'dil-theme';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : 'dark';

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsAboutDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsAboutDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEscape);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/sponsors', label: 'Sponsors' },
    { path: '/blog', label: 'Blog' },
    { path: '/programs', label: 'Programs' },
    { path: '/mentorship', label: 'Mentorship' },
    { path: '/transparency', label: 'Transparency' },
    { path: '/support', label: 'Support' },
    { path: '/contact', label: 'Contact' }
  ];
  
  const aboutDropdown = [
    { path: '/about', label: 'About Us' },
    { path: '/team', label: 'Team Members' },
    { path: '/success-stories', label: 'Success Stories' }
  ];

  const isLightMode = theme === 'light';
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className={`header-container ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo-link">
          <div className="logo-text">DIL</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          
          {/* About Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setIsAboutDropdownOpen(true)}
            onMouseLeave={() => setIsAboutDropdownOpen(false)}
            onFocusCapture={() => setIsAboutDropdownOpen(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsAboutDropdownOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setIsAboutDropdownOpen(false);
                event.currentTarget.querySelector('.dropdown-toggle')?.focus();
              }
            }}
          >
            <button 
              className="nav-link dropdown-toggle"
              aria-label="About menu"
              aria-haspopup="true"
              aria-expanded={isAboutDropdownOpen}
              type="button"
              onClick={() => setIsAboutDropdownOpen((prev) => !prev)}
            >
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

          <button
            type="button"
            className="theme-toggle-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
            title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            <span>{isLightMode ? 'Dark' : 'Light'}</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav id="mobile-nav" className={`mobile-nav ${isMenuOpen ? 'is-open' : ''}`} aria-hidden={!isMenuOpen} aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              aria-current={location.pathname === link.path ? 'page' : undefined}
              onClick={() => {
                setIsMenuOpen(false);
                setIsAboutDropdownOpen(false);
              }}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile About Dropdown */}
          <div className="mobile-nav-section">
            <button 
              className="mobile-nav-toggle" 
              onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
              aria-label="About menu"
              aria-haspopup="true"
              aria-expanded={isAboutDropdownOpen}
              type="button"
              tabIndex={isMenuOpen ? 0 : -1}
            >
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
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-nav-section">
            <button
              type="button"
              className="mobile-theme-toggle"
              onClick={toggleTheme}
              tabIndex={isMenuOpen ? 0 : -1}
              aria-label={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
            >
              {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
              <span>{isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}</span>
            </button>
          </div>
      </nav>
    </header>
  );
};

export default Header;
