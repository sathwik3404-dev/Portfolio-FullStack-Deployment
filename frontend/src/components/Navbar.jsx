import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div className="sidebar-header">
        <div className="avatar-wrap">
          <img
            src="/image/pro.jpeg"
            alt="Sathwik Ananthula"
            onError={(e) => {
              // Fallback to stylized initials if image fails to load
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML =
                  '<div style="width:100%;height:100%;background:#005fa3;color:#fff;display:grid;place-items:center;font-family:var(--font-head);font-size:3.5rem;font-weight:800;">SA</div>';
              }
            }}
          />
        </div>

        <div className="sidebar-brand">
          <Link to="/projects" onClick={closeMenu} style={{ color: 'inherit' }}>
            Sathwik Ananthula
            <span>Full-Stack & IoT</span>
          </Link>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} aria-label="Primary">
        <ul>
          <li className="nav-item">
            <NavLink
              to="/projects"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Projects
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <NavLink
                  to="/projects/new"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  + Add Project
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Sign In
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/register"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className={`sidebar-footer ${mobileMenuOpen ? 'open' : ''}`}>
        {isAuthenticated && user ? (
          <div>
            <div className="user-badge">
              <span>Logged in as:</span>
              <strong>@{user.username}</strong>
              {user.email && <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{user.email}</div>}
            </div>
            <button type="button" className="btn-sidebar-logout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            <span>Portfolio CRUD REST API</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Navbar;
