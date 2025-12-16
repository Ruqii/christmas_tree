import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const GeneratorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processedSessionRef = useRef<string | null>(null);

  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCard, setSendingCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const MAX_PHOTOS = 5;

  // Handle payment success callback from Stripe
  useEffect(() => {
    const sessionId = searchParams.get('id');
    const stripeSessionId = searchParams.get('session_id');
    const cancelledParam = searchParams.get('cancelled');

    // Handle cancellation
    if (cancelledParam === 'true') {
      setCancelled(true);
      // Clear URL params
      navigate('/', { replace: true });
      return;
    }

    // Handle successful payment - only process once per session
    if (sessionId && stripeSessionId && processedSessionRef.current !== sessionId) {
      processedSessionRef.current = sessionId;

      const sendCard = async () => {
        setSendingCard(true);
        try {
          const response = await fetch('/api/sendCard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to send card');
          }

          setCardUrl(data.cardUrl);
          setSuccess(true);
          setSendingCard(false);

          // Clear URL params after a short delay to ensure state is set
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
        } catch (err: any) {
          console.error('Error sending card:', err);
          setError(err.message || 'Failed to send card');
          setSendingCard(false);
          navigate('/', { replace: true });
        }
      };

      sendCard();
    }
  }, [searchParams, navigate]);

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
          photoUrls,
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (photoUrls.length + files.length > MAX_PHOTOS) {
      setError(`You can only upload up to ${MAX_PHOTOS} photos. Currently you have ${photoUrls.length}.`);
      return;
    }

    setPhotoLoading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 10MB`);
        }

        console.log('Uploading image to server:', file.name, file.type, file.size);

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('photo', file);

        // Upload to server for conversion
        const response = await fetch('/api/convert-image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        console.log('Server processed image:', data);
        return data.url;
      });

      // Wait for all uploads to complete
      const newUrls = await Promise.all(uploadPromises);

      // Add new URLs to existing array
      setPhotoUrls(prev => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      const errorMsg = err.message || 'Failed to process image';
      setError(`Failed to upload image: ${errorMsg}. Please try a different photo.`);
    } finally {
      setPhotoLoading(false);
      // Clear the input so the same file can be uploaded again
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setRecipientEmail('');
    setRecipientName('');
    setSenderName('');
    setMessage('');
    setSuccess(false);
    setError(null);
    setCardUrl(null);
    setCancelled(false);
    setPhotoUrls([]);
  };

  // Show sending state after payment
  if (sendingCard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-3xl font-bold text-white mb-4">Sending...</h2>
            <p className="text-gray-300">
              Sending your Christmas card, please wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success && cardUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">
              Your Christmas card has been sent!
            </p>

            {/* Card Preview Link */}
            <a
              href={cardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 mb-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transform hover:scale-105 transition-all duration-200"
            >
              Preview Card
            </a>

            {/* Send Another Card Button */}
            <button
              onClick={resetForm}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Send Another Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205] py-12 px-4 pb-20">
      <div className="max-w-md w-full mx-auto">
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

            {/* Photo Upload */}
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1">
                Add Photos (optional, up to {MAX_PHOTOS})
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={photoUrls.length >= MAX_PHOTOS}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports all photo formats including iPhone HEIC (max 10MB each). {photoUrls.length}/{MAX_PHOTOS} uploaded
                </p>
                {photoLoading && (
                  <p className="text-sm text-gray-400">Uploading and processing images...</p>
                )}
                {photoUrls.length > 0 && !photoLoading && (
                  <div className="space-y-2">
                    {photoUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 flex-1">
                          <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-green-300 font-medium">Photo {index + 1} uploaded</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="text-sm text-red-400 hover:text-red-300 underline whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cancelled Message */}
            {cancelled && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-300 text-sm text-center">
                  Payment cancelled. You can fill out the form and try again.
                </p>
              </div>
            )}

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
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Want to preview first?{' '}
            <a
              href="/card?to=Preview&from=You&msg=This is how your card will look!"
              className="text-green-400 hover:text-green-300 underline"
            >
              See a demo
            </a>
          </p>
          {photoUrls.length > 0 && (
            <p className="text-sm text-gray-500">
              <a
                href={`/card?to=Preview&from=You&msg=This is how your card will look!#photos=${encodeURIComponent(photoUrls.join(','))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                Preview with your {photoUrls.length} photo{photoUrls.length > 1 ? 's' : ''}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;
