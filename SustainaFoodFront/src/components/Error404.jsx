import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Error404 = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Animation effect on mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      <div className={`max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 ease-in-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative h-64 bg-gradient-to-r from-green-500 to-teal-600">
          {/* Animated elements */}
          <div className="absolute w-24 h-24 top-8 left-8 rounded-full bg-white/10 animate-pulse"></div>
          <div className="absolute w-16 h-16 top-24 left-32 rounded-full bg-white/10 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute w-20 h-20 top-12 right-16 rounded-full bg-white/10 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Large 404 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-9xl font-extrabold text-white opacity-75 tracking-widest">404</h1>
          </div>
        </div>
        
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            Oops! It seems like you've wandered into uncharted territory. The page you're looking for might have been moved, deleted, or perhaps never existed at all.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              to="/" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Return to Homepage
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-medium rounded-lg transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Lost? Check out our <Link to="/contact" className="text-green-600 hover:underline">Help Center</Link> or <Link to="/about" className="text-green-600 hover:underline">About Us</Link> page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error404;