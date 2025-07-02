import React from 'react';
import { Calendar, MapPin, Clock, Users, Coffee, Bookmark } from 'lucide-react';

const Community: React.FC = () => {
  const events = [
    {
      title: 'Sunday Worship Service',
      date: 'Every Sunday',
      time: '10:00 AM - 11:30 AM',
      location: 'Main Sanctuary',
      description: 'Join us for worship, prayer, and inspiring messages from Scripture.',
      attendees: 150,
      type: 'worship'
    },
    {
      title: 'Bible Study Group',
      date: 'Wednesdays',
      time: '7:00 PM - 8:30 PM',
      location: 'Community Room',
      description: 'Deep dive into Scripture with fellow believers in small group setting.',
      attendees: 25,
      type: 'study'
    },
    {
      title: 'Prayer Meeting',
      date: 'Fridays',
      time: '6:30 PM - 7:30 PM',
      location: 'Prayer Chapel',
      description: 'Come together to pray for our community and share testimonies.',
      attendees: 40,
      type: 'prayer'
    },
    {
      title: 'Youth Fellowship',
      date: 'Saturdays',
      time: '4:00 PM - 6:00 PM',
      location: 'Youth Center',
      description: 'Fun activities, games, and spiritual growth for ages 13-25.',
      attendees: 35,
      type: 'youth'
    }
  ];

  const ministries = [
    {
      title: 'Worship Team',
      description: 'Lead our congregation in meaningful worship through music and song.',
      icon: '🎵',
      members: 12
    },
    {
      title: 'Children\'s Ministry',
      description: 'Nurture young hearts and minds in the love of Christ.',
      icon: '👶',
      members: 18
    },
    {
      title: 'Outreach Team',
      description: 'Share God\'s love with our local community through service.',
      icon: '🤝',
      members: 22
    },
    {
      title: 'Prayer Warriors',
      description: 'Dedicate time to intercede for our community and world needs.',
      icon: '🙏',
      members: 30
    }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'worship': return 'bg-blue-500';
      case 'study': return 'bg-green-500';
      case 'prayer': return 'bg-purple-500';
      case 'youth': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Our Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the many ways to get involved and grow in faith together with fellow believers.
          </p>
        </div>

        {/* Upcoming Events */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-blue-900">Upcoming Events</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${getEventColor(event.type)} p-2 rounded-lg`}>
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{event.attendees} attending</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-blue-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Join Event
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Ministries */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Coffee className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-blue-900">Ministry Opportunities</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ministries.map((ministry, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 text-center border border-gray-100">
                <div className="text-4xl mb-4">{ministry.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{ministry.title}</h3>
                <p className="text-gray-600 mb-4">{ministry.description}</p>
                <div className="flex items-center justify-center text-blue-600 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{ministry.members} members</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Get Involved
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Community Guidelines */}
        <section className="bg-blue-50 rounded-xl p-8">
          <div className="flex items-center mb-6">
            <Bookmark className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-blue-900">Community Guidelines</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Our Values</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Love God with all our heart, soul, and mind</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Love our neighbors as ourselves</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Show grace, kindness, and understanding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Encourage spiritual growth and learning</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Participation Guidelines</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Respect all community members</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Keep discussions focused on faith and growth</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Share openly and listen actively</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Maintain confidentiality when requested</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Community;