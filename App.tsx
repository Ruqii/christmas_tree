import React, { useState } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import GestureController from './components/GestureController';
import GreetingCard from './components/GreetingCard';
import { GestureState } from './types';

const App: React.FC = () => {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureState>(GestureState.IDLE);
  const [activeMode, setActiveMode] = useState<GestureState>(GestureState.SCATTER); 

  const handleGestureChange = (gesture: GestureState) => {
    setCurrentGesture(gesture);
    
    // Only update particle modes if the gesture is explicitly Tree or Scatter
    // We ignore Pointing for particles, so the particles stay in their last state while we close the card
    if (gesture === GestureState.TREE || gesture === GestureState.SCATTER) {
      setActiveMode(gesture);
    }
  };

  const handleSwipe = () => {
    if (!isCardOpen) {
      // If card is closed, ANY swipe opens it
      setIsCardOpen(true);
    } else {
      // If card is open, the controller ONLY calls this if we are POINTING.
      // We don't need to check currentGesture here (which avoids async state race conditions).
      setIsCardOpen(false);
    }
  };

  const getStatusText = () => {
    switch (currentGesture) {
      case GestureState.TREE:
        return "Detecting: Fist (Tree Mode)";
      case GestureState.SCATTER:
        return "Detecting: Open Hand (Scatter Mode)";
      case GestureState.POINTING:
        return "Detecting: Pointing (Swipe to Close)";
      default:
        return "Detecting: ...";
    }
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
  }

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

            {/* Bottom Right Instructions */}
            <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 pointer-events-none z-10 animate-fade-in-up">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                <p className="text-sm font-mono text-gray-200">
                  {getStatusText()}
                </p>
              </div>
              <div className="space-y-2 text-right text-white/60 text-sm hidden md:block bg-black/20 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <p><span className="text-white">Close Fist</span> to form Tree</p>
                <p><span className="text-white">Open Hand</span> to Scatter</p>
                <p><span className="text-white">Point + Swipe</span> to Close Card</p>
              </div>
            </div>
        </div>
      </div>

      {/* --- LAYER 2: Greeting Card (Always Rendered on Top) --- */}
      {/* Passing isOpen controls the transform/opacity transition */}
      <GreetingCard isOpen={isCardOpen} />

      {/* --- LAYER 3: Controller --- */}
      <GestureController 
        mode={!isCardOpen ? 'SWIPE' : 'POSE'}
        onGestureChange={handleGestureChange}
        onSwipe={handleSwipe}
      />
      
    </div>
  );
};

export default App;