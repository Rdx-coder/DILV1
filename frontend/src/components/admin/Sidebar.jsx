import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Users,
  Zap,
  Settings,
  LogOut,
  ChevronDown,
  CalendarDays
} from 'lucide-react';
import { logout } from '../../utils/auth';
import { toast } from '../ui/sonner';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      children: [
        { label: 'Overview', path: '/admin/dashboard' },
        { label: 'Submissions', path: '/admin/dashboard?tab=submissions' },
      ]
    },
    {
      label: 'Blog Manager',
      icon: BookOpen,
      path: '/admin/blogs',
      children: [
        { label: 'All Blogs', path: '/admin/blogs' },
        { label: 'New Blog', path: '/admin/blog/new' },
      ]
    },
    {
      label: 'Team Manager',
      icon: Users,
      path: '/admin/team',
    },
    {
      label: 'Events Manager',
      icon: CalendarDays,
      path: '/admin/events',
    },
    {
      label: 'SEO Monitor',
      icon: Zap,
      path: '/admin/dashboard?tab=seo',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    }
  };

  const isMenuActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sidebar-mobile-toggle"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">D</div>
            <div>
              <p className="sidebar-logo-text">DILV1</p>
              <p className="sidebar-logo-subtext">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.label}>
              <div
                className={`sidebar-menu-item ${isMenuActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.label);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.children && (
                  <ChevronDown
                    size={16}
                    className={`chevron ${expandedMenu === item.label ? 'expanded' : ''}`}
                  />
                )}
              </div>

              {item.children && expandedMenu === item.label && (
                <div className="sidebar-submenu">
                  {item.children.map((child) => (
                    <button
                      key={child.path}
                      onClick={() => handleNavigation(child.path)}
                      className={`sidebar-submenu-item ${isMenuActive(child.path) ? 'active' : ''}`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
