import React from 'react';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Target,
  Globe,
  Lightbulb
} from 'lucide-react';

const LearnMore: React.FC = () => {
  const missions = [
    {
      icon: Heart,
      title: 'Spiritual Growth',
      description: 'Nurturing believers in their personal relationship with Christ through prayer, worship, and biblical teaching.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Creating meaningful connections and lasting friendships within our faith community.',
      color: 'bg-indigo-500'
    },
    {
      icon: Globe,
      title: 'Global Outreach',
      description: 'Spreading God\'s love beyond our walls through missions and community service.',
      color: 'bg-purple-500'
    },
    {
      icon: Lightbulb,
      title: 'Biblical Education',
      description: 'Providing comprehensive Bible study and theological education for all ages.',
      color: 'bg-blue-600'
    }
  ];

  const programs = [
    {
      title: 'Sunday Worship Service',
      description: 'Traditional and contemporary worship with inspiring messages',
      time: 'Sundays 10:00 AM - 11:30 AM',
      participants: '150+ members'
    },
    {
      title: 'Bible Study Groups',
      description: 'Small group studies for deeper scriptural understanding',
      time: 'Wednesdays 7:00 PM - 8:30 PM',
      participants: '8 groups'
    },
    {
      title: 'Youth Ministry',
      description: 'Engaging programs for teenagers and young adults',
      time: 'Saturdays 4:00 PM - 6:00 PM',
      participants: '35+ youth'
    },
    {
      title: 'Children\'s Ministry',
      description: 'Fun and educational programs for kids',
      time: 'Sundays during service',
      participants: '25+ children'
    }
  ];

  const values = [
    'Biblical Truth and Authority',
    'Grace and Forgiveness',
    'Love and Compassion',
    'Community and Fellowship',
    'Service and Outreach',
    'Prayer and Worship',
    'Discipleship and Growth',
    'Unity in Diversity'
  ];

  const stats = [
    { number: '500+', label: 'Active Members' },
    { number: '15', label: 'Years Serving' },
    { number: '25+', label: 'Ministries' },
    { number: '1000+', label: 'Lives Touched' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-yellow-300">LWC</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-4 font-light">Life With Christ</p>
          <div className="w-24 h-1 bg-yellow-300 mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed opacity-90">
            A vibrant Christian community dedicated to growing in faith, serving others, 
            and spreading the love of Christ throughout our world.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-30 animate-bounce"></div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We exist to glorify God by making disciples of Jesus Christ who love God, 
              love others, and serve the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {missions.map((mission, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
                <div className={`${mission.color} p-4 rounded-xl inline-block mb-6`}>
                  <mission.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">{mission.title}</h3>
                <p className="text-gray-600 leading-relaxed">{mission.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Programs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the various ways you can grow in faith and connect with our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{program.title}</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">{program.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-blue-700">
                    <Clock className="h-5 w-5 mr-3" />
                    <span className="font-medium">{program.time}</span>
                  </div>
                  <div className="flex items-center text-blue-700">
                    <Users className="h-5 w-5 mr-3" />
                    <span className="font-medium">{program.participants}</span>
                  </div>
                </div>
                
                <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center">
                  Learn More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Core Values</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              These fundamental beliefs guide everything we do as a community of faith.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-6 w-6 text-yellow-300 mr-3" />
                  <h3 className="text-lg font-semibold">{value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Impact</h2>
            <p className="text-xl text-gray-600">
              See how God is working through our community to make a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <div className="text-5xl font-bold text-blue-600 mb-3">{stat.number}</div>
                <div className="text-xl text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Leadership</h2>
            <p className="text-xl text-gray-600">
              Meet the dedicated servants who guide our community in faith and service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Pastor John Smith', role: 'Senior Pastor', experience: '15 years ministry' },
              { name: 'Sarah Johnson', role: 'Worship Leader', experience: '8 years leading worship' },
              { name: 'Michael Chen', role: 'Youth Pastor', experience: '5 years youth ministry' }
            ].map((leader, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300">
                <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">{leader.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{leader.role}</p>
                <p className="text-gray-600">{leader.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Visit Us</h2>
          <p className="text-xl mb-12 opacity-90">
            We'd love to welcome you into our community family!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <MapPin className="h-8 w-8 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Location</h3>
              <p className="opacity-90">123 Faith Street<br />Community City, CC 12345</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <Clock className="h-8 w-8 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Service Times</h3>
              <p className="opacity-90">Sunday: 10:00 AM<br />Wednesday: 7:00 PM</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <MessageCircle className="h-8 w-8 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Contact</h3>
              <p className="opacity-90">(555) 123-4567<br />info@lwc.org</p>
            </div>
          </div>

          <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
            Plan Your Visit
          </button>
        </div>
      </section>
    </div>
  );
};

export default LearnMore;