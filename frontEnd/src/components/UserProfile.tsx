import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  MessageCircle, 
  Heart, 
  Edit3, 
  Camera, 
  Lock, 
  Mail, 
  LogOut,
  Plus,
  Eye,
  ThumbsUp,
  Clock,
  Save,
  X
} from 'lucide-react';

interface UserQuestion {
  id: number;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  replies: number;
  likes: number;
  views: number;
}

interface UserPrayer {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  prayerCount: number;
  isUrgent: boolean;
}

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'questions' | 'prayers' | 'settings'>('questions');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    joinDate: 'January 2024',
    bio: 'Passionate about growing in faith and serving the community.',
    avatar: null as string | null
  });

  const [userQuestions] = useState<UserQuestion[]>([
    {
      id: 1,
      title: 'How to maintain faith during difficult times?',
      content: 'I\'ve been going through some challenging circumstances lately and finding it hard to keep my faith strong...',
      category: 'Faith & Growth',
      timestamp: '3 days ago',
      replies: 12,
      likes: 8,
      views: 45
    },
    {
      id: 2,
      title: 'Best practices for daily prayer routine',
      content: 'Looking for advice on establishing a consistent prayer life that fits with a busy schedule...',
      category: 'Prayer Life',
      timestamp: '1 week ago',
      replies: 18,
      likes: 15,
      views: 67
    }
  ]);

  const [userPrayers] = useState<UserPrayer[]>([
    {
      id: 1,
      title: 'Healing for my father',
      content: 'Please pray for my father who is recovering from surgery. Pray for complete healing and strength.',
      timestamp: '2 days ago',
      prayerCount: 23,
      isUrgent: true
    },
    {
      id: 2,
      title: 'Guidance in career decision',
      content: 'Seeking God\'s wisdom for an important career opportunity that has come up.',
      timestamp: '1 week ago',
      prayerCount: 15,
      isUrgent: false
    }
  ]);

  const handleSaveProfile = () => {
    setEditingProfile(false);
    // Save profile logic here
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserInfo({ ...userInfo, avatar: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Faith & Growth': return 'bg-blue-100 text-blue-800';
      case 'Prayer Life': return 'bg-purple-100 text-purple-800';
      case 'Bible Study': return 'bg-green-100 text-green-800';
      case 'Service & Outreach': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              {editingProfile && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              {editingProfile ? (
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-600"
                  />
                  <textarea
                    value={userInfo.bio}
                    onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                    className="w-full p-2 text-gray-600 bg-transparent border border-gray-300 focus:outline-none focus:border-blue-600 rounded-lg"
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{userInfo.name}</h1>
                  <p className="text-gray-600 mb-2">{userInfo.email}</p>
                  <p className="text-gray-700 mb-4">{userInfo.bio}</p>
                  <p className="text-sm text-gray-500">Member since {userInfo.joinDate}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {editingProfile ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userQuestions.length}</div>
              <div className="text-gray-600">Questions Posted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userPrayers.length}</div>
              <div className="text-gray-600">Prayer Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">47</div>
              <div className="text-gray-600">Replies Given</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-gray-600">Prayers Offered</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-orange-50'
                }`}
              >
                <MessageCircle className="h-5 w-5 inline mr-2" />
                My Questions
              </button>
              <button
                onClick={() => setActiveTab('prayers')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === 'prayers'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-orange-50'
                }`}
              >
                <Heart className="h-5 w-5 inline mr-2" />
                My Prayers
              </button>
              {/* <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-orange-50'
                }`}
              >
                <Settings className="h-5 w-5 inline mr-2" />
                Settings
              </button> */}
            </nav>
          </div>

          <div className="p-8">
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">My Questions</h2>
                  <button
                    onClick={() => setShowNewQuestion(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Question
                  </button>
                </div>

                {showNewQuestion && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Ask a New Question</h3>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Question title..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                      />
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent">
                        <option>Select Category</option>
                        <option>Faith & Growth</option>
                        <option>Prayer Life</option>
                        <option>Bible Study</option>
                        <option>Service & Outreach</option>
                      </select>
                      <textarea
                        placeholder="Describe your question in detail..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                      />
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                          Post Question
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewQuestion(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {userQuestions.map((question) => (
                    <div key={question.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(question.category)}`}>
                          {question.category}
                        </span>
                        <span className="text-sm text-gray-500">{question.timestamp}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
                        {question.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4">{question.content}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {question.views} views
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {question.replies} replies
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {question.likes} likes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prayers Tab */}
            {activeTab === 'prayers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">My Prayer Requests</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Prayer Request
                  </button>
                </div>

                <div className="space-y-4">
                  {userPrayers.map((prayer) => (
                    <div key={prayer.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {prayer.isUrgent && (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{prayer.timestamp}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{prayer.title}</h3>
                      <p className="text-gray-600 mb-4">{prayer.content}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          {prayer.prayerCount} prayers
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {prayer.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {/* {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
                
                <div className="space-y-8">
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <Lock className="h-5 w-5 mr-2" />
                      Change Password
                    </h3>
                    <form className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Email Preferences
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span>Email notifications for new replies to my questions</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span>Email notifications for prayer request updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Weekly community digest</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Monthly newsletter</span>
                      </label>
                    </div>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                      Save Preferences
                    </button>
                  </div>

                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Privacy Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span>Show my profile to other community members</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span>Allow others to see my questions and prayers</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Show my activity status</span>
                      </label>
                    </div>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                      Update Privacy
                    </button>
                  </div>

                  
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="text-lg font-medium text-red-800 mb-4 flex items-center">
                      <LogOut className="h-5 w-5 mr-2" />
                      Account Actions
                    </h3>
                    <div className="space-y-3">
                      <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                      <p className="text-sm text-red-600">
                        You will be signed out of your account and redirected to the home page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;