import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Save, 
  Send, 
  AlertTriangle, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Globe,
  Volume2
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  wordLimit: number;
  points: number;
}

interface ExamTakingProps {
  examId: number;
  examTitle: string;
  duration: number; // in minutes
  onComplete: (answers: { [key: number]: string }) => void;
  onExit: () => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface TranslationSuggestion {
  original: string;
  translated: string;
  confidence: number;
}
const ExamTaking: React.FC<ExamTakingProps> = ({ 
  examId, 
  examTitle, 
  duration, 
  onComplete, 
  onExit 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  });
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState<{ [key: number]: string }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSuggestions, setTranslationSuggestions] = useState<TranslationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentInput, setCurrentInput] = useState('');

  // Available languages
  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
  ];
  // Sample questions - in real app, these would come from props or API
  const questions: Question[] = [
    {
      id: 1,
      question: "Discuss the significance of the Sermon on the Mount (Matthew 5-7) in Christian ethics and daily living. How do the Beatitudes shape our understanding of what it means to be blessed, and how can modern Christians apply these teachings in contemporary society?",
      wordLimit: 2000,
      points: 20
    },
    {
      id: 2,
      question: "Analyze the concept of grace in Christian theology. How does understanding grace affect our relationship with God and our interactions with others? Provide biblical examples and explain how grace differs from mercy.",
      wordLimit: 2000,
      points: 20
    },
    {
      id: 3,
      question: "Examine the role of prayer in the Christian life. Discuss different types of prayer mentioned in Scripture, the importance of persistence in prayer, and how prayer can transform both the individual and community.",
      wordLimit: 2000,
      points: 20
    },
    {
      id: 4,
      question: "Explore the concept of Christian leadership as demonstrated by Jesus Christ. How does servant leadership differ from worldly leadership models? Provide specific examples from Jesus' ministry and explain how these principles apply to church leadership today.",
      wordLimit: 2000,
      points: 20
    },
    {
      id: 5,
      question: "Discuss the importance of community in the Christian faith. How does the early church model in Acts provide guidance for modern church communities? Address the balance between individual faith and corporate worship.",
      wordLimit: 2000,
      points: 20
    }
  ];

  // Mock translation function (in real app, this would call a translation API)
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    setIsTranslating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock translations for demonstration
    const mockTranslations: { [key: string]: { [key: string]: string } } = {
      'te': {
        'Discuss the significance of the Sermon on the Mount': 'పర్వత ప్రసంగం యొక్క ప్రాముఖ్యతను చర్చించండి',
        'Analyze the concept of grace': 'దయ అనే భావనను విశ్లేషించండి',
        'Examine the role of prayer': 'ప్రార్థన పాత్రను పరిశీలించండి',
        'Explore the concept of Christian leadership': 'క్రైస్తవ నాయకత్వ భావనను అన్వేషించండి',
        'Discuss the importance of community': 'సమాజం యొక్క ప్రాముఖ్యతను చర్చించండి'
      },
      'hi': {
        'Discuss the significance of the Sermon on the Mount': 'पर्वत पर उपदेश के महत्व पर चर्चा करें',
        'Analyze the concept of grace': 'अनुग्रह की अवधारणा का विश्लेषण करें',
        'Examine the role of prayer': 'प्रार्थना की भूमिका की जांच करें',
        'Explore the concept of Christian leadership': 'ईसाई नेतृत्व की अवधारणा का अन्वेषण करें',
        'Discuss the importance of community': 'समुदाय के महत्व पर चर्चा करें'
      }
    };
    
    setIsTranslating(false);
    
    const translations = mockTranslations[targetLanguage];
    if (translations) {
      for (const [english, translated] of Object.entries(translations)) {
        if (text.includes(english)) {
          return text.replace(english, translated);
        }
      }
    }
    
    return text; // Return original if no translation found
  };

  // Mock input assistance function
  const getInputSuggestions = async (input: string, targetLanguage: string): Promise<TranslationSuggestion[]> => {
    if (input.length < 3 || targetLanguage === 'en') return [];
    
    // Mock suggestions for demonstration
    const mockSuggestions: { [key: string]: TranslationSuggestion[] } = {
      'te': [
        { original: 'rayadam', translated: 'రాయడం', confidence: 0.95 },
        { original: 'chadavadam', translated: 'చదవడం', confidence: 0.92 },
        { original: 'matladam', translated: 'మాట్లాడం', confidence: 0.90 },
        { original: 'vindam', translated: 'వినడం', confidence: 0.88 },
        { original: 'chodam', translated: 'చూడం', confidence: 0.85 }
      ],
      'hi': [
        { original: 'likhna', translated: 'लिखना', confidence: 0.95 },
        { original: 'padhna', translated: 'पढ़ना', confidence: 0.92 },
        { original: 'bolna', translated: 'बोलना', confidence: 0.90 },
        { original: 'sunna', translated: 'सुनना', confidence: 0.88 },
        { original: 'dekhna', translated: 'देखना', confidence: 0.85 }
      ]
    };
    
    const suggestions = mockSuggestions[targetLanguage] || [];
    return suggestions.filter(s => 
      s.original.toLowerCase().includes(input.toLowerCase()) ||
      input.toLowerCase().includes(s.original.toLowerCase())
    );
  };

  // Handle language change
  const handleLanguageChange = async (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageSelector(false);
    
    if (language.code !== 'en') {
      // Translate all questions
      const translated: { [key: number]: string } = {};
      for (const question of questions) {
        translated[question.id] = await translateText(question.question, language.code);
      }
      setTranslatedQuestions(translated);
    } else {
      setTranslatedQuestions({});
    }
  };

  // Handle input change with suggestions
  const handleInputChange = async (questionId: number, value: string) => {
    setCurrentInput(value);
    handleAnswerChange(questionId, value);
    
    if (selectedLanguage.code !== 'en') {
      const words = value.split(' ');
      const lastWord = words[words.length - 1];
      
      if (lastWord.length >= 3) {
        const suggestions = await getInputSuggestions(lastWord, selectedLanguage.code);
        setTranslationSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  // Apply suggestion
  const applySuggestion = (suggestion: TranslationSuggestion) => {
    const words = currentInput.split(' ');
    words[words.length - 1] = suggestion.translated;
    const newValue = words.join(' ');
    
    setCurrentInput(newValue);
    handleAnswerChange(currentQuestionData.id, newValue);
    setShowSuggestions(false);
  };

  // Text-to-speech for questions
  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage.code;
      speechSynthesis.speak(utterance);
    }
  };
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save effect
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (answers[questions[currentQuestion].id]) {
        setAutoSaveStatus('saving');
        // Simulate auto-save
        setTimeout(() => {
          setAutoSaveStatus('saved');
        }, 1000);
      }
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [answers, currentQuestion]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleAutoSubmit = () => {
    onComplete(answers);
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(false);
    onComplete(answers);
  };

  const handleExit = () => {
    setShowExitConfirm(false);
    onExit();
  };

  const getCompletionStatus = () => {
    const answeredQuestions = Object.keys(answers).length;
    return `${answeredQuestions}/${questions.length}`;
  };

  const isTimeRunningOut = timeLeft <= 300; // 5 minutes
  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData.id] || '';
  const wordCount = getWordCount(currentAnswer);
  const isOverLimit = wordCount > currentQuestionData.wordLimit;
  const displayQuestion = translatedQuestions[currentQuestionData.id] || currentQuestionData.question;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{examTitle}</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-lg">{selectedLanguage.flag}</span>
                  <span className="font-medium">{selectedLanguage.nativeName}</span>
                </button>

                {showLanguageSelector && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3 ${
                          selectedLanguage.code === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <div>
                          <p className="font-medium">{language.nativeName}</p>
                          <p className="text-sm text-gray-500">{language.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Auto-save status */}
              <div className="flex items-center space-x-2">
                {autoSaveStatus === 'saving' && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Saved</span>
                  </>
                )}
              </div>

              {/* Timer */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isTimeRunningOut ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>

              {/* Progress */}
              <div className="text-sm text-gray-600">
                Completed: {getCompletionStatus()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Questions</h3>
              <div className="space-y-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[q.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Question {index + 1}</span>
                      {answers[q.id] && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-sm opacity-75">{q.points} points</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Exam
                </button>
                
                <button
                  onClick={() => setShowExitConfirm(true)}
                  className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Save & Exit
                </button>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Question {currentQuestion + 1}
                  </h2>
                  <div className="flex items-center space-x-4">
                    {selectedLanguage.code !== 'en' && (
                      <button
                        onClick={() => speakQuestion(displayQuestion)}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        title="Listen to question"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm">Listen</span>
                      </button>
                    )}
                    <span className="text-sm text-gray-600">
                      {currentQuestionData.points} points
                    </span>
                    <span className="text-sm text-gray-600">
                      Max: {currentQuestionData.wordLimit} words
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  {isTranslating && (
                    <div className="absolute top-2 right-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {displayQuestion}
                  </p>
                </div>
              </div>

              {/* Answer Area */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-medium text-gray-800">
                    Your Answer
                    {selectedLanguage.code !== 'en' && (
                      <span className="text-sm text-blue-600 ml-2">
                        (in {selectedLanguage.nativeName})
                      </span>
                    )}
                  </label>
                  <div className={`text-sm ${
                    isOverLimit ? 'text-red-600' : wordCount > currentQuestionData.wordLimit * 0.9 ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {wordCount} / {currentQuestionData.wordLimit} words
                  </div>
                </div>
                
                <textarea
                  value={currentAnswer}
                  onChange={(e) => handleInputChange(currentQuestionData.id, e.target.value)}
                  placeholder={selectedLanguage.code === 'en' 
                    ? "Type your detailed answer here... (2000 words)" 
                    : `${selectedLanguage.nativeName} లో మీ వివరణాత్మక సమాధానం టైప్ చేయండి... (2000 పదాలు)`
                  }
                  className={`w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isOverLimit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  dir={['ar', 'he'].includes(selectedLanguage.code) ? 'rtl' : 'ltr'}
                />
                
                {/* Translation Suggestions */}
                {showSuggestions && translationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10">
                    <div className="p-2 border-b border-gray-200">
                      <p className="text-xs text-gray-600">Translation suggestions:</p>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {translationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => applySuggestion(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-gray-600 text-sm">{suggestion.original}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">{suggestion.translated}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isOverLimit && (
                  <div className="mt-2 flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Answer exceeds word limit by {wordCount - currentQuestionData.wordLimit} words
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setAutoSaveStatus('saving');
                      setTimeout(() => setAutoSaveStatus('saved'), 1000);
                    }}
                    className="flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Progress
                  </button>

                  <button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You have answered {Object.keys(answers).length} out of {questions.length} questions.
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Yes, Submit
              </button>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Save Progress & Exit?</h3>
            <p className="text-gray-600 mb-6">
              Your progress will be saved and you can continue this exam later before the deadline. 
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handleExit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Save & Exit
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Continue Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning */}
      {isTimeRunningOut && (
        <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">Time running out!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTaking;