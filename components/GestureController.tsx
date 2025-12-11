import React, { useEffect, useRef, useState } from 'react';
import { GestureState } from '../types';

export type DetectionMode = 'POSE' | 'SWIPE';

interface GestureControllerProps {
  onGestureChange?: (gesture: GestureState) => void;
  onSwipe?: () => void;
  mode: DetectionMode;
  onCameraError?: () => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ onGestureChange, onSwipe, mode, onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs to track props without re-triggering effect
  const modeRef = useRef(mode);
  const onGestureChangeRef = useRef(onGestureChange);
  const onSwipeRef = useRef(onSwipe);
  const onCameraErrorRef = useRef(onCameraError);

  // Update refs when props change
  useEffect(() => {
    modeRef.current = mode;
    onGestureChangeRef.current = onGestureChange;
    onSwipeRef.current = onSwipe;
    onCameraErrorRef.current = onCameraError;
  }, [mode, onGestureChange, onSwipe, onCameraError]);

  // Buffers
  const gestureBuffer = useRef<GestureState[]>([]);
  const lastState = useRef<GestureState>(GestureState.IDLE);
  
  // Swipe Logic
  const swipeHistory = useRef<{x: number, time: number}[]>([]);
  const swipeCooldown = useRef<number>(0);

  useEffect(() => {
    // MediaPipe Hands and Camera are loaded globally via <script> tags in index.html
    const MP = (window as any);

    if (!MP.Hands || !MP.Camera) {
      setError("MediaPipe libraries not loaded");
      if (onCameraErrorRef.current) {
        onCameraErrorRef.current();
      }
      return;
    }

    const hands = new MP.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      drawResults(results);
      onResults(results);
    });

    let camera: any = null;

    if (videoRef.current) {
      camera = new MP.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && hands) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      
      camera.start()
        .then(() => setLoading(false))
        .catch((err: any) => {
           console.error("Camera start error:", err);
           setError("Camera access denied or failed");
           // Trigger fallback mode
           if (onCameraErrorRef.current) {
             onCameraErrorRef.current();
           }
        });
    }

    return () => {
       // Only cleanup if component unmounts
       if (camera) {
         // camera.stop(); // Optional, sometimes causes issues if called abruptly
       }
       if (hands) {
         hands.close();
       }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE to maintain continuous camera feed

  const drawResults = (results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !results.multiHandLandmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    
    // Mirror the drawing to match the mirrored video
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    const MP = (window as any);
    for (const landmarks of results.multiHandLandmarks) {
      if (MP.drawConnectors && MP.drawLandmarks) {
        MP.drawConnectors(ctx, landmarks, MP.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        MP.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 2 });
      }
    }
    ctx.restore();
  };

  const onResults = (results: any) => {
    // Access latest mode from ref
    const currentMode = modeRef.current;
    const onGestureChangeFn = onGestureChangeRef.current;
    const onSwipeFn = onSwipeRef.current;

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      if (currentMode === 'POSE' && onGestureChangeFn) {
         updateGesture(GestureState.IDLE, onGestureChangeFn);
      }
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Always detect Pose first (we need it for context)
    const detectedPose = detectPose(landmarks);
    
    // Update global gesture state if in POSE mode
    if (currentMode === 'POSE' && onGestureChangeFn) {
      updateGesture(detectedPose, onGestureChangeFn);
    }

    // Determine if we should check for swipes
    // 1. If mode is SWIPE (Card Closed), accept any hand swipe.
    // 2. If mode is POSE (Card Open), ONLY accept swipe if hand is POINTING.
    const shouldCheckSwipe = currentMode === 'SWIPE' || (currentMode === 'POSE' && detectedPose === GestureState.POINTING);

    if (shouldCheckSwipe && onSwipeFn) {
      detectSwipe(landmarks, onSwipeFn);
    }
  };

  // --- SWIPE LOGIC ---
  const detectSwipe = (landmarks: any[], callback: () => void) => {
    const now = Date.now();
    if (now < swipeCooldown.current) return;

    // Use Wrist (0) or Middle Finger MCP (9)
    const x = landmarks[9].x; 

    // Add to history
    swipeHistory.current.push({ x, time: now });

    // Keep last 800ms
    swipeHistory.current = swipeHistory.current.filter(h => now - h.time < 800);

    if (swipeHistory.current.length < 5) return;

    const start = swipeHistory.current[0];
    const end = swipeHistory.current[swipeHistory.current.length - 1];

    // Check distance covered
    const dist = Math.abs(end.x - start.x);
    
    // Threshold: Moved across 15% of screen width
    if (dist > 0.15) {
      callback();
      swipeCooldown.current = now + 1500; // 1.5 second cooldown
      swipeHistory.current = [];
    }
  };

  // --- POSE LOGIC ---
  const detectPose = (landmarks: any[]): GestureState => {
    const isFingerFolded = (tipIdx: number, pipIdx: number) => {
      const tipToWrist = Math.hypot(landmarks[tipIdx].x - landmarks[0].x, landmarks[tipIdx].y - landmarks[0].y);
      const pipToWrist = Math.hypot(landmarks[pipIdx].x - landmarks[0].x, landmarks[pipIdx].y - landmarks[0].y);
      return tipToWrist < pipToWrist;
    };

    const indexFolded = isFingerFolded(8, 6);
    const middleFolded = isFingerFolded(12, 10);
    const ringFolded = isFingerFolded(16, 14);
    const pinkyFolded = isFingerFolded(20, 18);

    const foldedCount = [indexFolded, middleFolded, ringFolded, pinkyFolded].filter(Boolean).length;

    // Strict Tree: ALL 4 fingers must be folded.
    if (indexFolded && middleFolded && ringFolded && pinkyFolded) {
      return GestureState.TREE; // Fist
    } 
    
    // Pointing: Index Open, Others Folded
    if (!indexFolded && middleFolded && ringFolded && pinkyFolded) {
      return GestureState.POINTING;
    }

    // Scatter: Open Hand (0 or 1 finger folded)
    if (foldedCount <= 1) {
      return GestureState.SCATTER; 
    }

    // Default: IDLE
    return GestureState.IDLE;
  };

  const updateGesture = (newState: GestureState, callback: (g: GestureState) => void) => {
    const bufferSize = 10;
    gestureBuffer.current.push(newState);
    if (gestureBuffer.current.length > bufferSize) {
      gestureBuffer.current.shift();
    }

    const counts = gestureBuffer.current.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<GestureState, number>);

    const dominant = Object.keys(counts).reduce((a, b) => counts[a as GestureState] > counts[b as GestureState] ? a : b) as GestureState;

    if (dominant !== lastState.current) {
        const threshold = bufferSize * 0.7; 
        if ((counts[dominant] || 0) > threshold) {
            lastState.current = dominant;
            callback(dominant);
        }
    } else {
        callback(dominant);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl w-40 h-32 bg-black/50 backdrop-blur-md">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70 animate-pulse bg-black">
          Init Camera...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-400 text-center bg-black p-1">
          {error}
        </div>
      )}
      
      {/* Video Feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        playsInline
        muted
      />

      {/* Drawing Overlay */}
      <canvas 
        ref={canvasRef}
        width={320}
        height={240}
        className="absolute inset-0 w-full h-full object-cover transform scale-x-100" 
      />

      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white py-1">
        {modeRef.current === 'SWIPE' ? 'Swipe Hand' : 'Hand Tracked'}
      </div>
    </div>
  );
};

export default GestureController;