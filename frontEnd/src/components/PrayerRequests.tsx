import React, { useEffect, useState } from 'react';
import { Heart, Plus, Clock, User, Shield, Send, AlertTriangle } from 'lucide-react';
import apiService from '../services/api.service';
import APIRoutes from '../services/api.routes';
import { useAuth } from './auth/AuthContext';
import GoogleAuth from './auth/GoogleAuth';
import { timeAgo } from '../utils/helpers';

interface PrayerRequest {
  id: number;
  title: string;
  author: string;
  content: string;
  timestamp: string;
  prayerCount: number;
  isUrgent: boolean;
  isAnonymous: boolean;
  usersPrayed?: any;
}

const PrayerRequests: React.FC = () => {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => [
    {
      id: 1,
      title: 'Healing for my grandmother',
      author: 'Sarah M.',
      content: 'Please pray for my grandmother who is in the hospital recovering from surgery. Pray for her healing and comfort during this difficult time.',
      timestamp: '2025-07-26T06:48:21.418+00:00',
      prayerCount: 23,
      isUrgent: true,
      isAnonymous: false
    }
  ]);
  const [prayerStats, setPrayerStats] = useState<any>({

    answeredCount: 0,
    activeCount: 4,
    prayerWarriorsCount: 1
  })
  // Authentication button
  const [showAuth, setShowAuth] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleAuthSuccess = (userData: any) => {
    login(userData);
    setShowAuth(false);
  };
  //authentication was closed
  const getPrayers = async () => {
    console.log(user, isAuthenticated)
    let apiPath = APIRoutes.GET_PRAYERS;

    let res: any = await apiService.get(apiPath)
    if (res.status) {
      setPrayerRequests(res.data)
    }
  }

  const getPrayerStats = async () => {
    let apiPath = APIRoutes.GET_PRAYER_STATS;
    let res: any = await apiService.get(apiPath)
    if (res.status) {
      setPrayerStats(res.data)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await getPrayers();
      await getPrayerStats();
    };

    fetchData();
  }, [])


  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isAnonymous: false,
    isUrgent: false,
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((prevErrors: any) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.details = 'Details are required';
    return newErrors;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log('Form submitted:', formData);
      let res = await apiService.post(APIRoutes.ADD_PRAYER_REQUEST, formData);
      if (res.status) {
        setShowNewRequestForm(!showNewRequestForm)
        setFormData({
          title: '',
          description: '',
          isAnonymous: false,
          isUrgent: false,
        })
        await getPrayers()
      }
    }
  };
  const token = localStorage.getItem("token")
  const addMemberToPray = async (id: any) => {
    if (!isAuthenticated) {
      setShowAuth(true)
      return
    }
    let res = await apiService.post(APIRoutes.ADD_USER_TO_PRAY, { id })
    console.log(res)
    if (res.status) {
      await getPrayers()
    }
  }
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Prayer Requests
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your prayer needs and lift each other up in Christian love and support
          </p>
        </div>

        {/* New Prayer Request Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => { debugger; token ? setShowNewRequestForm(!showNewRequestForm) : setShowAuth(true) }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center mx-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Share Prayer Request
          </button>
        </div>

        {/* New Prayer Request Form */}
        {showNewRequestForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Share Your Prayer Request</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prayer Request Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Brief description of your prayer need"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.details ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Share more details about your prayer request..."
                />
                {errors.details && (
                  <p className="text-red-500 text-sm mt-1">{errors.details}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Submit anonymously</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Mark as urgent</span>
                </label>
              </div>

              {/* Prayer Guidelines */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Prayer Request Guidelines</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Be specific about your prayer needs while respecting privacy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Use the anonymous option for sensitive personal matters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Mark urgent requests only for immediate health or safety concerns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Follow up with praise reports when prayers are answered</span>
                  </li>
                </ul>
              </div>


              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewRequestForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Prayer Requests List */}
        <div className="space-y-6">
          {prayerRequests.map((request) => (
            <div
              key={request.id}
              className=" bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >

              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  {request.title}
                </h3>
                <div className="flex items-center space-x-3">
                  {request.isUrgent && (
                    <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0 rounded-full text-sm font-medium flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgent
                    </span>
                  )}
                  {request.isAnonymous && (
                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0 rounded-full text-sm font-medium flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Anonymous
                    </span>
                  )}
                </div>
              </div>



              <p className="text-gray-700 mb-4 leading-relaxed">
                {request.content}
              </p>

              <div className="flex items-center justify-between">
                <div className='flex flex-row space-x-4'>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm">{request.author}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{timeAgo(request.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                    <span className="text-sm">{request.prayerCount} prayers</span>
                  </div>
                  {
                    !request?.usersPrayed?.includes(user?.userId) ? (
                      <button
                        onClick={() => addMemberToPray(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        Pray for This
                      </button>
                    ) : (
                      <p
                        className="text-blue-500 px-4 py-2 rounded-lg text-sm flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        Thanks for praying
                      </p>
                    )
                  }

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prayer Stats */}
        <div className="mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-8 text-white text-center">
          <Heart className="h-12 w-12 text-yellow-200 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Prayer Changes Everything</h2>
          <p className="text-xl mb-6 opacity-90">
            "Therefore confess your sins to each other and pray for each other so that you may be healed.
            The prayer of a righteous person is powerful and effective." - James 5:16
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-yellow-200 mb-2">{prayerStats.activeCount}</div>
              <div className="text-lg">Active Prayers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-200 mb-2">{prayerStats.answeredCount}</div>
              <div className="text-lg">Prayers Answered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-200 mb-2">{prayerStats.prayerWarriorsCount}</div>
              <div className="text-lg">Prayer Warriors</div>
            </div>
          </div>
        </div>


      </div>
      {showAuth && (
        <GoogleAuth
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
};

export default PrayerRequests;