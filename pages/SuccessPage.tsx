import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string>('');

  useEffect(() => {
    const sendCard = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // Call the secured sendCard API with sessionId
        const response = await fetch('/api/sendCard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send card');
        }

        setCardUrl(data.cardUrl);

        // Extract recipient name from URL if available
        if (data.cardUrl) {
          const url = new URL(data.cardUrl);
          const toParam = url.searchParams.get('to');
          if (toParam) {
            setRecipientName(toParam);
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error sending card:', err);
        setError(err.message || 'Failed to send card');
        setLoading(false);
      }
    };

    sendCard();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment...</h2>
            <p className="text-gray-400">Sending your Christmas card...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4 animate-bounce">🎄</div>
          <h2 className="text-3xl font-bold text-white mb-4">Success!</h2>
          <p className="text-xl text-gray-300 mb-6">
            Your Christmas Card has been successfully sent{recipientName && ` to ${recipientName}`}!
          </p>

          <div className="space-y-4">
            {cardUrl && (
              <a
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200"
              >
                Preview Card 👀
              </a>
            )}

            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Send Another Card
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            The recipient will receive an email shortly with their interactive card.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
