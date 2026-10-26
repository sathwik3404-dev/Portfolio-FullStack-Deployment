import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/apiClient';
import ErrorMessage from '../components/ErrorMessage';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

    // Username validation
    const username = formData.username.trim();
    if (!username) {
      errors.username = 'Username is required.';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters long.';
    }

    // Email validation
    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address.';
    }

    // Password validation matching backend requirements
    const password = formData.password;
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (/^\d+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
      errors.password = 'Password should contain a mix of letters and numbers.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(formData.username.trim(), formData.email.trim(), formData.password);
      // Automatically logged in via register
      navigate('/projects', {
        state: { message: 'Registration successful! Welcome to your portfolio project dashboard.' },
        replace: true,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.details && typeof err.details === 'object') {
          setFieldErrors((prev) => ({ ...prev, ...err.details }));
        }
      } else {
        setGeneralError('Registration failed. Please check network connectivity.');
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
            Create <span>Account</span>
          </h1>
          <p className="page-subtitle">
            Register to create, manage, and showcase your own portfolio projects.
          </p>
        </div>
      </div>

      {generalError && <ErrorMessage message={generalError} />}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="regUsername" className="form-label">
              Username <span className="req">*</span>
            </label>
            <input
              type="text"
              id="regUsername"
              name="username"
              className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
              placeholder="e.g. john_developer"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={isSubmitting}
              required
            />
            {fieldErrors.username && (
              <div className="field-error">⚠ {fieldErrors.username}</div>
            )}
            <div className="form-help">At least 3 characters. Letters, numbers, and underscores.</div>
          </div>

          <div className="form-group">
            <label htmlFor="regEmail" className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              type="email"
              id="regEmail"
              name="email"
              className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
            {fieldErrors.email && (
              <div className="field-error">⚠ {fieldErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="regPassword" className="form-label">
              Password <span className="req">*</span>
            </label>
            <input
              type="password"
              id="regPassword"
              name="password"
              className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
              placeholder="At least 8 characters (mixed letters & numbers)"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={isSubmitting}
              required
            />
            {fieldErrors.password && (
              <div className="field-error">⚠ {fieldErrors.password}</div>
            )}
            <div className="form-help">Minimum 8 characters with both letters and numbers.</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span> Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem', borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 700 }}>
            Sign In here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
