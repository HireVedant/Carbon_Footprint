import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import About from './pages/About';
import Community from './pages/Community';
import AdminDashboard from './pages/admin/AdminDashboard';
import { CalculatorProvider } from './context/CalculatorContext';
import { AssessmentProvider } from './context/AssessmentContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CalculatorProvider>
        <AssessmentProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/community" element={<Community />} />

                  {/* Legacy /calculator route redirects seamlessly to /assessment */}
                  <Route path="/calculator" element={<Navigate to="/assessment" replace />} />
                  <Route
                    path="/assessment"
                    element={
                      <ProtectedRoute>
                        <Assessment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <History />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Operations Center — RBAC-guarded */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
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
