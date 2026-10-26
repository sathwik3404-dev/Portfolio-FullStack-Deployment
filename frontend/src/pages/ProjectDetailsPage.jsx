import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient, { ApiError } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.getProject(id, token);
      setProject(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError('Project not found. It may have been deleted or does not exist.');
      } else if (err instanceof ApiError && err.status === 403) {
        setError('You do not have permission to view private details of this project.');
      } else {
        setError(err.message || 'Failed to load project details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleDelete = async () => {
    if (!token || !project) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteProject(project.id, token);
      navigate('/projects', {
        state: { message: `Project "${project.title}" was successfully deleted.` },
        replace: true,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete project.');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner =
    isAuthenticated &&
    project &&
    (project.owner_username === user?.username || project.owner === user?.id);

  if (loading) {
    return <Loading message="Loading project details from API..." size="large" />;
  }

  if (error || !project) {
    return (
      <div className="project-details-page">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/projects" className="btn btn-outline">
            ← Back to Projects
          </Link>
        </div>

        <ErrorMessage message={error || 'Project not found.'} onRetry={fetchProject} />

        <div className="empty-state">
          <h3>Unable to display project</h3>
          <p>The project requested could not be retrieved from the backend API.</p>
          <Link to="/projects" className="btn btn-primary">
            Return to Projects List
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const updatedDate = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <article className="project-details-page">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/projects" className="btn btn-outline">
          ← Back to Projects
        </Link>

        {isOwner && (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to={`/projects/${project.id}/edit`} className="btn btn-primary">
              ✏️ Edit Project
            </Link>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      <div className="detail-view">
        <div className="detail-header">
          <div>
            <h1>{project.title}</h1>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge badge-blue detail-tech-badge">{project.technologies}</span>
            </div>
          </div>
        </div>

        <div className="detail-meta-grid">
          <div className="meta-item">
            <dt>Project Owner</dt>
            <dd>@{project.owner_username || 'portfolio'}</dd>
          </div>
          {createdDate && (
            <div className="meta-item">
              <dt>Created Date</dt>
              <dd>{createdDate}</dd>
            </div>
          )}
          {updatedDate && (
            <div className="meta-item">
              <dt>Last Updated</dt>
              <dd>{updatedDate}</dd>
            </div>
          )}
          <div className="meta-item">
            <dt>Project ID</dt>
            <dd>#{project.id}</dd>
          </div>
        </div>

        <div className="detail-body">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.6rem', color: 'var(--ink)' }}>
            About This Project
          </h3>
          <p>{project.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
          {project.github_url ? (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              📂 View GitHub Repository ↗
            </a>
          ) : (
            <span style={{ fontSize: '0.95rem', color: 'var(--muted)', alignSelf: 'center' }}>
              No GitHub repository provided.
            </span>
          )}

          {project.live_demo_url ? (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              🚀 Launch Live Demo ↗
            </a>
          ) : (
            <span style={{ fontSize: '0.95rem', color: 'var(--muted)', alignSelf: 'center' }}>
              No live demo link provided.
            </span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="modal-content">
            <h3 id="delete-dialog-title">Confirm Deletion</h3>
            <p>
              Are you sure you want to permanently delete <strong>"{project.title}"</strong>?
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--danger)' }}>
              This operation will permanently remove the project from the Django REST API database.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default ProjectDetailsPage;
