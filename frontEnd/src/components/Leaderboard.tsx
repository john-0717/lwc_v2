import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  Eye,
  User
} from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar?: string;
  totalScore: number;
  examsTaken: number;
  averageScore: number;
  rank: number;
  lastExamDate: string;
  badges: string[];
  examResults: ExamResult[];
}

interface ExamResult {
  examId: number;
  examTitle: string;
  score: number;
  completedDate: string;
  answers: { questionId: number; answer: string; score: number }[];
}

interface LeaderboardProps {
  onViewAnswers?: (userId: number, examId: number) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onViewAnswers }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

  const leaderboardData: LeaderboardEntry[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      totalScore: 2847,
      examsTaken: 12,
      averageScore: 94.2,
      rank: 1,
      lastExamDate: '2024-01-20',
      badges: ['Scripture Scholar', 'Perfect Score', 'Consistent Learner'],
      examResults: [
        {
          examId: 1,
          examTitle: 'Biblical Knowledge Assessment',
          score: 96,
          completedDate: '2024-01-20',
          answers: [
            { questionId: 1, answer: 'The Sermon on the Mount represents...', score: 19 },
            { questionId: 2, answer: 'Grace in Christian theology...', score: 18 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Michael Chen',
      totalScore: 2756,
      examsTaken: 11,
      averageScore: 92.8,
      rank: 2,
      lastExamDate: '2024-01-19',
      badges: ['Leadership Expert', 'Top Performer'],
      examResults: [
        {
          examId: 2,
          examTitle: 'Christian Leadership Principles',
          score: 94,
          completedDate: '2024-01-19',
          answers: [
            { questionId: 1, answer: 'Christian leadership differs from worldly leadership...', score: 18 },
            { questionId: 2, answer: 'Servant leadership as demonstrated by Jesus...', score: 19 }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'Emily Davis',
      totalScore: 2689,
      examsTaken: 10,
      averageScore: 91.5,
      rank: 3,
      lastExamDate: '2024-01-18',
      badges: ['Prayer Warrior', 'Dedicated Student'],
      examResults: []
    },
    {
      id: 4,
      name: 'David Wilson',
      totalScore: 2634,
      examsTaken: 13,
      averageScore: 89.7,
      rank: 4,
      lastExamDate: '2024-01-17',
      badges: ['Bible Scholar'],
      examResults: []
    },
    {
      id: 5,
      name: 'Rachel Martinez',
      totalScore: 2598,
      examsTaken: 9,
      averageScore: 90.1,
      rank: 5,
      lastExamDate: '2024-01-16',
      badges: ['Rising Star'],
      examResults: []
    },
    {
      id: 6,
      name: 'John Smith',
      totalScore: 2567,
      examsTaken: 11,
      averageScore: 88.9,
      rank: 6,
      lastExamDate: '2024-01-15',
      badges: ['Consistent Performer'],
      examResults: []
    },
    {
      id: 7,
      name: 'Lisa Brown',
      totalScore: 2534,
      examsTaken: 8,
      averageScore: 89.8,
      rank: 7,
      lastExamDate: '2024-01-14',
      badges: ['Quick Learner'],
      examResults: []
    },
    {
      id: 8,
      name: 'Mark Johnson',
      totalScore: 2498,
      examsTaken: 10,
      averageScore: 87.6,
      rank: 8,
      lastExamDate: '2024-01-13',
      badges: ['Faithful Student'],
      examResults: []
    },
    {
      id: 9,
      name: 'Jennifer Lee',
      totalScore: 2467,
      examsTaken: 9,
      averageScore: 88.2,
      rank: 9,
      lastExamDate: '2024-01-12',
      badges: ['Dedicated Learner'],
      examResults: []
    },
    {
      id: 10,
      name: 'Robert Garcia',
      totalScore: 2445,
      examsTaken: 8,
      averageScore: 87.9,
      rank: 10,
      lastExamDate: '2024-01-11',
      badges: ['Promising Student'],
      examResults: []
    }
  ];

  const periods = [
    { value: 'all-time', label: 'All Time' },
    { value: 'this-month', label: 'This Month' },
    { value: 'this-week', label: 'This Week' }
  ];

  const categories = [
    { value: 'overall', label: 'Overall' },
    { value: 'bible-study', label: 'Bible Study' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'prayer', label: 'Prayer Life' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = [
      'bg-purple-100 text-purple-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800'
    ];
    return colors[badge.length % colors.length];
  };

  const filteredData = leaderboardData.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserDetailModal = ({ user, onClose }: { user: LeaderboardEntry; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{user.name}'s Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rank:</span>
                  <span className="font-medium">#{user.rank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Score:</span>
                  <span className="font-medium">{user.totalScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exams Taken:</span>
                  <span className="font-medium">{user.examsTaken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-medium">{user.averageScore}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(badge)}`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Exam Results</h4>
            <div className="space-y-4">
              {user.examResults.map((result, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-gray-800">{result.examTitle}</h5>
                    <span className="text-lg font-bold text-blue-600">{result.score}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Completed: {result.completedDate}</p>
                  
                  {onViewAnswers && (
                    <button
                      onClick={() => {
                        onViewAnswers(user.id, result.examId);
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Answers
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Celebrate excellence and track progress in our spiritual learning community
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredData.slice(0, 3).map((entry, index) => (
              <div
                key={entry.id}
                className={`relative ${getRankColor(entry.rank)} rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer`}
                onClick={() => setSelectedUser(entry)}
              >
                <div className="text-center">
                  <div className="mb-4">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{entry.name}</h3>
                  <p className="text-lg opacity-90">{entry.totalScore} points</p>
                  <p className="text-sm opacity-75">{entry.averageScore}% avg</p>
                  
                  <div className="mt-4 flex flex-wrap gap-1 justify-center">
                    {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Complete Rankings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Rank</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Participant</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Total Score</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Exams</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Average</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Last Activity</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Badges</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                      entry.rank <= 3 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {getRankIcon(entry.rank)}
                        {entry.rank <= 3 && (
                          <Star className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          {entry.avatar ? (
                            <img src={entry.avatar} alt={entry.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{entry.name}</p>
                          <p className="text-sm text-gray-500">Rank #{entry.rank}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-lg font-bold text-blue-600">{entry.totalScore}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-800">{entry.examsTaken}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="text-gray-800 mr-2">{entry.averageScore}%</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {entry.lastExamDate}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
                          <span
                            key={badgeIndex}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}
                          >
                            {badge}
                          </span>
                        ))}
                        {entry.badges.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{entry.badges.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedUser(entry)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Community Achievement Stats</h2>
            <p className="text-xl opacity-90">Celebrating our collective learning journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">247</div>
              <div className="text-lg">Total Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">1,543</div>
              <div className="text-lg">Exams Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">89.2%</div>
              <div className="text-lg">Average Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300 mb-2">156</div>
              <div className="text-lg">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default Leaderboard;