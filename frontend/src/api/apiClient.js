/**
 * API Client for Portfolio CRUD REST API
 * Consumes Django REST Framework backend with TokenAuthentication
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Custom API Error containing status code and structured validation details
 */
export class ApiError extends Error {
  constructor(message, status = 0, details = null, raw = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details; // Key-value map of field errors if provided by DRF
    this.raw = raw;
  }
}

/**
 * Parses DRF error responses into user-friendly messages and field error mappings
 */
function parseDrfError(data, status) {
  if (!data) {
    if (status === 404) return { message: 'The requested resource was not found.', fieldErrors: {} };
    if (status === 403) return { message: 'You do not have permission to perform this action.', fieldErrors: {} };
    if (status === 401) return { message: 'Authentication required or your session has expired.', fieldErrors: {} };
    return { message: `Request failed with status ${status}.`, fieldErrors: {} };
  }

  if (typeof data === 'string') {
    return { message: data, fieldErrors: {} };
  }

  // Top-level message or detail field
  if (data.detail && typeof data.detail === 'string') {
    return { message: data.detail, fieldErrors: {} };
  }
  if (data.error && typeof data.error === 'string') {
    return { message: data.error, fieldErrors: {} };
  }

  // DRF field-specific validation errors: { field: ["error1", "error2"] }
  const fieldErrors = {};
  const messageParts = [];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      const msg = value.join(' ');
      fieldErrors[key] = msg;
      messageParts.push(`${key}: ${msg}`);
    } else if (typeof value === 'string') {
      fieldErrors[key] = value;
      messageParts.push(`${key}: ${value}`);
    } else if (typeof value === 'object' && value !== null) {
      const nestedMsg = JSON.stringify(value);
      fieldErrors[key] = nestedMsg;
      messageParts.push(`${key}: ${nestedMsg}`);
    }
  }

  const message = messageParts.length > 0
    ? messageParts.join(' | ')
    : 'An unexpected validation error occurred.';

  return { message, fieldErrors };
}

/**
 * Low-level HTTP request helper
 */
async function request(endpoint, options = {}, token = null) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  // Attach DRF Token header if provided
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // HTTP 204 No Content (e.g. DELETE)
    if (response.status === 204) {
      return { success: true, status: 204 };
    }

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const { message, fieldErrors } = parseDrfError(data, response.status);
      throw new ApiError(message, response.status, fieldErrors, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network failures (e.g. Django server not running or CORS rejection)
    throw new ApiError(
      `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the Django development server is running and reachable.`,
      0,
      null,
      error
    );
  }
}

/**
 * Exported API service functions
 */
export const apiClient = {
  // Authentication
  async register({ username, email, password }) {
    return request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async login({ username, password }) {
    return request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getProfile(token) {
    return request('/auth/me/', { method: 'GET' }, token);
  },

  async logout(token) {
    try {
      return await request('/auth/logout/', { method: 'POST' }, token);
    } catch {
      // Ignore network errors on logout - local token will be removed anyway
      return { success: true };
    }
  },

  // Projects CRUD
  async getPublicProjects() {
    return request('/projects/public/', { method: 'GET' });
  },

  async getUserProjects(token) {
    return request('/projects/', { method: 'GET' }, token);
  },

  async getProject(id, token = null) {
    // If authenticated, attempt to fetch full project details via /projects/<id>/
    if (token) {
      try {
        return await request(`/projects/${id}/`, { method: 'GET' }, token);
      } catch (err) {
        // If 403 Forbidden (not owner) or 404, fallback to public detail view
        if (err.status === 403) {
          try {
            return await request(`/projects/public/${id}/`, { method: 'GET' });
          } catch {
            throw err; // throw original 403 if public not found
          }
        }
        throw err;
      }
    }
    // Unauthenticated: fetch via public detail endpoint
    return request(`/projects/public/${id}/`, { method: 'GET' });
  },

  async createProject(projectData, token) {
    return request('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }, token);
  },

  async updateProject(id, projectData, token) {
    return request(`/projects/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }, token);
  },

  async patchProject(id, partialData, token) {
    return request(`/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(partialData),
    }, token);
  },

  async deleteProject(id, token) {
    return request(`/projects/${id}/`, {
      method: 'DELETE',
    }, token);
  },
};

export default apiClient;
