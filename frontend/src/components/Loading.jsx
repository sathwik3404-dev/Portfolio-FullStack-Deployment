import React from 'react';

export const Loading = ({ message = 'Loading...', size = 'normal' }) => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <span className={`spinner spinner-dark ${size === 'large' ? 'spinner-lg' : ''}`} aria-hidden="true"></span>
      <p>{message}</p>
    </div>
  );
};

export default Loading;
