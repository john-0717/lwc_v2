import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import GoogleAuth from './GoogleAuth';
import { useAuth } from './AuthContext';

const AuthButton: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleAuthSuccess = (userData: any) => {
    login(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {user.picture ? (
            <img
              src={user.picture}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-blue-600"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">
            {user.name.split(' ')[0]}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </button>

      {showAuth && (
        <GoogleAuth
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
};

export default AuthButton;