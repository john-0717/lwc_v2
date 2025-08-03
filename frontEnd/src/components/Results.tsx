import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  FileText, 
  Eye, 
  Download, 
  Filter, 
  Search,
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  User
} from 'lucide-react';

interface ParticipantResult {
  id: number;
  name: string;
  avatar?: string;
  score: number;
  completedDate: string;
  timeSpent: number; // in minutes
  rank: number;
  answers: Answer[];
}

interface Answer {
  questionId: number;
  question: string;
  answer: string;
  wordCount: number;
  score: number;
  maxScore: number;
  feedback?: string;
}

interface ExamResult {
  examId: number;
  examTitle: string;
  totalParticipants: number;
  averageScore: number;
  completionRate: number;
  participants: ParticipantResult[];
}

interface ResultsProps {
  selectedExamId?: number;
  selectedUserId?: number;
}

const Results: React.FC<ResultsProps> = ({ selectedExamId, selectedUserId }) => {
  const [selectedExam, setSelectedExam] = useState(selectedExamId || 1);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');

  // Sample data - in real app, this would come from API
  const examResults: ExamResult[] = [
    {
      examId: 1,
      examTitle: 'Biblical Knowledge Assessment',
      totalParticipants: 45,
      averageScore: 87.3,
      completionRate: 93.8,
      participants: [
        {
          id: 1,
          name: 'Sarah Johnson',
          score: 96,
          completedDate: '2024-01-20',
          timeSpent: 105,
          rank: 1,
          answers: [
            {
              questionId: 1,
              question: 'Discuss the significance of the Sermon on the Mount (Matthew 5-7) in Christian ethics and daily living.',
              answer: 'The Sermon on the Mount stands as one of the most comprehensive and transformative teachings in Christian scripture, fundamentally reshaping our understanding of righteousness, ethics, and the nature of God\'s kingdom. This discourse, found in Matthew chapters 5-7, presents Jesus not merely as a teacher of moral principles, but as the authoritative interpreter of God\'s will and the embodiment of divine wisdom.\n\nThe Beatitudes, which open this sermon, represent a radical inversion of worldly values and expectations. When Jesus declares "Blessed are the poor in spirit, for theirs is the kingdom of heaven," He establishes a kingdom ethic that prioritizes spiritual humility over material wealth, mercy over judgment, and peacemaking over conflict. These declarations are not merely aspirational statements but prophetic announcements of God\'s favor resting upon those who embody these characteristics.\n\nThe concept of being "blessed" (makarios in Greek) carries profound theological weight, indicating not temporary happiness but a state of divine approval and spiritual flourishing that transcends circumstances. This blessedness is not earned through human effort but represents God\'s gracious response to hearts aligned with His character. The poor in spirit recognize their spiritual bankruptcy and complete dependence on God, while those who mourn demonstrate genuine sorrow over sin and brokenness in the world.\n\nIn contemporary application, these teachings challenge modern Christians to examine their priorities and values. The pursuit of material success, social status, and personal comfort often conflicts with the kingdom values Jesus articulates. The meek, who will inherit the earth, demonstrate strength under control and gentleness in the face of opposition. This stands in stark contrast to cultural messages that equate success with dominance and self-assertion.\n\nThe call to hunger and thirst for righteousness speaks to an active, passionate pursuit of God\'s justice and holiness. This goes beyond personal piety to encompass social justice, care for the marginalized, and advocacy for the oppressed. Modern Christians are challenged to examine whether their spiritual appetites align with God\'s heart for justice and righteousness in all spheres of life.\n\nMercy, as presented in the Beatitudes, involves both forgiveness and active compassion. In a world marked by division, revenge, and retribution, Christians are called to embody God\'s mercy through forgiveness, reconciliation, and practical care for those in need. This mercy extends beyond personal relationships to systemic issues of justice and social reform.\n\nThe pure in heart, who will see God, represent those whose motivations and desires are undivided in their devotion to God. This purity involves moral integrity, authentic worship, and transparent living that reflects God\'s character. In an age of moral relativism and ethical compromise, this call to purity challenges believers to maintain clear moral standards while extending grace to others.\n\nPeacemaking, as described by Jesus, involves active reconciliation and conflict resolution. This goes beyond passive non-violence to include proactive efforts to heal divisions, build bridges between opposing groups, and create environments where justice and peace flourish together.\n\nThe final beatitude, addressing persecution for righteousness\' sake, acknowledges that living according to kingdom values will often result in opposition from worldly systems. This persecution may take various forms in contemporary society, from social ostracism to professional discrimination to legal challenges for those who maintain biblical convictions.\n\nThe Sermon on the Mount continues with Jesus\' teaching on salt and light, emphasizing the transformative influence Christians should have in society. Salt preserves and flavors, while light illuminates and guides. These metaphors suggest that Christian presence should enhance and preserve what is good while exposing and transforming what is corrupt or dark.\n\nJesus\' teaching on the law demonstrates His role as the fulfillment rather than the abolition of Old Testament revelation. His six antitheses ("You have heard it said... but I say to you") reveal the heart attitudes behind external behaviors, calling for righteousness that exceeds that of the scribes and Pharisees.\n\nThe practical applications of these teachings in modern Christian living are numerous and challenging. In personal relationships, the call to love enemies and pray for persecutors transforms how believers respond to conflict and opposition. Rather than seeking revenge or harboring resentment, Christians are called to active love and intercession.\n\nIn economic matters, Jesus\' teaching about not storing up treasures on earth challenges materialistic pursuits and calls for generous stewardship of resources. This doesn\'t necessarily require poverty but demands a proper perspective on wealth and possessions as tools for kingdom purposes rather than ends in themselves.\n\nThe Lord\'s Prayer, embedded within this sermon, provides a model for Christian spirituality that balances reverence for God with practical concerns for daily provision, forgiveness, and spiritual protection. This prayer emphasizes both individual and corporate dimensions of faith, calling believers to seek God\'s kingdom and righteousness above personal concerns.\n\nJesus\' teaching on worry and anxiety speaks directly to contemporary struggles with stress, fear, and uncertainty. The call to seek first God\'s kingdom and righteousness, trusting in divine provision, offers a radical alternative to anxiety-driven living that characterizes much of modern society.\n\nThe concluding parable of the wise and foolish builders emphasizes the crucial importance of not merely hearing these teachings but putting them into practice. The foundation of rock versus sand represents the difference between lives built on obedience to Christ\'s words versus those built on shifting cultural values or personal preferences.\n\nIn conclusion, the Sermon on the Mount provides a comprehensive vision for Christian living that challenges believers to embody kingdom values in every aspect of life. These teachings are not merely moral guidelines but revelations of God\'s character and invitations to participate in His redemptive work in the world. The transformative power of these principles lies not in human effort alone but in the enabling grace of God working through surrendered hearts committed to following Jesus\' example and teachings.',
              wordCount: 1847,
              score: 19,
              maxScore: 20,
              feedback: 'Excellent comprehensive analysis with strong theological depth and practical application.'
            },
            {
              questionId: 2,
              question: 'Analyze the concept of grace in Christian theology.',
              answer: 'Grace represents the cornerstone of Christian theology, embodying God\'s unmerited favor and transformative power in human lives...',
              wordCount: 1923,
              score: 18,
              maxScore: 20,
              feedback: 'Very good understanding of grace with solid biblical support.'
            }
          ]
        },
        {
          id: 2,
          name: 'Michael Chen',
          score: 94,
          completedDate: '2024-01-19',
          timeSpent: 98,
          rank: 2,
          answers: []
        },
        {
          id: 3,
          name: 'Emily Davis',
          score: 91,
          completedDate: '2024-01-18',
          timeSpent: 112,
          rank: 3,
          answers: []
        }
      ]
    }
  ];

  const currentExamResult = examResults.find(exam => exam.examId === selectedExam);
  
  const filteredParticipants = currentExamResult?.participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'rank': return a.rank - b.rank;
      case 'score': return b.score - a.score;
      case 'name': return a.name.localeCompare(b.name);
      case 'date': return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
      default: return a.rank - b.rank;
    }
  }) || [];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-gray-600 bg-gray-100';
      case 3: return 'text-amber-600 bg-amber-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const ParticipantAnswersModal = ({ participant, onClose }: {
    participant: ParticipantResult;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{participant.name}'s Answers</h3>
            <p className="text-gray-600">Score: {participant.score}% | Rank: #{participant.rank}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-8">
          {participant.answers.map((answer, index) => (
            <div key={answer.questionId} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Question {index + 1}
                </h4>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor((answer.score / answer.maxScore) * 100)}`}>
                    {answer.score}/{answer.maxScore} points
                  </span>
                  <span className="text-sm text-gray-600">
                    {answer.wordCount} words
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-gray-800 font-medium">{answer.question}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-800 mb-2">Answer:</h5>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {answer.answer.length > 500 
                    ? `${answer.answer.substring(0, 500)}...` 
                    : answer.answer
                  }
                </div>
                {answer.answer.length > 500 && (
                  <button className="text-blue-600 hover:text-blue-700 text-sm mt-2">
                    Read full answer
                  </button>
                )}
              </div>
              
              {answer.feedback && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">Feedback:</h5>
                  <p className="text-green-700">{answer.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Auto-select user if provided
  React.useEffect(() => {
    if (selectedUserId && currentExamResult) {
      const user = currentExamResult.participants.find(p => p.id === selectedUserId);
      if (user) {
        setSelectedParticipant(user);
      }
    }
  }, [selectedUserId, currentExamResult]);

  if (!currentExamResult) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Exam Results
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Detailed analysis of participant performance and comprehensive answer reviews
          </p>
        </div>

        {/* Exam Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Exam</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {examResults.map((exam) => (
              <button
                key={exam.examId}
                onClick={() => setSelectedExam(exam.examId)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedExam === exam.examId
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-2">{exam.examTitle}</h3>
                <div className="text-sm text-gray-600">
                  <p>{exam.totalParticipants} participants</p>
                  <p>Avg: {exam.averageScore}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-blue-900">{currentExamResult.totalParticipants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-green-900">{currentExamResult.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-900">{currentExamResult.completionRate}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Score</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {Math.max(...currentExamResult.participants.map(p => p.score))}%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rank">Sort by Rank</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Participant Results</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Rank</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Participant</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Score</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Time Spent</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Completed</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRankColor(participant.rank)}`}>
                        #{participant.rank}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          {participant.avatar ? (
                            <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{participant.name}</p>
                          <p className="text-sm text-gray-500">ID: {participant.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(participant.score)}`}>
                        {participant.score}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-800">{participant.timeSpent} min</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {participant.completedDate}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedParticipant(participant)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Answers
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Distribution Chart Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Score Distribution</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Score distribution chart would be displayed here</p>
          </div>
        </div>
      </div>

      {/* Participant Answers Modal */}
      {selectedParticipant && (
        <ParticipantAnswersModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
};

export default Results;