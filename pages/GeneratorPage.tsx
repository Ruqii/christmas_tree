import React, { useState } from 'react';

const GeneratorPage: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          senderName,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Send a Christmas Card
          </h1>
          <p className="text-gray-400">
            Create a magical gesture-controlled card for someone special
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Email */}
            <div>
              <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-300 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                id="recipientEmail"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="friend@example.com"
              />
            </div>

            {/* Recipient Name */}
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-300 mb-1">
                Recipient Name *
              </label>
              <input
                type="text"
                id="recipientName"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Friend's name"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label htmlFor="senderName" className="block text-sm font-medium text-gray-300 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="senderName"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Personal Message (optional)
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Write your holiday wishes here (optional)..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Pay & Send Card (£1.99)'}
            </button>
          </form>
        </div>

        {/* Preview Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Want to preview first?{' '}
            <a
              href="/card?to=Preview&from=You&msg=This is how your card will look!"
              className="text-green-400 hover:text-green-300 underline"
            >
              See a demo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;
