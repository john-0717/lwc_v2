import React, { useState } from 'react';
import { MessageCircle, Plus, ThumbsUp, Reply, Clock, User } from 'lucide-react';
import DiscussionDetail from './DiscussionDetail';

interface Discussion {
  id: number;
  title: string;
  author: string;
  content: string;
  timestamp: string;
  replies: number;
  likes: number;
  category: string;
}

const Discussions: React.FC = () => {
  const [discussions] = useState<Discussion[]>([
    {
      id: 1,
      title: 'Understanding God\'s Grace in Daily Life',
      author: 'Sarah M.',
      content: 'I\'ve been reflecting on how God\'s grace manifests in our everyday experiences. How do you recognize and appreciate grace in your daily routine?',
      timestamp: '2 hours ago',
      replies: 12,
      likes: 8,
      category: 'Faith & Growth'
    },
    {
      id: 2,
      title: 'Prayer Strategies for Busy Schedules',
      author: 'Michael R.',
      content: 'As a working parent, I struggle to find consistent time for prayer. What are some practical ways to maintain a strong prayer life despite a busy schedule?',
      timestamp: '5 hours ago',
      replies: 15,
      likes: 22,
      category: 'Prayer Life'
    },
    {
      id: 3,
      title: 'Bible Study: Romans Chapter 8',
      author: 'Emily D.',
      content: 'Let\'s dive deep into Romans 8 together. What verses in this chapter speak most powerfully to you and why?',
      timestamp: '1 day ago',
      replies: 28,
      likes: 35,
      category: 'Bible Study'
    },
    {
      id: 4,
      title: 'Serving Others in Our Community',
      author: 'David L.',
      content: 'I\'m looking for ways to serve and show Christ\'s love in our local community. What outreach opportunities have you found meaningful?',
      timestamp: '2 days ago',
      replies: 9,
      likes: 18,
      category: 'Service & Outreach'
    },
    {
      id: 5,
      title: 'Dealing with Doubt and Strengthening Faith',
      author: 'Rachel K.',
      content: 'Going through a season of questioning and would appreciate prayers and wisdom from the community. How do you work through periods of doubt?',
      timestamp: '3 days ago',
      replies: 24,
      likes: 31,
      category: 'Faith & Growth'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);

  const categories = ['All', 'Faith & Growth', 'Prayer Life', 'Bible Study', 'Service & Outreach'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Faith & Growth': return 'bg-blue-100 text-blue-800';
      case 'Prayer Life': return 'bg-purple-100 text-purple-800';
      case 'Bible Study': return 'bg-green-100 text-green-800';
      case 'Service & Outreach': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDiscussions = selectedCategory === 'All' 
    ? discussions 
    : discussions.filter(d => d.category === selectedCategory);

  if (selectedDiscussion) {
    return (
      <DiscussionDetail 
        onBack={() => setSelectedDiscussion(null)}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">
              Community Discussions
            </h1>
            <p className="text-xl text-gray-600">
              Share thoughts, ask questions, and grow together in faith
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            New Discussion
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-blue border border-blue hover:bg-blue-600 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Discussion List */}
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(discussion.category)}`}>
                      {discussion.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-blue-900 mb-2 hover:text-blue cursor-pointer">
                    {discussion.title}
                  </h2>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {discussion.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm">{discussion.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{discussion.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-blue transition-colors duration-200">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">{discussion.likes}</span>
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-blue transition-colors duration-200">
                    <Reply className="h-4 w-4 mr-1" />
                    <span className="text-sm">{discussion.replies} replies</span>
                  </button>
                  <button 
                    onClick={() => setSelectedDiscussion(discussion.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Join Discussion
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Stats */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
          <div className="text-center mb-6">
            <MessageCircle className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Join the Conversation</h2>
            <p className="text-xl opacity-90">
              Be part of our growing community of faith
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">247</div>
              <div className="text-lg">Active Discussions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">1,543</div>
              <div className="text-lg">Community Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">12,847</div>
              <div className="text-lg">Messages Shared</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discussions;