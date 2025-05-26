import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentTheme } = useTheme();
  
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-orange-500">{currentTheme.headerName}</h1>
          <p className="mt-2 text-gray-600 text-xl">Customer Relationship Management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;