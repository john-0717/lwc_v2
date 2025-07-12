import React, { useState, useRef, useEffect } from 'react';
import { Cross, Users, MessageCircle, Heart, BookOpen, User, ChevronDown, Settings, LogOut, Shield, Trophy, BarChart3, FileText } from 'lucide-react';
import type { Section } from '../App';

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, isAdmin, setIsAdmin }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'home' as Section, label: 'Home', icon: Cross },
    { id: 'community' as Section, label: 'Community', icon: Users },
    { id: 'discussions' as Section, label: 'Discussions', icon: MessageCircle },
    { id: 'prayer' as Section, label: 'Prayer', icon: Heart },
    { id: 'resources' as Section, label: 'Resources', icon: BookOpen }
  ];

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
    setActiveSection('profile');
    setShowProfileDropdown(false);
  };

  const handleAdminClick = () => {
    setActiveSection('admin');
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    setIsAdmin(true);
    setActiveSection('home');
    setShowProfileDropdown(false);
  };

  return (
    <>
      {/* Desktop Header - Top */}
      <header className="hidden md:block bg-white shadow-lg sticky top-0 z-50 border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cross className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">LWC</h1>
                <p className="text-sm text-blue-600">Life With Christ</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
              
              {/* Desktop Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeSection === 'profile' || activeSection === 'admin'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
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
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={() => {
                        setActiveSection('exams');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <BookOpen className="h-4 w-4 mr-3" />
                      Exams
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveSection('leaderboard');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Trophy className="h-4 w-4 mr-3" />
                      Leaderboard
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveSection('results');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Results
                    </button>
                    
                    <hr className="my-2" />
                    
                    {isAdmin && (
                      <button
                        onClick={handleAdminClick}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Shield className="h-4 w-4 mr-3" />
                        Admin Panel
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    
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
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header - Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Mobile Profile Dropdown - Above Bottom Nav */}
        {showProfileDropdown && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </button>
              
              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Admin Panel
                </button>
              )}
              
              <hr className="my-2" />
              
              <button
                onClick={() => {
                  setActiveSection('exams');
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Exams
              </button>
              
              <button
                onClick={() => {
                  setActiveSection('leaderboard');
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Trophy className="h-5 w-5 mr-3" />
                Leaderboard
              </button>
              
              <button
                onClick={() => {
                  setActiveSection('results');
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Results
              </button>
              
              <hr className="my-2" />
              
              <button
                onClick={() => setShowProfileDropdown(false)}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </button>
              
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
            {navItems.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                  activeSection === id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">
                  {id === 'home' ? 'Home' : 
                   id === 'community' ? 'Community' : 
                   id === 'discussions' ? 'Discuss' : 
                   id === 'prayer' ? 'Prayer' : 
                   'Resources'}
                </span>
              </button>
            ))}
            
            {/* Mobile Profile Button */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                activeSection === 'profile' || activeSection === 'admin' || activeSection === 'exams' || activeSection === 'leaderboard' || activeSection === 'results' || showProfileDropdown
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Spacer - to prevent content from being hidden behind bottom nav */}
      <div className="md:hidden h-20"></div>
    </>
  );
};

export default Header;