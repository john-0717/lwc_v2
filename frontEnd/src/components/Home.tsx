import React from 'react';
import { Heart, Users, MessageCircle, BookOpen, Star, Calendar, ArrowRight, User } from 'lucide-react';

interface HomeProps {
  onLearnMore: () => void;
  onViewAnswers?: (userId: number, examId: number) => void;
}

const Home: React.FC<HomeProps> = ({ onLearnMore,onViewAnswers }) => {
  // Top 10 exam rankers data
  const topRankers = [
    { id: 1, name: 'Sarah Johnson', score: 96, examId: 1, rank: 1 },
    { id: 2, name: 'Michael Chen', score: 94, examId: 1, rank: 2 },
    { id: 3, name: 'Emily Davis', score: 91, examId: 1, rank: 3 },
    { id: 4, name: 'David Wilson', score: 89, examId: 1, rank: 4 },
    { id: 5, name: 'Rachel Martinez', score: 87, examId: 1, rank: 5 },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-gray-600 bg-gray-100';
      case 3: return 'text-amber-600 bg-amber-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };
  const features = [
    {
      icon: Users,
      title: 'Community Gathering',
      description: 'Join our weekly fellowship meetings and special events to connect with fellow believers.',
      color: 'bg-blue-500'
    },
    {
      icon: MessageCircle,
      title: 'Discussion Forums',
      description: 'Engage in meaningful conversations about faith, scripture, and spiritual growth.',
      color: 'bg-green-500'
    },
    {
      icon: Heart,
      title: 'Prayer Support',
      description: 'Share your prayer requests and lift each other up in Christian love and support.',
      color: 'bg-red-500'
    },
    {
      icon: BookOpen,
      title: 'Spiritual Resources',
      description: 'Access devotionals, Bible studies, and resources to deepen your faith journey.',
      color: 'bg-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'This community has been a blessing in my life. The discussions have helped me grow closer to Christ.',
      role: 'Community Member'
    },
    {
      name: 'Michael Chen',
      text: 'The prayer support here is incredible. I feel truly connected to my brothers and sisters in faith.',
      role: 'Prayer Team Leader'
    },
    {
      name: 'Emily Davis',
      text: 'The resources available have transformed my daily devotional time. Highly recommend!',
      role: 'Small Group Leader'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Hero Section */}
      <section className="w-full md:w-[90%] mx-auto bg-white rounded-lg flex flex-col md:flex-row items-center justify-between px-8 py-1 bg-white flex-grow">
        {/* Left Text */}
        <div className="max-w-xl mb-12 md:mb-0 text-center flex flex-col md:flex-col items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 caladea-regular">
            Let's Take Up Your <span className="text-blue-600">CROSS</span> and <br /> Follow <span className="text-blue-600">CHRIST</span>
          </h1>
          <div className="w-16 h-1 bg-blue-600 mb-4" />
          <p className="text-lg text-gray-700 caladea-regular mb-12">
            Life With Christ - Is A Blessing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-lg transition-all duration-200 transform hover:bg-blue-800">
              Join Our Community
            </button>
            <button
              onClick={onLearnMore}
              className="group border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold py-2 px-8 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <BookOpen className="h-5 w-5 mr-3" />
              Learn More
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="max-w-md w-full hidden md:block">
          <img
            src="public/jesus-carries-cross-2.png"
            alt="Jesus carrying cross"
            className="rounded-lg object-cover object-[0%_45%]  w-full h-[500px]"
          />
        </div>
      </section>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            A Christ-centered spiritual community where believers gather, discuss, pray, and grow together in faith.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <Star className="h-12 w-12 text-yellow-300" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Heart className="h-16 w-16 text-yellow-300" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              How We Serve Together
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the many ways our community comes together to worship, learn, and support one another.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`${feature.color} p-4 rounded-lg inline-block mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Testimonies of Faith
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our community members about their journey with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-blue-900">{testimonial.name}</p>
                  <p className="text-blue-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Top 10 Exam Rankers */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Top Exam Performers
            </h2>
            <p className="text-xl text-gray-600">
              Celebrating our community's dedication to spiritual learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topRankers.map((ranker) => (
              <div
                key={ranker.id}
                onClick={() => onViewAnswers && onViewAnswers(ranker.id, ranker.examId)}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>

                  <div className="mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRankColor(ranker.rank)}`}>
                      #{ranker.rank}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2">{ranker.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{ranker.score}%</p>
                  <p className="text-sm text-gray-600">Biblical Knowledge</p>

                  <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                    View Answers
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200">
              View Full Leaderboard
            </button>
          </div>
        </div>
      </section> */}



      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Calendar className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Us This Sunday
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            Experience the joy of worship and fellowship with our community. All are welcome!
          </p>
          <div className="bg-white text-blue-900 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-2">Sunday Service</h3>
            <p className="text-lg">10:00 AM - 11:30 AM</p>
            <p className="text-gray-600">Community Center Hall</p>
          </div>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
            Get Directions
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;