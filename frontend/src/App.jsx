import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectFormPage from './pages/ProjectFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

export const App = () => {
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <main className="content-area" id="main-content">
          <Routes>
            {/* Root redirects to /projects */}
            <Route path="/" element={<Navigate to="/projects" replace />} />

            {/* Public and Authenticated Project Routes */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />

            {/* Protected Routes: Require Token Authentication */}
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <ProjectFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/edit"
              element={
                <ProtectedRoute>
                  <ProjectFormPage />
                </ProtectedRoute>
              }
            />

            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Site Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default App;
