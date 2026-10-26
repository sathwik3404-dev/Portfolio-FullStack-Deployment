import React from 'react';

export const ErrorMessage = ({ message, details, onRetry, type = 'error' }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div style={{ flex: 1 }}>
        <strong>{type === 'error' ? 'Notice:' : 'Information:'} </strong>
        <span>{message}</span>
        {details && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.9rem', opacity: 0.9 }}>
            {typeof details === 'string' ? details : JSON.stringify(details)}
          </div>
        )}
      </div>
      {onRetry && (
        <div className="alert-actions">
          <button type="button" className="btn btn-sm btn-outline" onClick={onRetry}>
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
