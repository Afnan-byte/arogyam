import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser, userRole } = useAuth();

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <HeartPulse className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If we require a specific role and the user doesn't have it, redirect them to their own dashboard
  if (allowedRole && userRole !== allowedRole) {
    if (userRole) {
      return <Navigate to={`/${userRole}`} replace />;
    }
    // Fallback if role is not yet loaded or doesn't match anything
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
