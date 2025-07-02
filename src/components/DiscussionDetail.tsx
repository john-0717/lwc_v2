import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  Flag,
  MoreHorizontal,
  Facebook,
  Twitter,
  Copy
} from 'lucide-react';

interface Reply {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies?: Reply[];
}

interface Discussion {
  id: number;
  title: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  category: string;
  views: number;
}

interface DiscussionDetailProps {
  onBack: () => void;
}

const DiscussionDetail: React.FC<DiscussionDetailProps> = ({ onBack }) => {
  const [discussion] = useState<Discussion>({
    id: 1,
    title: 'Understanding God\'s Grace in Daily Life',
    author: 'Sarah M.',
    content: 'I\'ve been reflecting on how God\'s grace manifests in our everyday experiences. How do you recognize and appreciate grace in your daily routine? I find that sometimes I get so caught up in the busyness of life that I forget to pause and acknowledge the countless ways God shows His grace to me each day. Whether it\'s through the kindness of a stranger, a beautiful sunset, or simply having food on the table, grace surrounds us. I\'d love to hear your thoughts and experiences on this topic.',
    timestamp: '2 hours ago',
    likes: 15,
    dislikes: 1,
    isLiked: false,
    isDisliked: false,
    category: 'Faith & Growth',
    views: 127
  });

  const [replies, setReplies] = useState<Reply[]>([
    {
      id: 1,
      author: 'Michael R.',
      content: 'This is such a beautiful reflection, Sarah. I\'ve found that keeping a gratitude journal has helped me recognize God\'s grace more clearly. Every evening, I write down three things I\'m grateful for, and it\'s amazing how this simple practice has opened my eyes to see grace in the smallest moments.',
      timestamp: '1 hour ago',
      likes: 8,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: [
        {
          id: 11,
          author: 'Emily D.',
          content: 'That\'s a wonderful practice, Michael! I\'ve been thinking about starting a gratitude journal myself. How long have you been doing this?',
          timestamp: '45 minutes ago',
          likes: 3,
          dislikes: 0,
          isLiked: false,
          isDisliked: false
        }
      ]
    },
    {
      id: 2,
      author: 'David L.',
      content: 'Grace is indeed everywhere when we have eyes to see it. I remember a time when I was going through financial difficulties, and a neighbor anonymously left groceries at our door. It was such a tangible reminder of God\'s provision through His people.',
      timestamp: '45 minutes ago',
      likes: 12,
      dislikes: 0,
      isLiked: true,
      isDisliked: false
    },
    {
      id: 3,
      author: 'Rachel K.',
      content: 'I love this topic! For me, I see God\'s grace most clearly in relationships. When someone forgives me when I don\'t deserve it, or when I\'m able to extend grace to others even when I\'m hurt - those moments remind me of how God treats us with unmerited favor.',
      timestamp: '30 minutes ago',
      likes: 6,
      dislikes: 0,
      isLiked: false,
      isDisliked: false
    }
  ]);

  const [newReply, setNewReply] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleLike = (type: 'discussion' | 'reply', id?: number) => {
    if (type === 'discussion') {
      console.log('Liked discussion');
    } else if (id) {
      setReplies(replies.map(reply => 
        reply.id === id 
          ? { 
              ...reply, 
              likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
              dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes,
              isLiked: !reply.isLiked,
              isDisliked: false
            }
          : reply
      ));
    }
  };

  const handleDislike = (type: 'discussion' | 'reply', id?: number) => {
    if (type === 'discussion') {
      console.log('Disliked discussion');
    } else if (id) {
      setReplies(replies.map(reply => 
        reply.id === id 
          ? { 
              ...reply, 
              dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
              likes: reply.isLiked ? reply.likes - 1 : reply.likes,
              isDisliked: !reply.isDisliked,
              isLiked: false
            }
          : reply
      ));
    }
  };

  const handleSubmitReply = () => {
    if (newReply.trim()) {
      const reply: Reply = {
        id: Date.now(),
        author: 'You',
        content: newReply,
        timestamp: 'Just now',
        likes: 0,
        dislikes: 0,
        isLiked: false,
        isDisliked: false
      };

      if (replyingTo) {
        setReplies(replies.map(r => 
          r.id === replyingTo 
            ? { ...r, replies: [...(r.replies || []), reply] }
            : r
        ));
        setReplyingTo(null);
      } else {
        setReplies([...replies, reply]);
      }
      
      setNewReply('');
    }
  };

  const shareUrl = `${window.location.origin}/discussion/${discussion.id}`;

  const handleShare = (platform: string) => {
    const text = `Check out this discussion: ${discussion.title}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareModal(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Discussions
        </button>

        {/* Single Card Layout */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Discussion Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(discussion.category)}`}>
                {discussion.category}
              </span>
              <div className="flex items-center space-x-4 text-gray-500 text-sm">
                <span>{discussion.views} views</span>
                <span>{discussion.timestamp}</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {discussion.title}
            </h1>

            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{discussion.author}</p>
                <p className="text-sm text-gray-500">Community Member</p>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                {discussion.content}
              </p>
            </div>

            {/* Discussion Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleLike('discussion')}
                  className={`flex items-center space-x-2 transition-colors duration-200 ${
                    discussion.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span>{discussion.likes}</span>
                </button>
                
                <button
                  onClick={() => handleDislike('discussion')}
                  className={`flex items-center space-x-2 transition-colors duration-200 ${
                    discussion.isDisliked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <ThumbsDown className="h-5 w-5" />
                  <span>{discussion.dislikes}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-gray-500" />
                <span className="text-gray-500">{replies.length} replies</span>
              </div>
            </div>
          </div>

          {/* Replies Section with Scroll */}
          <div className="h-96 overflow-y-auto border-b border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Replies ({replies.length})
              </h2>

              <div className="space-y-6">
                {replies.map((reply) => (
                  <div key={reply.id} className="border-l-4 border-blue-500 pl-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{reply.author}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {reply.timestamp}
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-4">
                        {reply.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike('reply', reply.id)}
                            className={`flex items-center space-x-1 transition-colors duration-200 ${
                              reply.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm">{reply.likes}</span>
                          </button>
                          
                          <button
                            onClick={() => handleDislike('reply', reply.id)}
                            className={`flex items-center space-x-1 transition-colors duration-200 ${
                              reply.isDisliked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                            }`}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="text-sm">{reply.dislikes}</span>
                          </button>

                          <button
                            onClick={() => setReplyingTo(reply.id)}
                            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm"
                          >
                            Reply
                          </button>
                        </div>

                        <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {reply.replies && reply.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {reply.replies.map((nestedReply) => (
                            <div key={nestedReply.id} className="ml-6 border-l-2 border-gray-200 pl-4">
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mr-2">
                                    <User className="h-3 w-3 text-white" />
                                  </div>
                                  <p className="font-medium text-gray-800 text-sm">{nestedReply.author}</p>
                                  <span className="text-xs text-gray-500 ml-2">{nestedReply.timestamp}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {nestedReply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reply Form at Bottom */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {replyingTo ? 'Reply to comment' : 'Join the conversation'}
            </h3>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f46530] focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-gray-500">
                    Be respectful and constructive in your response
                  </div>
                  <div className="flex space-x-3">
                    {replyingTo && (
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSubmitReply}
                      disabled={!newReply.trim()}
                      className="bg-blue-600 hover:bg-[#e55a2b] text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Share Discussion</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Facebook className="h-5 w-5 mr-3" />
                  Share on Facebook
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200"
                >
                  <Twitter className="h-5 w-5 mr-3" />
                  Share on Twitter
                </button>
                
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <Copy className="h-5 w-5 mr-3" />
                  Copy Link
                </button>
              </div>

              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Discussion URL:</p>
                <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                  {shareUrl}
                </p>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionDetail;