import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  Calendar,
  BookOpen,
  Tag,
  Eye,
  Facebook,
  Twitter,
  Copy,
  Download,
  File,
  X
} from 'lucide-react';
import type { Article } from '../App';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replies?: Comment[];
}

interface ArticleReaderProps {
  articles: Article[];
}

const ArticleReader: React.FC<ArticleReaderProps> = ({ articles }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'Sarah M.',
      content: 'This article really helped me understand the deeper meaning behind these verses. Thank you for sharing such insightful commentary!',
      timestamp: '2 hours ago',
      likes: 5,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      replies: [
        {
          id: 11,
          author: 'Michael R.',
          content: 'I agree! The author did a great job explaining the historical context.',
          timestamp: '1 hour ago',
          likes: 2,
          dislikes: 0,
          isLiked: false,
          isDisliked: false
        }
      ]
    },
    {
      id: 2,
      author: 'David L.',
      content: 'I appreciate how this connects to our daily Christian walk. It\'s not just academic but practical for living out our faith.',
      timestamp: '4 hours ago',
      likes: 8,
      dislikes: 0,
      isLiked: true,
      isDisliked: false
    },
    {
      id: 3,
      author: 'Rachel K.',
      content: 'Could you recommend some additional resources for further study on this topic?',
      timestamp: '6 hours ago',
      likes: 3,
      dislikes: 0,
      isLiked: false,
      isDisliked: false
    }
  ]);

  useEffect(() => {
    if (slug) {
      const foundArticle = articles.find(a => a.slug === slug && a.status === 'published');
      if (foundArticle) {
        setArticle(foundArticle);
        setLikes(Math.floor(Math.random() * 50) + 10);
        setDislikes(Math.floor(Math.random() * 5) + 1);
        
        // Increment view count (in real app, this would be an API call)
        foundArticle.views += 1;
      } else {
        navigate('/');
      }
    }
  }, [slug, articles, navigate]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Article not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
      if (isDisliked) {
        setDislikes(dislikes - 1);
        setIsDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setDislikes(dislikes - 1);
      setIsDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setIsDisliked(true);
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
    }
  };

  const handleCommentLike = (commentId: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes,
            isLiked: !comment.isLiked,
            isDisliked: false
          }
        : comment
    ));
  };

  const handleCommentDislike = (commentId: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes,
            isDisliked: !comment.isDisliked,
            isLiked: false
          }
        : comment
    ));
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        author: 'You',
        content: newComment,
        timestamp: 'Just now',
        likes: 0,
        dislikes: 0,
        isLiked: false,
        isDisliked: false
      };

      if (replyingTo) {
        setComments(comments.map(c => 
          c.id === replyingTo 
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        ));
        setReplyingTo(null);
      } else {
        setComments([comment, ...comments]);
      }
      
      setNewComment('');
    }
  };

  const shareUrl = `${window.location.origin}/article/${article.slug}`;

  const handleShare = (platform: string) => {
    const text = `Check out this article: ${article.title}`;
    
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
    const oldTestament = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings'];
    const newTestament = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians'];
    
    if (oldTestament.includes(category)) return 'bg-blue-100 text-blue-800';
    if (newTestament.includes(category)) return 'bg-purple-100 text-purple-800';
    return 'bg-indigo-100 text-indigo-800';
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | LWC - Life With Christ</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={`${article.tags.join(', ')}, ${article.category}, Christian article, Bible study`} />
        <meta name="author" content={article.author} />
        <link rel="canonical" href={shareUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        {article.featuredImage && <meta property="og:image" content={article.featuredImage} />}
        <meta property="article:author" content={article.author} />
        <meta property="article:published_time" content={article.publishedDate} />
        <meta property="article:section" content={article.category} />
        {article.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        {article.featuredImage && <meta name="twitter:image" content={article.featuredImage} />}
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.excerpt,
            "author": {
              "@type": "Person",
              "name": article.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "LWC - Life With Christ",
              "logo": {
                "@type": "ImageObject",
                "url": "https://lwc.org/logo.png"
              }
            },
            "datePublished": article.publishedDate,
            "dateModified": article.publishedDate,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": shareUrl
            },
            "image": article.featuredImage,
            "keywords": article.tags.join(', '),
            "articleSection": article.category,
            "wordCount": article.content.replace(/<[^>]*>/g, '').split(' ').length
          })}
        </script>
      </Helmet>

      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/articles')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Articles
          </button>

          {/* Article Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Featured Image */}
            {article.featuredImage && (
              <div className="w-full h-64 md:h-80">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  {article.contentType === 'pdf' && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <File className="h-3 w-3 mr-1" />
                      PDF
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {article.views} views
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime} min read
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {article.title}
              </h1>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{article.author}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {article.publishedDate || article.createdDate}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Article Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>{likes}</span>
                  </button>
                  
                  <button
                    onClick={handleDislike}
                    className={`flex items-center space-x-2 transition-colors duration-200 ${
                      isDisliked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span>{dislikes}</span>
                  </button>

                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>

                  {article.contentType === 'pdf' && article.pdfFile && (
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors duration-200">
                      <Download className="h-5 w-5" />
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-500">{comments.length} comments</span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-8 border-b border-gray-200">
              {article.contentType === 'text' ? (
                <div 
                  className="prose max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div className="text-center py-12">
                  <File className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">PDF Document</h3>
                  <p className="text-gray-600 mb-6">{article.excerpt}</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center mx-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF ({article.pdfFile})
                  </button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {replyingTo ? 'Reply to comment' : 'Leave a comment'}
                </h3>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
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
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-600 pl-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{comment.author}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {comment.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-4">
                        {comment.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center space-x-1 transition-colors duration-200 ${
                              comment.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm">{comment.likes}</span>
                          </button>
                          
                          <button
                            onClick={() => handleCommentDislike(comment.id)}
                            className={`flex items-center space-x-1 transition-colors duration-200 ${
                              comment.isDisliked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="text-sm">{comment.dislikes}</span>
                          </button>

                          <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-sm"
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="ml-6 border-l-2 border-gray-200 pl-4">
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mr-2">
                                    <User className="h-3 w-3 text-white" />
                                  </div>
                                  <p className="font-medium text-gray-800 text-sm">{reply.author}</p>
                                  <span className="text-xs text-gray-500 ml-2">{reply.timestamp}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {reply.content}
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

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Share Article</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
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
                  <p className="text-sm text-gray-600 mb-2">Article URL:</p>
                  <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                    {shareUrl}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ArticleReader;