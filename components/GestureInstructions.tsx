import React, { useEffect, useState } from 'react';
import { GestureState } from '../types';

interface GestureInstructionsProps {
  currentGesture: GestureState;
  activeMode: GestureState;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const GestureInstructions: React.FC<GestureInstructionsProps> = ({
  currentGesture,
  activeMode,
  isVisible,
  onAnimationComplete
}) => {
  const [displayMode, setDisplayMode] = useState<'full' | 'compact'>('full');

  useEffect(() => {
    if (!isVisible) return;

    // Show full overlay for 3.5 seconds, then shrink to compact
    const timer = setTimeout(() => {
      setDisplayMode('compact');
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  const getStatusText = () => {
    switch (currentGesture) {
      case GestureState.TREE:
        return "✊ Fist detected";
      case GestureState.SCATTER:
        return "✋ Open hand detected";
      case GestureState.POINTING:
        return "👉 Pointing detected";
      default:
        return "Show me your hand";
    }
  };

  const getModeText = () => {
    switch (activeMode) {
      case GestureState.TREE:
        return "Tree Formed";
      case GestureState.SCATTER:
        return "Particles Scattered";
      default:
        return "";
    }
  };

  // Full centered overlay mode
  if (displayMode === 'full') {
    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40 animate-fade-in">
        <div className="relative">
          {/* Glass morphism panel */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl px-12 py-10 max-w-lg mx-4 animate-scale-in">

            {/* Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-8 drop-shadow-lg">
              Control the Magic
            </h2>

            {/* Instructions */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-5 border border-white/10 transition-all hover:bg-white/10">
                <div className="text-5xl">✋</div>
                <div className="flex-1">
                  <p className="text-xl font-semibold text-white">Open Hand</p>
                  <p className="text-base text-gray-300 mt-1">→ Scatter Particles</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-5 border border-white/10 transition-all hover:bg-white/10">
                <div className="text-5xl">✊</div>
                <div className="flex-1">
                  <p className="text-xl font-semibold text-white">Closed Fist</p>
                  <p className="text-base text-gray-300 mt-1">→ Form Tree</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-5 border border-white/10 transition-all hover:bg-white/10">
                <div className="text-5xl">👉</div>
                <div className="flex-1">
                  <p className="text-xl font-semibold text-white">Point + Swipe</p>
                  <p className="text-base text-gray-300 mt-1">→ Close Card</p>
                </div>
              </div>
            </div>

            {/* Current status indicator */}
            <div className="mt-8 text-center">
              <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                <p className="text-lg font-medium text-white">
                  {getStatusText()}
                </p>
              </div>
            </div>

            {/* Auto-hide hint */}
            <p className="text-center text-sm text-gray-400 mt-6 opacity-60">
              These instructions will minimize in a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compact corner hint mode
  return (
    <div className="fixed bottom-3 right-3 md:bottom-8 md:right-8 pointer-events-none z-40 animate-fade-in">
      <div className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl md:rounded-2xl shadow-xl px-2.5 py-2 md:px-5 md:py-4 max-w-[180px] md:max-w-xs">

        {/* Current status */}
        <div className="mb-2 md:mb-3">
          <p className="text-[10px] md:text-sm font-semibold text-gray-300 mb-0.5 md:mb-1">Current:</p>
          <p className={`text-xs md:text-lg font-bold transition-colors ${
            activeMode === GestureState.TREE ? 'text-green-400' : 'text-blue-400'
          }`}>
            {getModeText()}
          </p>
        </div>

        {/* Mini instructions */}
        <div className="space-y-1 md:space-y-2 text-[10px] md:text-sm text-white/80 border-t border-white/10 pt-2 md:pt-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-sm md:text-lg">✋</span>
            <span>Open → Scatter</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-sm md:text-lg">✊</span>
            <span>Fist → Tree</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-sm md:text-lg">👉</span>
            <span>Point + Swipe → Close</span>
          </div>
        </div>

        {/* Detection indicator */}
        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10">
          <p className="text-[9px] md:text-xs text-gray-400">
            {getStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestureInstructions;
