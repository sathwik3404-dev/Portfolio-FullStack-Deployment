import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/apiClient';
import ErrorMessage from '../components/ErrorMessage';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to send user after login
  const from = location.state?.from?.pathname || '/projects';

  const validate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      // Navigate to intended page
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.details && typeof err.details === 'object') {
          setFieldErrors((prev) => ({ ...prev, ...err.details }));
        }
      } else {
        setGeneralError('Unable to sign in. Please verify your connection to the server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '32rem', margin: '2rem auto 4rem' }}>
      <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center', borderBottom: 'none' }}>
        <div>
          <h1>
            Account <span>Sign In</span>
          </h1>
          <p className="page-subtitle">
            Sign in to manage your portfolio projects and REST API resources.
          </p>
        </div>
      </div>

      {generalError && <ErrorMessage message={generalError} />}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="loginUsername" className="form-label">
              Username <span className="req">*</span>
            </label>
            <input
              type="text"
              id="loginUsername"
              className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
              placeholder="e.g. demo_user"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
              }}
              autoComplete="username"
              disabled={isSubmitting}
              required
            />
            {fieldErrors.username && (
              <div className="field-error">⚠ {fieldErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword" className="form-label">
              Password <span className="req">*</span>
            </label>
            <input
              type="password"
              id="loginPassword"
              className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
              }}
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
            {fieldErrors.password && (
              <div className="field-error">⚠ {fieldErrors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span> Signing In...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
          <span>Don't have an account yet? </span>
          <Link to="/register" style={{ fontWeight: 700 }}>
            Register here →
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '0.4rem', border: '1px solid var(--line)', fontSize: '0.85rem' }}>
        <strong>Demo Account Credentials:</strong>
        <div style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>
          Username: <code>demo_user</code> | Password: <code>StrongPassword123</code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
