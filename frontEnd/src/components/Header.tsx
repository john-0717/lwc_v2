import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cross, Users, MessageCircle, Heart, BookOpen, User, ChevronDown, Settings, LogOut, Shield, Edit, BarChart3, Trophy, Home } from 'lucide-react';
import AuthButton from './auth/AuthButton';
import { useAuth } from './auth/AuthContext';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  userRole: 'admin' | 'writer' | 'member' | 'user';
}

const Header: React.FC<HeaderProps> = ({ isAdmin, setIsAdmin, userRole }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  let { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/community', label: 'Community', icon: Users },
    // { path: '/discussions', label: 'Discussions', icon: MessageCircle },
    { path: '/prayer', label: 'Prayer', icon: Heart },
    // { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  // Add Articles nav item for writers and admins
  if ((user?.role === 'writer' || user?.role === 'admin') && isAuthenticated) {
    navItems.push({ path: '/articles', label: 'Articles', icon: Edit });
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileDropdown(false);
  };

  const handleExamsClick = () => {
    navigate('/exams');
    setShowProfileDropdown(false);
  };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard');
    setShowProfileDropdown(false);
  };

  const handleResultsClick = () => {
    navigate('/results');
    setShowProfileDropdown(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setShowProfileDropdown(false);
  };

  const handleArticlesClick = () => {
    navigate('/articles');
    setShowProfileDropdown(false);
  };

    const handleSettingsClick = () => {
      debugger
    navigate('/settings');
    setShowProfileDropdown(false);
  };


  const handleLogout = () => {
    logout();
    setIsAdmin(false);
    navigate('/');
    setShowProfileDropdown(false);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Header - Top */}
      <header className="hidden md:block bg-white shadow-lg sticky top-0 z-50 border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cross className="h-8 w-8 text-white" />
              </div>
              <div>
              </div>
            </Link>
            <div className='flex items-center space-x-1'>
              <nav className="flex space-x-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActiveRoute(path)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}
              </nav>

              {/* Auth Section */}
              <div className="flex items-center space-x-2">
                {isAuthenticated && user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActiveRoute('/profile') || isActiveRoute('/admin') || isActiveRoute('/articles')
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                    >
                      {user.picture ? (
                        <img
                          src={user?.picture ? user?.picture?.split("=")[0] : ""}
                          alt="Profile"
                          className="w-6 h-6 rounded-full border border-blue-600"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="font-medium">{(user?.name || user?.firstName || "User").split(' ')[0]}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile
                        </button>

                        {(user.role === 'writer' || user.role === 'admin') && (
                          <button
                            onClick={handleArticlesClick}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-3" />
                            Article Editor
                          </button>
                        )}

                        {user.role === 'admin' && (
                          <button
                            onClick={handleAdminClick}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Shield className="h-4 w-4 mr-3" />
                            Admin Panel
                          </button>
                        )}

                        {/* <hr className="my-2" /> */}

                        {/* <button
                          onClick={
                            handleExamsClick
                          }
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <BookOpen className="h-5 w-5 mr-3" />
                          Exams
                        </button>

                        <button
                          onClick={handleLeaderboardClick
                          }
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Trophy className="h-5 w-5 mr-3" />
                          Leaderboard
                        </button>

                        <button
                          onClick={handleResultsClick
                          }
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <BarChart3 className="h-5 w-5 mr-3" />
                          Results
                        </button>

                        <hr className="my-2" /> */}

                        {/* <button
                          onClick={() => handleSettingsClick()}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </button> */}

                        <hr className="my-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <AuthButton />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Mobile Profile Dropdown - Above Bottom Nav */}
        {showProfileDropdown && isAuthenticated && user && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </button>

              {/* {(user.role === 'writer' || user.role === 'admin') && (
                <button
                  onClick={handleArticlesClick}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Edit className="h-5 w-5 mr-3" />
                  Article Editor
                </button>
              )}

              {user.role === 'admin' && (
                <button
                  onClick={handleAdminClick}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Admin Panel
                </button>
              )} */}


              {/* <hr className="my-2" />

              <button
                onClick={
                  handleExamsClick
                }
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Exams
              </button>

              <button
                onClick={handleLeaderboardClick
                }
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Trophy className="h-5 w-5 mr-3" />
                Leaderboard
              </button>

              <button
                onClick={handleResultsClick
                }
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Results
              </button>

              <hr className="my-2" /> */}


              {/* <button
                onClick={() => handleSettingsClick()}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </button> */}

              <hr className="my-2" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <nav className="bg-white border-t-2 border-blue-100 shadow-lg">
          <div className="flex justify-around items-center py-2">
            {navItems.slice(0, 4).map(({ path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${isActiveRoute(path)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">
                  {path === '/' ? 'Home' :
                    path === '/community' ? 'Community' :
                      path === '/discussions' ? 'Discuss' :
                        path === '/prayer' ? 'Prayer' : 'Resources'}
                </span>
              </Link>
            ))}

            {/* Mobile Profile/Auth Button */}
            {isAuthenticated && user ? (
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${isActiveRoute('/profile') || isActiveRoute('/admin') || isActiveRoute('/articles') || showProfileDropdown
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-5 h-5 rounded-full border border-current"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="text-xs mt-1 font-medium">Profile</span>
              </button>
            ) : (
              <div className="flex flex-col items-center p-2">
                <AuthButton />
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Spacer - to prevent content from being hidden behind bottom nav */}
      {/* <div className="md:hidden h-20"></div> */}
    </>
  );
};

export default Header;