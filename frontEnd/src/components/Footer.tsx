import React from 'react';
import {  Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg">
                <img src="public/logo_primary.svg" alt="Site Logo"
                className="w-[50px] h-[50px] object-contain"
                style={{"borderRadius":"50%"}}
                ></img>
              </div>
              <div>
                <h3 className="text-xl font-bold">Faith Community</h3>
                <p className="text-sm text-blue-600">Unite in Christ</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              A Christ-centered spiritual community where believers gather, discuss, pray, and grow together in faith.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Our Beliefs</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Leadership</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Events</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Ministries</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Give</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Daily Devotionals</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Bible Studies</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Sermons</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Prayer Guides</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Community Guidelines</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-600 transition-colors duration-200">Help Center</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-300">123 Faith Street, Community City, CC 12345</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-300">(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-300">info@faithcommunity.org</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">Service Times</h5>
              <p className="text-gray-300 text-sm">
                Sunday Worship: 10:00 AM<br />
                Wednesday Bible Study: 7:00 PM<br />
                Friday Prayer Meeting: 6:30 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="h-4 w-4 text-blue-600 mr-2" />
              <p className="text-gray-300 text-sm">
                Made with love for the Kingdom of God
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © 2024 Faith Community. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-200">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;