# Sathwik Ananthula — React Frontend for Portfolio Projects CRUD REST API

**Assignment 3: Modern Responsive React SPA Consuming Assignment 2 Django REST API**  
**Student:** Sathwik Ananthula  
**GitHub Profile:** [https://github.com/sathwik3404-dev](https://github.com/sathwik3404-dev)  
**Backend API Repository:** [https://github.com/sathwik3404-dev/Portfolio-CRUD-API](https://github.com/sathwik3404-dev/Portfolio-CRUD-API)  
**Frontend Repository:** [https://github.com/sathwik3404-dev/Portfolio-React-Frontend](https://github.com/sathwik3404-dev/Portfolio-React-Frontend)

---

## 1. Project Overview

This project is the frontend client for **Assignment 3**, providing a modern, fast, responsive Single Page Application (SPA) built with **React**, **Vite**, and **React Router DOM**. It communicates directly with the real **Django REST Framework (DRF)** backend created in Assignment 2, utilizing token-based authentication (`Token YOUR_AUTH_TOKEN`) and user-isolated CRUD capabilities.

The visual interface faithfully preserves the identity and styling established in Assignment 1 (*Mulish* and *Saira Extra Condensed* typography, `#0077cc` accent palette, sidebar navigation that transforms into a mobile hamburger menu on smaller screens, and category filtering).

### Key Features
- **Real REST API Integration:** Consumes real Django endpoints for projects and authentication. No mock data or simulated responses.
- **Client-Side Routing with React Router v6:** Seamless page navigation across public and protected routes without full page reloads.
- **Token Authentication:** Secure DRF `TokenAuthentication` workflow (`Authorization: Token <token>`) with session persistence in browser `localStorage`.
- **Protected Routes:** Guards project creation and editing views; unauthenticated visitors are automatically routed to the sign-in page with their intended destination preserved.
- **Complete CRUD Operations:** Create, Read (public and user-isolated lists, detail views), Full Update (PUT), and Delete (DELETE) with confirmation dialogs.
- **Search & Category Filtering:** Interactive real-time project filtering by category (*All*, *Web Apps*, *IoT & Embedded*, and *My Projects* for logged-in owners) plus instant keyword search.
- **Robust Form Validation:** Synchronous client-side field validation paired with comprehensive DRF server-side error mapping.
- **Comprehensive Loading & Error States:** Visible loading spinners, field-level error messages, friendly empty states, and error alerts with one-click retry mechanisms.
- **Fully Responsive Design:** Tailored layouts for desktop, tablet, and mobile devices.

---

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| **React 18** | Declarative Component-Driven UI |
| **Vite 5** | High-performance build tool and local dev server |
| **React Router DOM v6** | Client-side routing and protected navigation |
| **JavaScript (ES Modules)** | Core application logic and async API communication |
| **CSS3 & Design Tokens** | Portfolio-matched custom styling and responsive media queries |
| **Django REST Framework** | Real backend REST API (Assignment 2) |
| **SQLite3** | Relational database storage |

---

## 3. Project Folder Structure

```text
frontend/
├── index.html                  # HTML entry point with Google Fonts and favicon
├── package.json                # Project dependencies, scripts, and metadata
├── vite.config.js              # Vite server and build configuration
├── .env.example                # Environment variable template
├── .env                        # Local environment settings (git-ignored)
├── .gitignore                  # Git ignore rules for node_modules, dist, and env
├── test_integration.mjs        # 13-step automated live backend integration test
├── README.md                   # Comprehensive project documentation
├── public/
│   └── image/
│       └── pro.jpeg            # Portfolio profile avatar image
└── src/
    ├── main.jsx                # Application root mounting React with Router & Auth
    ├── App.jsx                 # App layout and route definitions
    ├── api/
    │   └── apiClient.js        # Reusable API client connecting to Django backend
    ├── components/
    │   ├── Navbar.jsx          # Responsive sidebar/mobile header with user session
    │   ├── Footer.jsx          # Site footer with dynamic year and external links
    │   ├── Loading.jsx         # Accessible loading spinner component
    │   ├── ErrorMessage.jsx    # Alert banner with retry action
    │   ├── ProjectCard.jsx     # Reusable card component for project display
    │   └── ProtectedRoute.jsx  # Route wrapper guarding authenticated paths
    ├── context/
    │   └── AuthContext.jsx     # React Context for authentication and token storage
    ├── pages/
    │   ├── ProjectsPage.jsx    # List, search, category filter, and delete projects
    │   ├── ProjectDetailsPage.jsx # Full project detail view with owner actions
    │   ├── ProjectFormPage.jsx # Shared form for creating and editing projects
    │   ├── LoginPage.jsx       # User login with error handling
    │   ├── RegisterPage.jsx    # User registration with validation
    │   └── NotFoundPage.jsx    # 404 error catch-all page
    └── styles/
        └── global.css          # Portfolio typography, sidebar, cards, and forms
```

---

## 4. Prerequisites

Before running the frontend, ensure you have:
1. **Node.js** (v18.x, v20.x, or v22+ / v24 LTS) installed:
   ```bash
   node -v
   npm -v
   ```
2. **Python 3.10+** (with the Assignment 2 virtual environment) for the Django backend.

---

## 5. Installation & Setup Instructions

### Step 1: Install Frontend Dependencies
From the `frontend` folder, run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Inside `.env`, verify the API base URL:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## 6. How to Start the Django Backend

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd portfolio/backend
   ```
2. Activate the virtual environment:
   - **Windows PowerShell:**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```
3. Run migrations and populate initial sample data (if not already done):
   ```bash
   python manage.py migrate
   python manage.py seed_portfolio
   ```
4. Start the Django development server on port 8000:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   The backend API will be live at `http://127.0.0.1:8000/api/`.

---

## 7. How to Start the React Frontend

1. In a separate terminal, navigate to the `frontend` folder:
   ```bash
   cd portfolio/frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 8. Available React Router Routes

| Route | Page Component | Access | Description |
|---|---|---|---|
| `/` | Redirects to `/projects` | Public | Home route automatically redirecting to projects |
| `/projects` | `ProjectsPage` | Public | Browse projects, search, filter categories |
| `/projects/:id` | `ProjectDetailsPage` | Public | Individual project details with owner controls |
| `/projects/new` | `ProjectFormPage` | **Protected** | Create a new project form (login required) |
| `/projects/:id/edit` | `ProjectFormPage` | **Protected** | Edit existing project form (owner required) |
| `/login` | `LoginPage` | Public | User authentication and token retrieval |
| `/register` | `RegisterPage` | Public | New user registration and immediate sign-in |
| `*` | `NotFoundPage` | Public | Custom 404 page for nonexistent routes |

---

## 9. Authentication Flow

The application integrates Django REST Framework's **TokenAuthentication**:

1. **Sign In (`/login`):**
   - User enters `username` and `password`.
   - Frontend submits `POST /api/auth/login/`.
   - On success (`HTTP 200`), DRF returns `{ "token": "...", "user": { ... } }`.
   - Token is stored securely in `localStorage` under `auth_token`.
   - `AuthContext` updates, broadcasting user details and authenticated state to all components.
   - User is redirected to their originally requested page (or `/projects`).

2. **Authenticated Requests:**
   - Every protected request includes the standard DRF header:
     ```http
     Authorization: Token <YOUR_AUTH_TOKEN>
     ```

3. **Session Verification on App Load:**
   - On app startup, `AuthContext` checks if a token exists in `localStorage`.
   - If found, it calls `GET /api/auth/me/` to verify session validity.
   - If the token is valid, the user state is restored.
   - If expired or invalidated (`401`), the token is cleared from `localStorage`.

4. **Sign Out:**
   - Clicking **Sign Out** triggers `POST /api/auth/logout/` to invalidate the token on the backend server.
   - Local state and `localStorage` are cleared immediately.

### Security Trade-Offs (Student Assignment Scope)
Storing tokens in browser `localStorage` provides persistence across browser refreshes and tabs without complex server-side cookie setups. In high-security production environments, HTTP-only secure cookies with CSRF tokens or short-lived JWTs with refresh rotation are preferable against potential XSS vectors. For this student portfolio assignment, `localStorage` combined with input sanitization and strict DRF authorization provides an effective, inspectable solution.

---

## 10. API Endpoints Consumed

| Action | HTTP Method | Endpoint | Auth Required | Description |
|---|---|---|---|---|
| **Register** | `POST` | `/api/auth/register/` | No | Registers user and returns auth token |
| **Login** | `POST` | `/api/auth/login/` | No | Authenticates credentials and returns token |
| **User Profile** | `GET` | `/api/auth/me/` | **Yes** (`Token`) | Retrieves authenticated user details |
| **Logout** | `POST` | `/api/auth/logout/` | **Yes** (`Token`) | Revokes authentication token on backend |
| **Public Projects** | `GET` | `/api/projects/public/` | No | Lists all projects across owners |
| **Public Detail** | `GET` | `/api/projects/public/<id>/` | No | Retrieves individual public project |
| **My Projects** | `GET` | `/api/projects/` | **Yes** (`Token`) | Lists user-isolated projects for owner |
| **Create Project** | `POST` | `/api/projects/` | **Yes** (`Token`) | Creates project owned by logged-in user |
| **Owner Detail** | `GET` | `/api/projects/<id>/` | **Yes** (`Token`) | Retrieves project for owner |
| **Full Update** | `PUT` | `/api/projects/<id>/` | **Yes** (`Token`) | Fully updates project owned by user |
| **Partial Update** | `PATCH` | `/api/projects/<id>/` | **Yes** (`Token`) | Partially updates specific project fields |
| **Delete Project** | `DELETE` | `/api/projects/<id>/` | **Yes** (`Token`) | Permanently deletes project |

---

## 11. Production Build & Verification

### Running the Build
To compile the production-ready static assets:
```bash
npm run build
```
Vite will output optimized, minified bundles into the `dist/` directory.

### Previewing the Production Build
To preview the generated build locally:
```bash
npm run preview
```

### Running Automated Integration Tests
The repository includes an end-to-end integration test (`test_integration.mjs`) that verifies all 13 core requirements against the running Django backend:
```bash
npm test
```

---

## 12. Troubleshooting

### 1. "Cannot connect to backend server at http://127.0.0.1:8000/api"
- Ensure the Django development server is running:
  ```bash
  python manage.py runserver 127.0.0.1:8000
  ```
- Check that the URL in `frontend/.env` matches your Django server's port.

### 2. CORS Errors in Browser Console
- Ensure `http://localhost:5173` and `http://127.0.0.1:5173` are listed in `CORS_ALLOWED_ORIGINS` in `portfolio/backend/config/settings.py` and `portfolio/backend/.env`.
- Ensure `DEBUG=True` in `backend/.env` during local development.

### 3. Authentication Errors (401 / 403)
- Verify that demo user credentials are used:
  - Username: `demo_user`
  - Password: `StrongPassword123`
- If modifying projects, remember that the backend enforces `IsOwner`: only the authenticated owner can edit or delete a project.
