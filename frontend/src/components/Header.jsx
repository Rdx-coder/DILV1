import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

const THEME_STORAGE_KEY = 'dil-theme';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState('');
  const [openMobileDropdown, setOpenMobileDropdown] = useState('');
  const [theme, setTheme] = useState('dark');
  const location = useLocation();
  const closeTimeoutRef = useRef(null);

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
    setOpenDesktopDropdown('');
    setOpenMobileDropdown('');
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setOpenDesktopDropdown('');
        setOpenMobileDropdown('');
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const primaryLinks = [
    { path: '/', label: 'Home' },
    { path: '/programs', label: 'Programs' },
    { path: '/products', label: 'Products' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' }
  ];

  const dropdownGroups = useMemo(() => ([
    {
      key: 'about',
      label: 'About',
      items: [
        { path: '/about', label: 'About Us' },
        { path: '/team', label: 'Team Members' },
        { path: '/success-stories', label: 'Success Stories' },
        { path: '/sponsors', label: 'Sponsors' }
      ]
    },
    {
      key: 'involved',
      label: 'Get Involved',
      items: [
        { path: '/mentorship', label: 'Mentorship' },
        { path: '/support', label: 'Support Us' },
        { path: '/transparency', label: 'Transparency' }
      ]
    }
  ]), []);

  const isLightMode = theme === 'light';
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isDropdownActive = (items) => items.some((item) => isPathActive(item.path));

  const openDropdown = (key) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setOpenDesktopDropdown(key);
  };

  const scheduleDropdownClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDesktopDropdown('');
    }, 180);
  };

  return (
    <header className={`header-container ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo-link">
          <div className="logo-text">DIL</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Primary navigation">
          <div className="desktop-nav-links">
          {primaryLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isPathActive(link.path) ? 'active' : ''}`}
              aria-current={isPathActive(link.path) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}

          {dropdownGroups.map((group) => (
          <div
            key={group.key}
            className="nav-dropdown"
            onMouseEnter={() => openDropdown(group.key)}
            onMouseLeave={scheduleDropdownClose}
            onFocusCapture={() => openDropdown(group.key)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                scheduleDropdownClose();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                }
                setOpenDesktopDropdown('');
                event.currentTarget.querySelector('.dropdown-toggle')?.focus();
              }
            }}
          >
            <button 
              className={`nav-link dropdown-toggle ${isDropdownActive(group.items) ? 'active' : ''}`}
              aria-label={`${group.label} menu`}
              aria-haspopup="true"
              aria-expanded={openDesktopDropdown === group.key}
              type="button"
              onClick={() => {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                }
                setOpenDesktopDropdown((prev) => (prev === group.key ? '' : group.key));
              }}
            >
              {group.label}
              <ChevronDown size={16} />
            </button>
            {openDesktopDropdown === group.key && (
              <div className="dropdown-menu">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`dropdown-item ${isPathActive(item.path) ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          ))}
          </div>

          <div className="desktop-nav-actions">
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
          <Link to="/programs" className="nav-cta-button" aria-label="Apply for programs">
            <span>Apply</span>
            <ArrowRight size={16} />
          </Link>
          </div>
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
          <div className="mobile-nav-group">
            <p className="mobile-nav-label">Explore</p>
          {primaryLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isPathActive(link.path) ? 'active' : ''}`}
              aria-current={isPathActive(link.path) ? 'page' : undefined}
              onClick={() => {
                setIsMenuOpen(false);
                setOpenMobileDropdown('');
              }}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              {link.label}
            </Link>
          ))}
          </div>

          {dropdownGroups.map((group) => (
          <div key={group.key} className="mobile-nav-section">
            <p className="mobile-nav-label">{group.label}</p>
            <button 
              className="mobile-nav-toggle" 
              onClick={() => setOpenMobileDropdown((prev) => (prev === group.key ? '' : group.key))}
              aria-label={`${group.label} menu`}
              aria-haspopup="true"
              aria-expanded={openMobileDropdown === group.key}
              type="button"
              tabIndex={isMenuOpen ? 0 : -1}
            >
              <span>{group.label}</span>
              <ChevronDown size={16} className={openMobileDropdown === group.key ? 'rotated' : ''} />
            </button>
            {openMobileDropdown === group.key && (
              <div className="mobile-dropdown">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-dropdown-item ${isPathActive(item.path) ? 'active' : ''}`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setOpenMobileDropdown('');
                    }}
                    tabIndex={isMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          ))}

          <Link
            to="/programs"
            className="btn-primary mobile-nav-cta"
            onClick={() => {
              setIsMenuOpen(false);
              setOpenMobileDropdown('');
            }}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Apply
            <ArrowRight size={16} />
          </Link>

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
