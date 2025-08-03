import React, { useState, useEffect } from 'react';
import GoogleButton from "react-google-button"
import { User, Mail, Phone, MapPin, Calendar, Building, Heart, Save, X, Shield } from 'lucide-react';
import apiService from '../../services/api.service';
import APIRoutes from '../../services/api.routes';
interface UserData {
  firstName?: string,
  lastName?: string,
  id: string;
  email: string;
  name?: string;
  picture?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  occupation?: string;
  church?: string;
  interests: string[];
  testimony?: string;
  preferences: {
    emailNotifications: boolean;
    prayerUpdates: boolean;
    eventReminders: boolean;
    newsletter: boolean;
  };
}

interface GoogleAuthProps {
  onAuthSuccess: (userData: UserData) => void;
  onClose: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onAuthSuccess, onClose }) => {
  const [user, setUser] = useState<any>(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [userForm, setUserForm] = useState<Partial<UserData>>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    church: '',
    interests: [],
    testimony: '',
    preferences: {
      emailNotifications: true,
      prayerUpdates: true,
      eventReminders: true,
      newsletter: false
    }
  });

  const interestOptions = [
    'Bible Study', 'Prayer Ministry', 'Worship Music', 'Youth Ministry',
    'Children\'s Ministry', 'Outreach & Missions', 'Community Service',
    'Christian Fellowship', 'Discipleship', 'Counseling & Support',
    'Teaching & Education', 'Leadership Development'
  ];

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window !== 'undefined' && window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: '485587219808-7cnm4pt9ekvbk8h0835m4bv5hufjuc2t.apps.googleusercontent.com',
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: "popup",
          });
        } catch (e) {
          console.log(e)
        }

      }
    };

    // Load Google Identity Services script
    if (!document.querySelector('script[src*="accounts.google.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      const decoded = JSON.parse(atob(response.credential.split('.')[1]));
      setGoogleUser(decoded);
      let res = await apiService.post(APIRoutes.USER_SIGNUP, { email: decoded.email });
      if (res.status) {
        debugger
        setUser(res.data);
        setShowUserForm(res.data.isPopup);

        localStorage.setItem("token", res.extra_meta.access_token)
        localStorage.setItem("user", JSON.stringify(res.data))
        if (!res.data.isPopup) {
          onAuthSuccess(res.data);
        }

      } else {
        setShowUserForm(false);
        setUser(null);
        localStorage.clear()
      }

      // Pre-fill form with Google data
      setUserForm(prev => ({
        ...prev,
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      }));
    } catch (error) {
      console.error('Error processing Google response:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    try {
      setLoading(true);
      if (window.google) {
        window.google.accounts.id.prompt((notification: any) => {
          setLoading(false);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google Sign-In was not displayed or skipped');
          }
        });
      } else {
        setLoading(false);
        alert('Google Sign-In is not available. Please refresh the page and try again.');
      }
    } catch (e) {
      console.log(e)
    }

  };

  const handleInterestToggle = (interest: string) => {
    setUserForm(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  const handleSubmitUserInfo = async () => {
    setLoading(true);

    try {
      // Here you would send the data to your Node.js backend
      const userData: UserData = {
        id: userForm.id!,
        email: userForm.email!,
        firstName: userForm.firstName!,
        lastName: userForm.lastName!,
        picture: userForm.picture,
        phone: userForm.phone,
        address: userForm.address,
        dateOfBirth: userForm.dateOfBirth,
        occupation: userForm.occupation,
        church: userForm.church,
        interests: userForm.interests || [],
        testimony: userForm.testimony,
        preferences: userForm.preferences!
      };

      // Simulate API call to your Node.js backend
      console.log('Sending user data to backend:', userData);
      let res = await apiService.post(APIRoutes.USER_FINISH_SIGNUP, userData);
      localStorage.setItem("user", userData.toString())
      // if (res.status) {
      //   throw new Error('Failed to save user data');
      // }

      // Simulate successful save
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAuthSuccess(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
      alert('Failed to save user information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showUserForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to LWC</h2>
            <p className="text-gray-600">Join our Christian community and grow in faith together</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
            >
              <GoogleButton
                type="light"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 my-8 shadow-2xl overflow-y-auto h-[90%]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {googleUser?.picture ? (
              <img
                src={googleUser.picture}
                alt="Profile"
                className="w-16 h-16 rounded-full border-4 border-blue-600"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {googleUser?.name}!
          </h2>
          <p className="text-gray-600">Help us get to know you better</p>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    First Name
                  </label>
                  <input
                    type="tel"
                    value={userForm.firstName || ''}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Last Name
                  </label>
                  <input
                    type="tel"
                    value={userForm.lastName || ''}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Last Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userForm.phone || ''}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={userForm.dateOfBirth || ''}
                    onChange={(e) => setUserForm({ ...userForm, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  value={userForm.address || ''}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-2" />
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={userForm.occupation || ''}
                    onChange={(e) => setUserForm({ ...userForm, occupation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your profession"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="h-4 w-4 inline mr-2" />
                    Current Church (Optional)
                  </label>
                  <input
                    type="text"
                    value={userForm.church || ''}
                    onChange={(e) => setUserForm({ ...userForm, church: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Church name"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6 py-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Interests & Ministry</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Areas of Interest (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userForm.interests?.includes(interest) || false}
                        onChange={() => handleInterestToggle(interest)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testimony (Optional)
                </label>
                <textarea
                  value={userForm.testimony || ''}
                  onChange={(e) => setUserForm({ ...userForm, testimony: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Share your faith journey or testimony..."
                />
              </div>
            </div>
            {/* <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Communication Preferences</h4>
                <div className="space-y-3">
                  {[
                    { key: 'emailNotifications', label: 'Email notifications for community updates' },
                    { key: 'prayerUpdates', label: 'Prayer request updates and responses' },
                    { key: 'eventReminders', label: 'Event reminders and announcements' },
                    { key: 'newsletter', label: 'Monthly newsletter and devotionals' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userForm.preferences?.[key as keyof typeof userForm.preferences] || false}
                        onChange={(e) => setUserForm({
                          ...userForm,
                          preferences: {
                            ...userForm.preferences!,
                            [key]: e.target.checked
                          }
                        })}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div> */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleSubmitUserInfo}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Privacy Notice:</strong> Your information is secure and will only be used to enhance your experience in our Christian community. We never share your personal data with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuth;