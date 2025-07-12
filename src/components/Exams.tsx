import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Users, 
  Trophy, 
  Play, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Award,
  Target
} from 'lucide-react';

interface Exam {
  id: number;
  title: string;
  description: string;
  deadline: string;
  duration: number; // in minutes
  totalQuestions: number;
  participants: number;
  status: 'upcoming' | 'active' | 'completed';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted?: boolean;
  score?: number;
}

interface Question {
  id: number;
  examId: number;
  question: string;
  wordLimit: number;
  points: number;
}

const Exams: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showExamDetails, setShowExamDetails] = useState(false);

  const exams: Exam[] = [
    {
      id: 1,
      title: 'Biblical Knowledge Assessment',
      description: 'Comprehensive test covering Old and New Testament knowledge, biblical history, and key theological concepts.',
      deadline: '2024-02-15',
      duration: 120,
      totalQuestions: 5,
      participants: 45,
      status: 'active',
      category: 'Bible Study',
      difficulty: 'intermediate',
      isCompleted: false
    },
    {
      id: 2,
      title: 'Christian Leadership Principles',
      description: 'Examination of leadership qualities, servant leadership, and biblical examples of great leaders.',
      deadline: '2024-02-20',
      duration: 90,
      totalQuestions: 4,
      participants: 28,
      status: 'upcoming',
      category: 'Leadership',
      difficulty: 'advanced'
    },
    {
      id: 3,
      title: 'Faith Foundations',
      description: 'Basic understanding of Christian faith, salvation, and fundamental beliefs.',
      deadline: '2024-01-30',
      duration: 60,
      totalQuestions: 3,
      participants: 67,
      status: 'completed',
      category: 'Faith & Growth',
      difficulty: 'beginner',
      isCompleted: true,
      score: 85
    },
    {
      id: 4,
      title: 'Prayer and Spiritual Disciplines',
      description: 'Deep dive into prayer life, fasting, meditation, and other spiritual practices.',
      deadline: '2024-02-25',
      duration: 75,
      totalQuestions: 4,
      participants: 32,
      status: 'upcoming',
      category: 'Prayer Life',
      difficulty: 'intermediate'
    }
  ];

  const categories = ['All', 'Bible Study', 'Leadership', 'Faith & Growth', 'Prayer Life'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Bible Study': return 'bg-purple-100 text-purple-800';
      case 'Leadership': return 'bg-blue-100 text-blue-800';
      case 'Faith & Growth': return 'bg-green-100 text-green-800';
      case 'Prayer Life': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExams = selectedCategory === 'All' 
    ? exams 
    : exams.filter(exam => exam.category === selectedCategory);

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam);
    setShowExamDetails(true);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Spiritual Examinations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test your knowledge and deepen your understanding of faith through comprehensive examinations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Exams</p>
                <p className="text-3xl font-bold text-blue-900">{exams.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Exams</p>
                <p className="text-3xl font-bold text-green-900">
                  {exams.filter(e => e.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {exams.filter(e => e.isCompleted).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-purple-900">
                  {exams.reduce((sum, exam) => sum + exam.participants, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
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

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const daysLeft = getDaysUntilDeadline(exam.deadline);
            
            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(exam.category)}`}>
                      {exam.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exam.difficulty)}`}>
                      {exam.difficulty}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-blue-900 mb-2">{exam.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{exam.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      Deadline: {exam.deadline}
                      {exam.status !== 'completed' && (
                        <span className={`ml-2 ${daysLeft <= 3 ? 'text-red-600' : 'text-gray-500'}`}>
                          ({daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">{exam.totalQuestions} questions (2000 words each)</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">{exam.participants} participants</span>
                  </div>
                </div>

                {exam.isCompleted && exam.score && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Score: {exam.score}%</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {exam.status === 'active' && !exam.isCompleted && (
                    <button
                      onClick={() => handleStartExam(exam)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Exam
                    </button>
                  )}
                  
                  {exam.status === 'upcoming' && (
                    <button
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </button>
                  )}
                  
                  {exam.isCompleted && (
                    <button
                      onClick={() => handleStartExam(exam)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      View Results
                    </button>
                  )}
                  
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200">
                    <Target className="h-4 w-4" />
                  </button>
                </div>

                {exam.status === 'active' && daysLeft <= 3 && daysLeft > 0 && (
                  <div className="mt-4 bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-red-800 text-sm font-medium">
                        Deadline approaching! Only {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white text-center">
          <Trophy className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Challenge Yourself</h2>
          <p className="text-xl mb-6 opacity-90">
            Deepen your faith knowledge and compete with fellow believers in our spiritual examinations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">2000</div>
              <div className="text-lg">Words per Answer</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">100+</div>
              <div className="text-lg">Active Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">95%</div>
              <div className="text-lg">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;