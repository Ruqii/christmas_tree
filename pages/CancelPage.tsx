import React from 'react';
import { Link } from 'react-router-dom';

const CancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h2>
          <p className="text-gray-300 mb-6">
            Your payment was cancelled. No charges have been made.
          </p>

          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Try Again
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Changed your mind? You can create and send a card anytime!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
