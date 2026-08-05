import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <HeartPulse className="h-8 w-8 text-primary" />
                <span className="font-bold text-2xl text-gray-900 tracking-tight">Arogya</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <Link to={userRole ? `/${userRole}` : "/"} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all shadow-primary/25 hover:shadow-primary/40">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Log in
                  </Link>
                  <Link to="/login" className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all shadow-primary/25 hover:shadow-primary/40">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Arogya Campus Healthcare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
