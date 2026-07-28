import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { CalculatorProvider } from './context/CalculatorContext';
import { AssessmentProvider } from './context/AssessmentContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy load pages for performance
const Home = React.lazy(() => import('./pages/Home'));
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Assessment = React.lazy(() => import('./pages/Assessment'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const History = React.lazy(() => import('./pages/History'));
const About = React.lazy(() => import('./pages/About'));
const Community = React.lazy(() => import('./pages/Community'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center relative">
    <div className="absolute inset-0 mesh-bg opacity-40" />
    <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin z-10" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CalculatorProvider>
        <AssessmentProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              {/* Skip to main content — accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
                style={{ background: 'var(--color-primary)', color: '#000' }}
              >
                Skip to content
              </a>
              <Navbar />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
<Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/community" element={<ErrorBoundary><Community /></ErrorBoundary>} />

                      {/* Legacy /calculator route redirects seamlessly to /assessment */}
                      <Route path="/calculator" element={<Navigate to="/assessment" replace />} />
                      
                      <Route
                        path="/assessment"
                        element={
                          <ProtectedRoute>
                            <ErrorBoundary>
                              <Assessment />
                            </ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <ErrorBoundary>
                              <Dashboard />
                            </ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/history"
                        element={
                          <ProtectedRoute>
                            <ErrorBoundary>
                              <History />
                            </ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Operations Center — RBAC-guarded */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <ErrorBoundary>
                              <AdminDashboard />
                            </ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          </Router>
        </AssessmentProvider>
      </CalculatorProvider>
    </AuthProvider>
  );
}

export default App;
