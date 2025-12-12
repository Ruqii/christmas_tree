import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ParticleCanvas from '../components/ParticleCanvas';
import GestureController from '../components/GestureController';
import GreetingCard from '../components/GreetingCard';
import GestureInstructions from '../components/GestureInstructions';
import { GestureState } from '../types';

const CardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureState>(GestureState.IDLE);
  const [activeMode, setActiveMode] = useState<GestureState>(GestureState.SCATTER);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Extract URL parameters with defaults
  const to = searchParams.get('to') || 'Friend';
  const from = searchParams.get('from') || '';
  const message = searchParams.get('msg') || '';

  // Show instructions when card opens (in gesture control mode)
  React.useEffect(() => {
    if (isCardOpen && !fallbackMode) {
      setShowInstructions(true);
    }
  }, [isCardOpen, fallbackMode]);

  // Auto-play animation in fallback mode
  React.useEffect(() => {
    if (!fallbackMode || !hasStarted) return;

    // Auto-open card after 2 seconds
    const openTimer = setTimeout(() => {
      setIsCardOpen(true);
    }, 2000);

    // Auto-cycle between scatter and tree every 5 seconds
    const cycleTimer = setInterval(() => {
      setActiveMode(prev => prev === GestureState.SCATTER ? GestureState.TREE : GestureState.SCATTER);
    }, 5000);

    return () => {
      clearTimeout(openTimer);
      clearInterval(cycleTimer);
    };
  }, [fallbackMode, hasStarted]);

  const handleGestureChange = (gesture: GestureState) => {
    setCurrentGesture(gesture);
    if (gesture === GestureState.TREE || gesture === GestureState.SCATTER) {
      setActiveMode(gesture);
    }
  };

  const handleSwipe = () => {
    if (!isCardOpen) {
      setIsCardOpen(true);
    } else {
      setIsCardOpen(false);
    }
  };

  const handleCameraError = () => {
    console.log('Camera failed, enabling fallback mode');
    setFallbackMode(true);
  };

  const getModeText = () => {
    switch (activeMode) {
      case GestureState.TREE:
        return "Christmas Tree Formed";
      case GestureState.SCATTER:
        return "Particles Scattered";
      default:
        return "";
    }
  };

  // Instruction screen before card opens
  if (!hasStarted) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205]">
        <div className="max-w-md mx-auto px-8 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">
              You've received a card!
            </h1>
            <p className="text-lg text-gray-300">
              Dear {to},
            </p>
            <p className="text-gray-400">
              {from} sent you something magical.
            </p>
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Open your card ✨
          </button>

          <p className="text-sm text-gray-500">
            Best experienced with camera enabled
          </p>
        </div>
      </div>
    );
  }

  // Main card experience (existing App.tsx logic)
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#020205] via-[#0a0f20] to-[#020205]">

      {/* --- LAYER 1: Particle System (Always Rendered) --- */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isCardOpen ? 'opacity-100' : 'opacity-0'}`}>
        <ParticleCanvas gesture={activeMode} />

        {/* Particle UI Overlay - Only show when card is open */}
        <div className={`transition-opacity duration-500 ${isCardOpen ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Center Title */}
          <div className="absolute top-8 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-fade-in-down">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-100 drop-shadow-[0_0_10px_rgba(255,255,200,0.5)] tracking-wider mb-2">
              Magic Holiday Tree
            </h1>
            <div className="flex flex-col items-center gap-2">
              <p className={`text-xl font-medium transition-all duration-500 ${activeMode === GestureState.TREE ? 'text-green-400' : 'text-blue-300'}`}>
                {getModeText()}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* --- LAYER 2: Greeting Card (Always Rendered on Top) --- */}
      <GreetingCard
        isOpen={isCardOpen}
        to={to}
        from={from}
        message={message}
      />

      {/* --- LAYER 3: Controller --- */}
      {!fallbackMode && (
        <GestureController
          mode={!isCardOpen ? 'SWIPE' : 'POSE'}
          onGestureChange={handleGestureChange}
          onSwipe={handleSwipe}
          onCameraError={handleCameraError}
        />
      )}

      {/* --- LAYER 4: Gesture Instructions (Only in gesture mode when card is open) --- */}
      {!fallbackMode && (
        <GestureInstructions
          currentGesture={currentGesture}
          activeMode={activeMode}
          isVisible={showInstructions}
        />
      )}

      {/* Fallback mode indicator */}
      {fallbackMode && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/70 backdrop-blur-md px-4 py-3 rounded-lg border border-white/20 shadow-lg">
          <p className="text-sm text-white/90">Auto-play mode</p>
          <p className="text-xs text-white/60">Camera not available</p>
        </div>
      )}
    </div>
  );
};

export default CardPage;
