import React, { useState } from 'react';
import { BookOpen, Download, Play, ExternalLink, Calendar, Star } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  type: 'devotional' | 'study' | 'audio' | 'video' | 'book';
  description: string;
  author: string;
  downloadUrl?: string;
  duration?: string;
  rating: number;
  downloadCount: number;
}

const Resources: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const resources: Resource[] = [
    {
      id: 1,
      title: 'Daily Bread Devotional',
      type: 'devotional',
      description: 'Start your day with God through these inspiring daily devotions focused on spiritual growth and practical Christian living.',
      author: 'Pastor John Smith',
      downloadUrl: '#',
      rating: 4.8,
      downloadCount: 1247
    },
    {
      id: 2,
      title: 'The Book of Romans Study Guide',
      type: 'study',
      description: 'A comprehensive 12-week study guide through Paul\'s letter to the Romans, perfect for small groups or personal study.',
      author: 'Dr. Sarah Johnson',
      downloadUrl: '#',
      rating: 4.9,
      downloadCount: 892
    },
    {
      id: 3,
      title: 'Worship & Praise Collection',
      type: 'audio',
      description: 'Beautiful collection of worship songs and hymns for personal meditation and group worship times.',
      author: 'Faith Community Choir',
      duration: '2h 15m',
      rating: 4.7,
      downloadCount: 634
    },
    {
      id: 4,
      title: 'Prayer Life Transformation',
      type: 'video',
      description: 'Learn practical strategies to deepen your prayer life and experience more meaningful communion with God.',
      author: 'Rev. Michael Chen',
      duration: '45 min',
      rating: 4.6,
      downloadCount: 1089
    },
    {
      id: 5,
      title: 'Psalms for Every Season',
      type: 'devotional',
      description: 'Journey through the Psalms with seasonal reflections that speak to every circumstance of life.',
      author: 'Emily Davis',
      downloadUrl: '#',
      rating: 4.8,
      downloadCount: 756
    },
    {
      id: 6,
      title: 'Christian Living in Modern Times',
      type: 'book',
      description: 'Navigate contemporary challenges while staying true to biblical principles in this practical guide.',
      author: 'Dr. David Wilson',
      downloadUrl: '#',
      rating: 4.5,
      downloadCount: 543
    }
  ];

  const categories = ['All', 'Devotional', 'Study', 'Audio', 'Video', 'Book'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'devotional': return BookOpen;
      case 'study': return BookOpen;
      case 'audio': return Play;
      case 'video': return Play;
      case 'book': return BookOpen;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'devotional': return 'bg-blue-100 text-blue-800';
      case 'study': return 'bg-green-100 text-green-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'book': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = selectedCategory === 'All' 
    ? resources 
    : resources.filter(r => r.type === selectedCategory.toLowerCase());

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Spiritual Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover devotionals, Bible studies, and spiritual content to deepen your faith journey
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredResources.map((resource) => {
            const IconComponent = getTypeIcon(resource.type);
            return (
              <div
                key={resource.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </span>
                  </div>
                  {resource.duration && (
                    <span className="text-sm text-gray-500">{resource.duration}</span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  {resource.title}
                </h3>

                <p className="text-gray-600 mb-3 text-sm">
                  by {resource.author}
                </p>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {resource.description}
                </p>

                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-3">
                    {renderStars(resource.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {resource.rating} ({resource.downloadCount} downloads)
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                    {resource.type === 'audio' || resource.type === 'video' ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    )}
                  </button>
                  <button className="p-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Devotional Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white mb-8">
          <div className="text-center mb-6">
            <Calendar className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Today's Devotional</h2>
            <p className="text-xl opacity-90">Start your day with God's Word</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-3">Finding Peace in God's Presence</h3>
            <p className="text-lg opacity-90 mb-4">
              "Peace I leave with you; my peace I give you. I do not give to you as the world gives. 
              Do not let your hearts be troubled and do not be afraid." - John 14:27
            </p>
            <p className="opacity-80 leading-relaxed mb-6">
              In times of uncertainty and worry, we can find true peace by resting in God's presence. 
              His peace surpasses all understanding and guards our hearts and minds...
            </p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-6 rounded-lg transition-colors duration-200">
              Read Full Devotional
            </button>
          </div>
        </section>

        {/* Resource Stats */}
        <div className="bg-blue-50 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Growing in Faith Together</h2>
            <p className="text-xl text-gray-600">Resources that transform lives</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-lg text-gray-700">Free Resources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">25,000+</div>
              <div className="text-lg text-gray-700">Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
              <div className="text-lg text-gray-700">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">Weekly</div>
              <div className="text-lg text-gray-700">New Content</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;