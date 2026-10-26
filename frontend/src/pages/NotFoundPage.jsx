import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div style={{ maxWidth: '36rem', margin: '4rem auto', textAlign: 'center' }}>
      <div className="empty-state">
        <div className="empty-state-icon" style={{ fontSize: '4.5rem' }}>🧭</div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          404 <span>Not Found</span>
        </h1>
        <p style={{ fontSize: '1.1rem', margin: '1rem auto 2rem' }}>
          The page or project you are looking for doesn't exist or has moved.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/projects" className="btn btn-primary">
            Go to Projects
          </Link>
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
