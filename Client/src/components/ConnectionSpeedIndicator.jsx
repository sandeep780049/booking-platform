import { useEffect, useState } from 'react';
import { isSlowConnection } from '../utils/performance';

export const ConnectionSpeedIndicator = () => {
  const [isSlow, setIsSlow] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      const slow = isSlowConnection();
      setIsSlow(slow);
      if (slow) {
        setShow(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setShow(false), 5000);
      }
    };

    checkConnection();

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      connection.addEventListener('change', checkConnection);
      
      return () => {
        connection.removeEventListener('change', checkConnection);
      };
    }
  }, []);

  if (!show || !isSlow) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
      <svg 
        className="w-5 h-5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span className="text-sm font-medium">Slow connection detected. Loading optimized content...</span>
      <button 
        onClick={() => setShow(false)}
        className="ml-2 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};
