import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Community from './components/Community';
import Discussions from './components/Discussions';
import PrayerRequests from './components/PrayerRequests';
import Resources from './components/Resources';
import Footer from './components/Footer';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import LearnMore from './components/LearnMore';

export type Section = 'home' | 'community' | 'discussions' | 'prayer' | 'resources' | 'profile' | 'learn-more' | 'admin';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [isAdmin, setIsAdmin] = useState(true);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home onLearnMore={() => setActiveSection('learn-more')} />;
      case 'community':
        return <Community />;
      case 'discussions':
        return <Discussions />;
      case 'prayer':
        return <PrayerRequests />;
      case 'resources':
        return <Resources />;
      case 'profile':
        return <UserProfile />;
      case 'learn-more':
        return <LearnMore />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home onLearnMore={() => setActiveSection('learn-more')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
      activeSection={activeSection} 
      setActiveSection={setActiveSection} 
      isAdmin={isAdmin}
      setIsAdmin={setIsAdmin} />
      <main className="transition-all duration-500 ease-in-out">
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

export default App;