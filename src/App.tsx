import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { EmailProvider } from './context/EmailContext';
import { IntegrationProvider } from './context/IntegrationContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import PipelinePage from './pages/PipelinePage';
import PhoneSearchPage from './pages/PhoneSearchPage';
import BranchesPage from './pages/BranchesPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="phone-search" element={<PhoneSearchPage />} />
        <Route path="phone-search/:phoneNumber" element={<PhoneSearchPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <DataProvider>
              <EmailProvider>
                <IntegrationProvider>
                  <div className="min-h-screen bg-gray-50 text-gray-900">
                    <AppRoutes />
                  </div>
                </IntegrationProvider>
              </EmailProvider>
            </DataProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;