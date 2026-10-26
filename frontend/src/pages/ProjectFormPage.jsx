import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient, { ApiError } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const INITIAL_FORM_STATE = {
  title: '',
  technologies: '',
  description: '',
  github_url: '',
  live_demo_url: '',
};

export const ProjectFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // If editing, fetch existing project data
  const loadExistingProject = useCallback(async () => {
    if (!isEditMode) return;
    setInitialLoading(true);
    setGeneralError(null);

    try {
      const data = await apiClient.getProject(id, token);

      // Verify the current user is the owner
      if (data.owner_username && user?.username && data.owner_username !== user.username) {
        setGeneralError('You are not authorized to edit this project. Only the project owner can edit it.');
        return;
      }

      setFormData({
        title: data.title || '',
        technologies: data.technologies || '',
        description: data.description || '',
        github_url: data.github_url || '',
        live_demo_url: data.live_demo_url || '',
      });
    } catch (err) {
      setGeneralError(err instanceof ApiError ? err.message : 'Failed to load project for editing.');
    } finally {
      setInitialLoading(false);
    }
  }, [id, isEditMode, token, user]);

  useEffect(() => {
    loadExistingProject();
  }, [loadExistingProject]);

  // Client-side field validation helper
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Project title is required.';
    } else if (formData.title.trim().length < 2) {
      errors.title = 'Project title must be at least 2 characters long.';
    }

    // Technologies validation
    if (!formData.technologies || !formData.technologies.trim()) {
      errors.technologies = 'Technologies used cannot be empty (e.g. React, Node.js, ESP32).';
    }

    // Description validation
    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Project description is required.';
    }

    // URL validation helper
    const isValidUrl = (string) => {
      if (!string) return true; // Optional field
      try {
        const parsed = new URL(string);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };

    if (formData.github_url && !isValidUrl(formData.github_url)) {
      errors.github_url = 'Please enter a valid URL starting with http:// or https://';
    }

    if (formData.live_demo_url && !isValidUrl(formData.live_demo_url)) {
      errors.live_demo_url = 'Please enter a valid URL starting with http:// or https://';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error on edit
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      technologies: formData.technologies.trim(),
      description: formData.description.trim(),
      github_url: formData.github_url.trim(),
      live_demo_url: formData.live_demo_url.trim(),
    };

    try {
      let savedProject;
      if (isEditMode) {
        savedProject = await apiClient.updateProject(id, payload, token);
      } else {
        savedProject = await apiClient.createProject(payload, token);
      }

      // Redirect to the newly created / edited project detail page
      navigate(`/projects/${savedProject.id}`, {
        state: {
          message: isEditMode
            ? `Project "${savedProject.title}" was updated successfully!`
            : `Project "${savedProject.title}" was created successfully!`,
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.details && typeof err.details === 'object') {
          setFieldErrors((prev) => ({ ...prev, ...err.details }));
        }
      } else {
        setGeneralError('An unexpected network error occurred while saving the project.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return <Loading message="Loading project details for editing..." size="large" />;
  }

  return (
    <div className="project-form-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            {isEditMode ? 'Edit' : 'Create New'} <span>Project</span>
          </h1>
          <p className="page-subtitle">
            {isEditMode
              ? 'Update the project specifications, repository URLs, or technologies.'
              : 'Add a new web application, embedded IoT station, or system project to your portfolio.'}
          </p>
        </div>

        <div>
          <Link
            to={isEditMode ? `/projects/${id}` : '/projects'}
            className="btn btn-outline"
          >
            ← Cancel &amp; Back
          </Link>
        </div>
      </div>

      {generalError && (
        <ErrorMessage
          message={generalError}
          onRetry={isEditMode ? loadExistingProject : undefined}
        />
      )}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Project Title <span className="req">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Fuelup On Demand Delivery"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.title && <div className="field-error">⚠ {fieldErrors.title}</div>}
            <div className="form-help">Must be at least 2 characters long.</div>
          </div>

          <div className="form-group">
            <label htmlFor="technologies" className="form-label">
              Technologies Used <span className="req">*</span>
            </label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              className={`form-control ${fieldErrors.technologies ? 'is-invalid' : ''}`}
              placeholder="e.g. React, Node.js, ESP32, MQTT, SQLite"
              value={formData.technologies}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.technologies && (
              <div className="field-error">⚠ {fieldErrors.technologies}</div>
            )}
            <div className="form-help">Comma-separated or list of frameworks, languages, and hardware.</div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Project Description <span className="req">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
              placeholder="Provide a comprehensive summary of features, architecture, problems solved, and outcomes..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {fieldErrors.description && (
              <div className="field-error">⚠ {fieldErrors.description}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="github_url" className="form-label">
                GitHub Repository URL
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                className={`form-control ${fieldErrors.github_url ? 'is-invalid' : ''}`}
                placeholder="https://github.com/sathwik3404-dev/..."
                value={formData.github_url}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {fieldErrors.github_url && (
                <div className="field-error">⚠ {fieldErrors.github_url}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="live_demo_url" className="form-label">
                Live Demo / Deployment URL
              </label>
              <input
                type="url"
                id="live_demo_url"
                name="live_demo_url"
                className={`form-control ${fieldErrors.live_demo_url ? 'is-invalid' : ''}`}
                placeholder="https://..."
                value={formData.live_demo_url}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {fieldErrors.live_demo_url && (
                <div className="field-error">⚠ {fieldErrors.live_demo_url}</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <Link
              to={isEditMode ? `/projects/${id}` : '/projects'}
              className="btn btn-outline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true"></span> Saving Project...
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Publish Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormPage;
