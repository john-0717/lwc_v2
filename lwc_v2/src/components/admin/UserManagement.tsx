import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  MoreHorizontal,
  Eye
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  role: 'member' | 'leader' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  ministries: string[];
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      joinDate: '2023-01-15',
      role: 'admin',
      status: 'active',
      ministries: ['Worship Team', 'Leadership'],
      lastActive: '2024-01-20'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 234-5678',
      joinDate: '2023-03-22',
      role: 'leader',
      status: 'active',
      ministries: ['Children\'s Ministry', 'Prayer Warriors'],
      lastActive: '2024-01-19'
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 345-6789',
      joinDate: '2023-06-10',
      role: 'leader',
      status: 'active',
      ministries: ['Youth Ministry'],
      lastActive: '2024-01-20'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '(555) 456-7890',
      joinDate: '2023-09-05',
      role: 'member',
      status: 'active',
      ministries: ['Outreach Team'],
      lastActive: '2024-01-18'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '(555) 567-8901',
      joinDate: '2024-01-10',
      role: 'member',
      status: 'pending',
      ministries: [],
      lastActive: '2024-01-15'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const roles = ['All', 'member', 'leader', 'admin'];
  const statuses = ['All', 'active', 'inactive', 'pending'];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'leader': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleStatusChange = (id: number, newStatus: 'active' | 'inactive' | 'pending') => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: newStatus } : user
    ));
  };

  const UserForm = ({ user, onSave, onCancel }: { 
    user?: User; 
    onSave: (user: Partial<User>) => void; 
    onCancel: () => void; 
  }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'member',
      status: user?.status || 'active',
      ministries: user?.ministries || []
    });

    const availableMinistries = [
      'Worship Team', 'Children\'s Ministry', 'Youth Ministry', 
      'Outreach Team', 'Prayer Warriors', 'Leadership'
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const toggleMinistry = (ministry: string) => {
      setFormData({
        ...formData,
        ministries: formData.ministries.includes(ministry)
          ? formData.ministries.filter(m => m !== ministry)
          : [...formData.ministries, ministry]
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ministries</label>
              <div className="grid grid-cols-2 gap-2">
                {availableMinistries.map(ministry => (
                  <label key={ministry} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ministries.includes(ministry)}
                      onChange={() => toggleMinistry(ministry)}
                      className="mr-2"
                    />
                    <span className="text-sm">{ministry}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {user ? 'Update User' : 'Add User'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">User Management</h2>
          <p className="text-gray-600">Manage community members and their roles</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Users</p>
              <p className="text-3xl font-bold text-green-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
            <UserX className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Leaders</p>
              <p className="text-3xl font-bold text-purple-900">
                {users.filter(u => u.role === 'leader' || u.role === 'admin').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'All' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-medium text-gray-700">User</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Contact</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Role</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Ministries</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Last Active</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">Joined {user.joinDate}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {user.ministries.map(ministry => (
                      <span key={ministry} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {ministry}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {user.lastActive}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      title="Edit User"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Forms */}
      {showCreateForm && (
        <UserForm
          onSave={(userData) => {
            const newUser: User = {
              id: Date.now(),
              ...userData,
              joinDate: new Date().toISOString().split('T')[0],
              lastActive: new Date().toISOString().split('T')[0]
            } as User;
            setUsers([...users, newUser]);
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onSave={(userData) => {
            setUsers(users.map(user => 
              user.id === editingUser.id 
                ? { ...user, ...userData }
                : user
            ));
            setEditingUser(null);
          }}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;