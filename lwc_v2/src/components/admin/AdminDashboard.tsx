import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  BarChart3, 
  Settings, 
  Bell,
  TrendingUp,
  MessageSquare,
  Heart,
  BookOpen
} from 'lucide-react';
import EventManagement from './EventManagement';
import UserManagement from './UserManagement';
import JoinRequestsManagement from './JoinRequestsManagement';

type AdminTab = 'dashboard' | 'events' | 'users' | 'requests' | 'analytics' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const stats = [
    {
      title: 'Total Members',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Discussions',
      value: '89',
      change: '+8%',
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      title: 'Prayer Requests',
      value: '156',
      change: '+15%',
      icon: Heart,
      color: 'bg-purple-500'
    },
    {
      title: 'Events This Month',
      value: '12',
      change: '+3%',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    { type: 'user', message: 'New member Sarah Johnson joined', time: '2 hours ago' },
    { type: 'event', message: 'Bible Study event created for next Wednesday', time: '4 hours ago' },
    { type: 'prayer', message: '5 new prayer requests submitted', time: '6 hours ago' },
    { type: 'discussion', message: 'New discussion about faith and growth started', time: '8 hours ago' },
    { type: 'join', message: '3 new join requests for Worship Team', time: '1 day ago' }
  ];

  const pendingRequests = [
    { type: 'Worship Team', count: 8 },
    { type: 'Children\'s Ministry', count: 5 },
    { type: 'Outreach Team', count: 12 },
    { type: 'Prayer Warriors', count: 6 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventManagement />;
      case 'users':
        return <UserManagement />;
      case 'requests':
        return <JoinRequestsManagement />;
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Growth</h3>
                <div className="h-64 bg-white rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder - Member growth over time</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Engagement Metrics</h3>
                <div className="h-64 bg-white rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder - Discussion and prayer activity</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Site Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input type="text" defaultValue="LWC - Life With Christ" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input type="email" defaultValue="info@lwc.org" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Email notifications for new members</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Email notifications for new prayer requests</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Daily activity digest</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                      <div className="flex-1">
                        <p className="text-gray-800">{activity.message}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Requests */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Pending Join Requests</h3>
                <div className="space-y-4">
                  {pendingRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="font-medium text-gray-800">{request.type}</span>
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm">
                        {request.count}
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Manage All Requests
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('events')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Create Event
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Member
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors duration-200 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Send Notification
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your community and track engagement</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'requests', label: 'Join Requests', icon: UserPlus },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;