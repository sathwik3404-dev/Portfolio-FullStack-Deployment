import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { ApiError } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const ProjectsPage = () => {
  const { user, token, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'web', 'iot', 'my'
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: null, projectTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data = [];
      if (filterType === 'my' && token) {
        data = await apiClient.getUserProjects(token);
      } else {
        data = await apiClient.getPublicProjects();
      }
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch projects.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterType, token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle Project Deletion
  const promptDelete = (id, title) => {
    setDeleteModal({ isOpen: true, projectId: id, projectTitle: title });
  };

  const confirmDelete = async () => {
    if (!deleteModal.projectId || !token) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteProject(deleteModal.projectId, token);
      setActionSuccess(`Project "${deleteModal.projectTitle}" was successfully deleted.`);
      setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' });
      fetchProjects();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete project.';
      setError(message);
      setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and search logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const techLower = (project.technologies || '').toLowerCase();
      const titleLower = (project.title || '').toLowerCase();
      const descLower = (project.description || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      // Search query filter
      const matchesSearch =
        !query ||
        titleLower.includes(query) ||
        descLower.includes(query) ||
        techLower.includes(query);

      if (!matchesSearch) return false;

      // Category filter
      if (filterType === 'web') {
        return (
          techLower.includes('react') ||
          techLower.includes('web') ||
          techLower.includes('node') ||
          techLower.includes('django') ||
          techLower.includes('html') ||
          techLower.includes('javascript')
        );
      }
      if (filterType === 'iot') {
        return (
          techLower.includes('esp32') ||
          techLower.includes('arduino') ||
          techLower.includes('iot') ||
          techLower.includes('embedded') ||
          techLower.includes('sensor') ||
          techLower.includes('mqtt')
        );
      }

      return true;
    });
  }, [projects, filterType, searchQuery]);

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            Portfolio <span>Projects</span>
          </h1>
          <p className="page-subtitle">
            Explore web applications, IoT embedded systems, and full-stack projects.
          </p>
        </div>

        {isAuthenticated && (
          <div>
            <Link to="/projects/new" className="btn btn-primary">
              + New Project
            </Link>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="alert alert-success" role="status">
          ✓ {actionSuccess}
        </div>
      )}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchProjects}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="chips-group" role="group" aria-label="Project category filters">
          <button
            type="button"
            className={`chip ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Projects
          </button>
          <button
            type="button"
            className={`chip ${filterType === 'web' ? 'active' : ''}`}
            onClick={() => setFilterType('web')}
          >
            Web Apps
          </button>
          <button
            type="button"
            className={`chip ${filterType === 'iot' ? 'active' : ''}`}
            onClick={() => setFilterType('iot')}
          >
            IoT &amp; Embedded
          </button>
          {isAuthenticated && (
            <button
              type="button"
              className={`chip ${filterType === 'my' ? 'active' : ''}`}
              onClick={() => setFilterType('my')}
            >
              My Projects ({user?.username})
            </button>
          )}
        </div>

        <div className="search-input-wrap">
          <input
            type="search"
            className="search-input"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search projects by title or technology"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loading message="Fetching live portfolio projects from REST API..." size="large" />
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No Projects Found</h3>
          <p>
            {searchQuery
              ? `No projects matched "${searchQuery}". Try a different search term or clear the filter.`
              : filterType === 'my'
              ? 'You have not created any projects yet. Click "+ Add Project" to publish your first portfolio project!'
              : 'There are currently no projects in this category.'}
          </p>
          {isAuthenticated && (
            <Link to="/projects/new" className="btn btn-primary">
              + Create First Project
            </Link>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const isOwner =
              isAuthenticated &&
              (project.owner_username === user?.username || project.owner === user?.id);

            return (
              <ProjectCard
                key={project.id}
                project={project}
                isOwner={isOwner}
                onDelete={promptDelete}
              />
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <h3 id="modal-title">Confirm Deletion</h3>
            <p>
              Are you sure you want to permanently delete{' '}
              <strong>"{deleteModal.projectTitle}"</strong>?
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--danger)' }}>
              This action cannot be undone. The project record will be removed from the database.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteModal({ isOpen: false, projectId: null, projectTitle: '' })}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
