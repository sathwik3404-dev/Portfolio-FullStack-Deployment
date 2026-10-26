import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div>
        <p>
          &copy; {currentYear} <strong>Sathwik Ananthula</strong>. All rights reserved.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
          Assignment 3: React &amp; Vite Frontend consuming Django REST API with TokenAuthentication.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a
          href="https://github.com/sathwik3404-dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Profile ↗
        </a>
        <a
          href="https://github.com/sathwik3404-dev/Portfolio-CRUD-API"
          target="_blank"
          rel="noopener noreferrer"
        >
          Backend API Repo ↗
        </a>
      </div>
    </footer>
  );
};

export default Footer;
