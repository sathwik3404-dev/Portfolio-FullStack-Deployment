import React from 'react';
import { Link } from 'react-router-dom';

export const ProjectCard = ({ project, onDelete, isOwner = false }) => {
  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <article className="project-card" data-id={project.id}>
      <div className="project-card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3>
            <Link to={`/projects/${project.id}`} style={{ color: 'inherit' }}>
              {project.title}
            </Link>
          </h3>
        </div>
        <div style={{ marginTop: '0.35rem' }}>
          <span className="badge badge-blue">{project.technologies}</span>
        </div>
      </div>

      <div className="project-card-body">
        <p>{project.description}</p>
      </div>

      <div className="project-card-meta">
        <div className="project-card-links">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open GitHub Repository"
            >
              GitHub ↗
            </a>
          )}
          {project.live_demo_url && (
            <a
              href={project.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Live Deployment"
            >
              Live Demo ↗
            </a>
          )}
          <Link to={`/projects/${project.id}`} style={{ marginLeft: 'auto', color: 'var(--blue)' }}>
            Details →
          </Link>
        </div>

        <div className="project-card-footer">
          <span className="owner-tag">
            {project.owner_username ? `By @${project.owner_username}` : 'Portfolio Project'}
            {formattedDate ? ` • ${formattedDate}` : ''}
          </span>

          {isOwner && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Link
                to={`/projects/${project.id}/edit`}
                className="btn btn-sm btn-outline"
                title="Edit Project"
              >
                Edit
              </Link>
              {onDelete && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(project.id, project.title)}
                  title="Delete Project"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
