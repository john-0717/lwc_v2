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
import Exams from './components/Exams';
import Leaderboard from './components/Leaderboard';
import Results from './components/Results';
import ExamTaking from './components/ExamTaking';

export type Section = 'home' | 'community' | 'discussions' | 'prayer' | 'resources' | 'profile' | 'learn-more' | 'admin' | 'exams' | 'leaderboard' | 'results';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isExamTaking, setIsExamTaking] = useState(false);
  const [currentExamData, setCurrentExamData] = useState<{id: number, title: string, duration: number} | null>(null);

  const handleViewAnswers = (userId: number, examId: number) => {
    setSelectedUserId(userId);
    setSelectedExamId(examId);
    setActiveSection('results');
  };

  const handleStartExam = (examId: number, examTitle: string, duration: number) => {
    setCurrentExamData({ id: examId, title: examTitle, duration });
    setIsExamTaking(true);
    setActiveSection('exams'); // This will be overridden by exam taking view
  };

  const handleCompleteExam = (answers: { [key: number]: string }) => {
    // Handle exam completion logic here
    console.log('Exam completed with answers:', answers);
    setIsExamTaking(false);
    setCurrentExamData(null);
    setActiveSection('results');
  };

  const handleExitExam = () => {
    setIsExamTaking(false);
    // Keep currentExamData to maintain "in progress" state
    setActiveSection('exams');
  };

  const renderSection = () => {
    if (isExamTaking && currentExamData) {
      return (
        <ExamTaking
          examId={currentExamData.id}
          examTitle={currentExamData.title}
          duration={currentExamData.duration}
          onComplete={handleCompleteExam}
          onExit={handleExitExam}
        />
      );
    }

    switch (activeSection) {
      case 'home':
        return <Home 
          onLearnMore={() => setActiveSection('learn-more')} 
          onViewAnswers={handleViewAnswers}
        />;
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
      case 'exams':
        return <Exams onStartExam={handleStartExam} currentExamInProgress={currentExamData?.id || null} />;
      case 'leaderboard':
        return <Leaderboard onViewAnswers={handleViewAnswers} />;
      case 'results':
        return <Results selectedExamId={selectedExamId || undefined} selectedUserId={selectedUserId || undefined} />;
      default:
        return <Home 
          onLearnMore={() => setActiveSection('learn-more')} 
          onViewAnswers={handleViewAnswers}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
      activeSection={activeSection} 
      setActiveSection={setActiveSection} 
      isAdmin={isAdmin}
      setIsAdmin={setIsAdmin} />
      <main className={`transition-all duration-500 ease-in-out ${isExamTaking ? 'pt-0' : ''}`}>
        {renderSection()}
      </main>
      {!isExamTaking && <Footer />}
    </div>
  );
}

export default App;