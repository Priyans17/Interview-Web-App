import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaPlayCircle, FaChartLine, FaRobot, FaMicrophone, FaArrowRight, FaUserPlus, FaCog, FaPlay, FaChartBar, FaTrophy } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const features = [
    {
      icon: <FaRobot className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Personalized interview questions tailored to your role and experience level.",
    },
    {
      icon: <FaMicrophone className="w-6 h-6" />,
      title: "Voice Analysis",
      description: "Real-time feedback on your communication skills and speaking patterns.",
    },
    {
      icon: <FaChartLine className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Detailed insights and improvement suggestions to track your progress.",
    },
    {
      icon: <FaPlayCircle className="w-6 h-6" />,
      title: "Mock Interviews",
      description: "Realistic interview simulations in a safe, practice environment.",
    },
  ];

  const steps = [
    {
      icon: <FaUserPlus className="w-6 h-6" />,
      title: "Sign Up",
      description: "Create your free account and set up your profile with your career goals and experience level.",
    },
    {
      icon: <FaCog className="w-6 h-6" />,
      title: "Customize Your Prep",
      description: "Choose your target role, company, and interview type. Upload your resume for personalized questions.",
    },
    {
      icon: <FaPlay className="w-6 h-6" />,
      title: "Start Practicing",
      description: "Begin your mock interviews with AI-generated questions. Practice speaking and get real-time feedback.",
    },
    {
      icon: <FaChartBar className="w-6 h-6" />,
      title: "Review & Improve",
      description: "Analyze your performance with detailed reports. Identify strengths and areas for improvement.",
    },
    {
      icon: <FaTrophy className="w-6 h-6" />,
      title: "Ace Your Interview",
      description: "Apply your learnings in real interviews with confidence and land your dream job!",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2F5DFF 0%, #1ABC9C 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up">
              Master Your Interview Skills
              <span className="block mt-3 text-white opacity-95">
                with Intelligent Practice
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              PrepWise helps you ace interviews with personalized AI feedback, 
              realistic practice sessions, and comprehensive performance analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("/interview/setup")}
                  className="px-8 py-4 bg-white hover:bg-[#F5F6FA] text-[#2F5DFF] text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                >
                  Start Practice Session
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-8 py-4 bg-white hover:bg-[#F5F6FA] text-[#2F5DFF] text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 bg-transparent hover:bg-white/20 text-white text-lg font-semibold rounded-xl border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      <section className="py-20" style={{ background: '#F5F6FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: '#1E1E1E' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#1E1E1E', opacity: 0.7 }}>
              Powerful features designed to help you prepare, practice, and perform your best in interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-transform duration-300 hover:scale-110" style={{ background: '#2F5DFF' }}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center" style={{ color: '#1E1E1E' }}>{feature.title}</h3>
                <p className="text-center leading-relaxed" style={{ color: '#1E1E1E', opacity: 0.7 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#1E1E1E' }}>
              How to Use PrepWise
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#1E1E1E', opacity: 0.7 }}>
              Getting started is simple! Follow these steps to begin your interview preparation journey.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 hidden lg:block" style={{ background: 'linear-gradient(to bottom, #2F5DFF, #1ABC9C)' }}></div>

            <div className="space-y-12">
              {steps.map((step, index) => {
                const colors = [
                  { bg: '#2F5DFF', accent: '#FF8C42' },
                  { bg: '#FF8C42', accent: '#1ABC9C' },
                  { bg: '#1ABC9C', accent: '#2F5DFF' },
                  { bg: '#2F5DFF', accent: '#FF8C42' },
                  { bg: '#FF8C42', accent: '#1ABC9C' },
                ];
                const stepColor = colors[index % colors.length];
                
                return (
                  <div
                    key={index}
                    className="relative flex items-start animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex-shrink-0 relative z-10">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-300 hover:scale-110"
                        style={{ background: stepColor.bg }}
                      >
                        {step.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 rounded-full flex items-center justify-center text-xs font-bold shadow-md" style={{ borderColor: stepColor.bg, color: '#1E1E1E' }}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-8 flex-1">
                      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <h3 className="text-xl font-semibold mb-2" style={{ color: '#1E1E1E' }}>
                          {step.title}
                        </h3>
                        <p className="leading-relaxed" style={{ color: '#1E1E1E', opacity: 0.7 }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-16 animate-fade-in">
            <button
              onClick={() => navigate(isLoggedIn ? "/interview/setup" : "/signup")}
              className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              style={{ background: '#2F5DFF', boxShadow: '0 10px 25px rgba(47,93,255,0.4)' }}
            >
              Start Your Journey Today
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: 'linear-gradient(135deg, #2F5DFF 0%, #1ABC9C 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 animate-fade-in">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 animate-fade-in-delay">
            Join thousands of students who are already improving their interview skills with PrepWise.
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/interview/setup")}
              className="px-8 py-4 bg-white hover:bg-[#F5F6FA] text-[#2F5DFF] text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center animate-fade-in-delay-2"
              style={{ boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}
            >
              Start Your Practice Session
              <FaArrowRight className="ml-2" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white hover:bg-[#F5F6FA] text-[#2F5DFF] text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center animate-fade-in-delay-2"
              style={{ boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}
            >
              Get Started for Free
              <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
      `}</style>
    </main>
  );
}
