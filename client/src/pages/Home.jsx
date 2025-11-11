import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaPlayCircle, FaChartLine, FaRobot, FaMicrophone, FaArrowRight, FaUserPlus, FaCog, FaPlay, FaChartBar, FaTrophy, FaUsers } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: <FaRobot className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Get personalized interview questions tailored to your role and experience level.",
    },
    {
      icon: <FaMicrophone className="w-6 h-6" />,
      title: "Voice Analysis",
      description: "Practice speaking and receive feedback on your communication skills.",
    },
    {
      icon: <FaChartLine className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed insights and improvement suggestions.",
    },
    {
      icon: <FaUsers className="w-6 h-6" />,
      title: "Mock Interviews",
      description: "Experience realistic interview simulations in a safe environment.",
    },
  ];

  const steps = [
    {
      icon: <FaUserPlus className="w-6 h-6" />,
      title: "Sign Up",
      description: "Create your free account and set up your profile with your career goals and experience level.",
      color: "bg-green-500",
    },
    {
      icon: <FaCog className="w-6 h-6" />,
      title: "Customize Your Prep",
      description: "Choose your target role, company, and interview type. Upload your resume for personalized questions.",
      color: "bg-purple-500",
    },
    {
      icon: <FaPlay className="w-6 h-6" />,
      title: "Start Practicing",
      description: "Begin your mock interviews with AI-generated questions. Practice speaking and get real-time feedback.",
      color: "bg-blue-500",
    },
    {
      icon: <FaChartBar className="w-6 h-6" />,
      title: "Review & Improve",
      description: "Analyze your performance with detailed reports. Identify strengths and areas for improvement.",
      color: "bg-orange-500",
    },
    {
      icon: <FaTrophy className="w-6 h-6" />,
      title: "Ace Your Interview",
      description: "Apply your learnings in real interviews with confidence and land your dream job!",
      color: "bg-red-500",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Master Your Interview Skills
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
                with AI-Powered Practice
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-50 mb-10 max-w-3xl mx-auto leading-relaxed">
              PrepWise helps students ace interviews with personalized AI feedback, 
              realistic practice sessions, and detailed performance analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("/interview/setup")}
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  Start Practice Session
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 bg-transparent hover:bg-white/10 text-white text-lg font-semibold rounded-lg border-2 border-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you prepare, practice, and perform your best in interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <FaRobot className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">AI-Powered Questions</h3>
              <p className="text-slate-600 text-center">
                Get personalized interview questions tailored to your role and experience level.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <FaMicrophone className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Voice Analysis</h3>
              <p className="text-slate-600 text-center">
                Practice speaking and receive real-time feedback on your communication skills.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Performance Analytics</h3>
              <p className="text-slate-600 text-center">
                Track your progress with detailed insights and improvement suggestions.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-orange-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <FaPlayCircle className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">Mock Interviews</h3>
              <p className="text-slate-600 text-center">
                Experience realistic interview simulations in a safe, practice environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Step-by-Step Flow */}
      <section id="about" className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-16">
            <div className="order-1 md:order-1">
              <div className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wide">
                About Us
              </div>

              <h2 className="text-4xl lg:text-5xl mb-6 font-bold text-slate-800 leading-tight">
                Empowering Your Interview Success
              </h2>

              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                PrepWise is a cutting-edge platform designed to revolutionize interview preparation. Our
                mission is to empower students and job seekers with the tools and resources they need to succeed in today's
                competitive job market. We leverage advanced AI technology to provide personalized feedback,
                realistic simulations, and comprehensive learning materials.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <FaArrowRight className="ml-2" />
                </button>

                <button
                  onClick={scrollToAbout}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="order-2 md:order-2 h-64 md:h-80 lg:h-[400px] flex items-center justify-center">
              <img
                src="/about.png"
                alt="PrepWise platform illustration"
                className="w-full h-full object-contain max-w-sm md:max-w-md lg:max-w-lg"
              />
            </div>
          </div>

          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              What is PrepWise?
            </h3>
            <p className="text-lg text-slate-700 max-w-3xl mx-auto mb-12">
              PrepWise is your personal interview coach, powered by artificial intelligence. We combine
              cutting-edge technology with proven interview techniques to help you land your dream job.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 lg:p-12 mb-16 shadow-md border border-slate-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Built for Modern Job Seekers
              </h3>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Whether you're a fresh graduate, career changer, or experienced professional, PrepWise adapts
                to your needs. Our platform covers technical interviews, behavioral questions, system design,
                and more across various industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Step by Step */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              How to Use PrepWise
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Getting started is simple! Follow these steps to begin your interview preparation journey.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-300 hidden lg:block"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative flex items-start"
                >
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white shadow-lg`}
                    >
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center text-xs font-bold text-slate-700">
                      {index + 1}
                    </div>
                  </div>
                  <div className="ml-8 flex-1">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              Start Your Journey Today
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-blue-50 mb-8">
            Join thousands of students who are already improving their interview skills with PrepWise.
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/interview/setup")}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 inline-flex items-center"
            >
              Start Your Practice Session
              <FaArrowRight className="ml-2" />
            </button>
          ) : (
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 inline-flex items-center"
            >
              Get Started for Free
              <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
