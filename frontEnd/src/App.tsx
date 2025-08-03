import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthProvider } from './components/auth/AuthContext';
import Header from './components/Header';
import Home from './components/Home';
import Community from './components/Community';
import Discussions from './components/Discussions';
import PrayerRequests from './components/PrayerRequests';
import Resources from './components/Resources';
import UserProfile from './components/UserProfile';
import LearnMore from './components/LearnMore';
import AdminDashboard from './components/admin/AdminDashboard';
import ArticleEditor from './components/admin/ArticleEditor';
import ArticleReader from './components/ArticleReader';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import Exams from './components/Exams';
import Leaderboard from './components/Leaderboard';
import Results from './components/Results';
import SettingsComponent from './components/Settings/Settings';

export interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  pdfFile?: string;
  contentType: 'text' | 'pdf';
  status: 'draft' | 'published' | 'archived';
  createdDate: string;
  publishedDate?: string;
  readTime: number;
  views: number;
  slug: string;
}

// Sample articles data with SEO-friendly slugs
const sampleArticles: Article[] = [
  {
    id: 1,
    title: 'Understanding Genesis: The Beginning of All Things',
    content: '<h2>In the Beginning</h2><p>In the beginning God created the heavens and the earth. This foundational verse sets the stage for understanding God\'s character as Creator and Sustainer of all things.</p><p><strong>Key Themes:</strong></p><ul><li>God\'s sovereignty over creation</li><li>The order and purpose in creation</li><li>Humanity\'s special place in God\'s design</li></ul><blockquote>"And God saw everything that he had made, and behold, it was very good." - Genesis 1:31</blockquote>',
    excerpt: 'Explore the foundational truths found in the book of Genesis and how they shape our understanding of God\'s character.',
    author: 'Pastor John Smith',
    category: 'Genesis',
    tags: ['Creation', 'Old Testament', 'Theology'],
    featuredImage: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg',
    contentType: 'text',
    status: 'published',
    createdDate: '2024-01-15',
    publishedDate: '2024-01-20',
    readTime: 8,
    views: 245,
    slug: 'understanding-genesis-beginning-of-all-things'
  },
  {
    id: 2,
    title: 'The Sermon on the Mount: Jesus\' Blueprint for Living',
    content: '<h2>The Beatitudes</h2><p><em>Blessed are the poor in spirit, for theirs is the kingdom of heaven...</em></p><p>The Sermon on the Mount represents one of the most comprehensive teachings of Jesus, providing a blueprint for Christian living that challenges conventional wisdom.</p><h3>Key Sections:</h3><ol><li><strong>The Beatitudes (Matthew 5:3-12)</strong> - Eight declarations of blessing</li><li><strong>Salt and Light (Matthew 5:13-16)</strong> - Our role in the world</li><li><strong>The Golden Rule (Matthew 7:12)</strong> - Treating others with love</li></ol>',
    excerpt: 'Dive deep into Matthew 5-7 and discover the revolutionary teachings of Jesus that transform how we live.',
    author: 'Dr. Sarah Johnson',
    category: 'Matthew',
    tags: ['Sermon on the Mount', 'New Testament', 'Christian Living'],
    featuredImage: 'https://images.pexels.com/photos/3680219/pexels-photo-3680219.jpeg',
    contentType: 'text',
    status: 'published',
    createdDate: '2024-01-10',
    publishedDate: '2024-01-18',
    readTime: 12,
    views: 189,
    slug: 'sermon-on-the-mount-jesus-blueprint-for-living'
  },
  {
    id: 3,
    title: 'Walking in Faith: Lessons from Abraham',
    content: '<p>By faith Abraham obeyed when he was called to go out to a place that he was to receive as an inheritance...</p>',
    excerpt: 'Learn from Abraham\'s journey of faith and how his example can guide our own spiritual walk.',
    author: 'Michael Chen',
    category: 'Genesis',
    tags: ['Faith', 'Abraham', 'Old Testament'],
    contentType: 'text',
    status: 'published',
    createdDate: '2024-01-22',
    publishedDate: '2024-01-25',
    readTime: 6,
    views: 134,
    slug: 'walking-in-faith-lessons-from-abraham'
  },
  {
    id: 4,
    title: 'Complete Study Guide: Book of Romans',
    content: '',
    excerpt: 'Comprehensive PDF study guide covering all 16 chapters of Romans with discussion questions and practical applications.',
    author: 'Dr. Sarah Johnson',
    category: 'Romans',
    tags: ['Study Guide', 'Romans', 'PDF'],
    pdfFile: 'romans-study-guide.pdf',
    contentType: 'pdf',
    status: 'published',
    createdDate: '2024-01-12',
    publishedDate: '2024-01-15',
    readTime: 45,
    views: 156,
    slug: 'complete-study-guide-book-of-romans'
  }
];

function App() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'writer' | 'member'>('admin');
  const [articles] = useState<Article[]>(sampleArticles);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current page for SEO
  const getCurrentPageInfo = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return {
        title: 'LWC - Life With Christ | Christian Community & Spiritual Growth',
        description: 'Join our Christ-centered spiritual community where believers gather, discuss, pray, and grow together in faith. Discover resources, join discussions, and connect with fellow Christians.',
        keywords: 'Christian community, spiritual growth, Bible study, prayer, faith, Jesus Christ, church, fellowship'
      };
    } else if (path === '/community') {
      return {
        title: 'Community Events & Ministries | LWC - Life With Christ',
        description: 'Discover upcoming events, ministry opportunities, and ways to get involved in our Christian community. Join worship services, Bible studies, and fellowship gatherings.',
        keywords: 'Christian events, church ministries, worship services, Bible study groups, Christian fellowship'
      };
    } else if (path === '/discussions') {
      return {
        title: 'Christian Discussions & Faith Forums | LWC - Life With Christ',
        description: 'Engage in meaningful conversations about faith, scripture, and spiritual growth with fellow believers in our Christian discussion forums.',
        keywords: 'Christian discussions, faith forums, Bible discussions, spiritual conversations, Christian community'
      };
    } else if (path === '/prayer') {
      return {
        title: 'Prayer Requests & Support | LWC - Life With Christ',
        description: 'Share your prayer requests and lift each other up in Christian love and support. Join our prayer community for spiritual encouragement.',
        keywords: 'prayer requests, Christian prayer, spiritual support, prayer community, faith encouragement'
      };
    } else if (path === '/resources') {
      return {
        title: 'Christian Resources & Bible Studies | LWC - Life With Christ',
        description: 'Access devotionals, Bible studies, and spiritual resources to deepen your faith journey. Download free Christian content and study materials.',
        keywords: 'Christian resources, Bible studies, devotionals, spiritual content, Christian education'
      };
    } else if (path.startsWith('/article/')) {
      const slug = path.replace('/article/', '');
      const article = articles.find(a => a.slug === slug);
      if (article) {
        return {
          title: `${article.title} | LWC - Life With Christ`,
          description: article.excerpt,
          keywords: `${article.tags.join(', ')}, ${article.category}, Christian article, Bible study`
        };
      }
    }
    
    return {
      title: 'LWC - Life With Christ | Christian Community',
      description: 'A Christ-centered spiritual community for believers to grow in faith together.',
      keywords: 'Christian community, spiritual growth, faith, Jesus Christ'
    };
  };

  const pageInfo = getCurrentPageInfo();

  return (
    <AuthProvider>
      <SEOHead 
        title={pageInfo.title}
        description={pageInfo.description}
        keywords={pageInfo.keywords}
        url={`https://lwc.org${location.pathname}`}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <Header 
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          userRole={userRole}
        />
        <main className="flex-1 transition-all duration-500 ease-in-out pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home onLearnMore={() => navigate('/about')} />} />
            <Route path="/community" element={<Community />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/prayer" element={<PrayerRequests />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/about" element={<LearnMore />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/articles" element={<ArticleEditor articles={articles} />} />
            <Route path="/article/:slug" element={<ArticleReader articles={articles} />} />
            <Route path="/exams" element={<Exams/>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/results" element={<Results />} />
            <Route path="/settings" element={<SettingsComponent />} />


            {/* Catch all route for 404 */}
            <Route path="*" element={<Home onLearnMore={() => navigate('/about')} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;