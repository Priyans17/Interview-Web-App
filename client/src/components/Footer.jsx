import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">PrepWise</span>
            </div>
            <p className="text-lg text-gray-600 mb-4 max-w-md">
              Master your interview skills with AI-powered practice sessions, real-time feedback, 
              and personalized insights to help you land your dream job.
            </p>
          </div>
		  
		  {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-5 pt-5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-[14px] sm:text-[16px] md:text-[18px] lg:text-[16px]">
            © {new Date().getFullYear()} PrepWise. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-200">
              Privacy
            </Link>
            <Link to="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-200">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
