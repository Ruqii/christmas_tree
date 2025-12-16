import React, { useRef, useEffect } from 'react';
import { GestureState, Particle } from '../types';
import { generateTreeTarget, generateScatterTarget, generateStarTarget, randomRange } from '../utils/geometry';

interface ParticleCanvasProps {
  gesture: GestureState;
  photos?: string[];
}

const PARTICLE_COUNT = 1800;
const STAR_COUNT = 1; // Only 1 big star

// Festive Palette
const LEAF_COLORS = ['#0f3d0f', '#1a5c1a', '#004d00', '#2e8b57', '#083808']; 
const GIFT_COLORS = ['#d32f2f', '#1976d2', '#fbc02d', '#7b1fa2', '#ffffff']; 
const RIBBON_COLORS = ['#ffd700', '#ffffff', '#ff0000']; 

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ gesture, photos = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const rotationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const photoImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Preload photo images
  useEffect(() => {
    console.log('ParticleCanvas - photos prop received:', photos);
    if (photos && photos.length > 0) {
      photos.forEach((photoUrl, index) => {
        console.log(`ParticleCanvas - Loading photo ${index + 1}/${photos.length} from:`, photoUrl);
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable CORS
        img.onload = () => {
          console.log(`ParticleCanvas - Photo ${index + 1} loaded successfully`);
          photoImagesRef.current.set(photoUrl, img);
        };
        img.onerror = (e) => {
          console.error(`ParticleCanvas - Failed to load photo ${index + 1}:`, e);
          console.error('ParticleCanvas - Photo URL that failed:', photoUrl);
        };
        img.src = photoUrl;
      });
    } else {
      console.log('ParticleCanvas - No photos provided');
    }
  }, [photos]);

  // Initialize System
  useEffect(() => {
    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let type: Particle['type'] = 'LEAF';
      let color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
      let secondaryColor = undefined;
      let size = randomRange(4, 7); 
      const rand = Math.random();

      // Distribution Logic
      if (i < STAR_COUNT) {
        // The Single Star
        type = 'STAR';
        color = '#ffffff'; // Base color
        size = 40; // Reduced from 60
      } else if (rand < 0.75) {
        type = 'LEAF';
        size = randomRange(5, 8); 
      } else if (rand < 0.83) {
        type = 'GIFT';
        color = GIFT_COLORS[Math.floor(Math.random() * GIFT_COLORS.length)];
        secondaryColor = RIBBON_COLORS[Math.floor(Math.random() * RIBBON_COLORS.length)];
        size = randomRange(7, 11);
      } else if (rand < 0.88) {
        type = 'CANE';
        color = '#ff0000';
        size = randomRange(8, 12);
      } else {
        type = 'RING';
        color = '#ffb300';
        size = randomRange(4, 7);
      }

      const treePos = type === 'STAR' ? generateStarTarget() : generateTreeTarget(i, PARTICLE_COUNT);
      const scatterPos = generateScatterTarget();

      particles.push({
        x: scatterPos.x,
        y: scatterPos.y,
        z: scatterPos.z,
        vx: 0, vy: 0, vz: 0,
        tx: scatterPos.x, ty: scatterPos.y, tz: scatterPos.z,
        treeX: treePos.x, treeY: treePos.y, treeZ: treePos.z,
        scatterX: scatterPos.x, scatterY: scatterPos.y, scatterZ: scatterPos.z,
        color,
        secondaryColor,
        size,
        // Star is static (0), others random
        rotation: type === 'STAR' ? 0 : randomRange(0, Math.PI * 2),
        // Star does not spin, others do
        rotationSpeed: type === 'STAR' ? 0 : randomRange(-0.05, 0.05),
        type
      });
    }

    // Add photo particles if photos exist
    if (photos && photos.length > 0) {
      console.log(`ParticleCanvas - Creating ${photos.length} PHOTO particles`);

      // Define photo positions on tree (distributed from upper to bottom)
      // Tree shape: narrow at top, wide at bottom
      const photoPositions = [
        { x: 0, y: 150, z: 150 },       // 1: Upper center
        { x: -70, y: 40, z: 150 },      // 2: Left middle
        { x: 70, y: 40, z: 150 },       // 3: Right middle
        { x: -110, y: -80, z: 150 },    // 4: Left bottom (wider)
        { x: 110, y: -80, z: 150 },     // 5: Right bottom (wider)
      ];

      photos.forEach((photoUrl, index) => {
        const position = photoPositions[index % photoPositions.length];
        const photoScatterPos = generateScatterTarget();

        particles.push({
          x: photoScatterPos.x,
          y: photoScatterPos.y,
          z: photoScatterPos.z,
          vx: 0, vy: 0, vz: 0,
          tx: photoScatterPos.x, ty: photoScatterPos.y, tz: photoScatterPos.z,
          treeX: position.x, treeY: position.y, treeZ: position.z,
          scatterX: photoScatterPos.x, scatterY: photoScatterPos.y, scatterZ: photoScatterPos.z,
          color: '#ffffff',
          size: 32, // Smaller in tree mode, still visible when scattered
          rotation: 0,
          rotationSpeed: 0.02,
          type: 'PHOTO',
          photoData: photoUrl
        });
      });

      console.log('ParticleCanvas - PHOTO particles created, total particles:', particles.length);
    } else {
      console.log('ParticleCanvas - No photos, skipping PHOTO particle creation');
    }

    particlesRef.current = particles;
    console.log('ParticleCanvas - Particles initialized, count:', particles.length);
  }, [photos]);

  // Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Perspective Constants
    const FOV = 500;
    const VIEWER_DIST = 800;

    const animate = () => {
      timeRef.current += 0.015; // Slower time for smoother waves
      rotationRef.current += 0.003; 

      // Manually clear
      ctx.fillStyle = '#020205'; 
      ctx.fillRect(0, 0, width, height);

      const cosR = Math.cos(rotationRef.current);
      const sinR = Math.sin(rotationRef.current);
      
      const isTree = gesture === GestureState.TREE;
      const isScatter = gesture === GestureState.SCATTER;

      // Physics Parameters
      // SCATTER: Very low stiffness (loose spring) + High friction (viscous) = Smooth Drift
      // TREE: Higher stiffness (snap to shape) + Moderate friction = Structure
      const stiffness = isTree ? 0.06 : 0.005;
      const friction = isTree ? 0.60 : 0.92; 

      const particles = particlesRef.current;
      const len = particles.length;

      // --- PHASE 1: PHYSICS UPDATE ---
      for (let i = 0; i < len; i++) {
        const p = particles[i];

        let tx, ty, tz;

        if (isTree) {
          // If it's the star, we don't rotate its position relative to the tree center
          tx = p.treeX * cosR - p.treeZ * sinR;
          tz = p.treeX * sinR + p.treeZ * cosR;
          ty = p.treeY;
        } else {
          // Rotate scatter targets as well to create the "revolving" effect
          tx = p.scatterX * cosR - p.scatterZ * sinR;
          tz = p.scatterX * sinR + p.scatterZ * cosR;
          ty = p.scatterY;
        }

        const dx = tx - p.x;
        const dy = ty - p.y;
        const dz = tz - p.z;

        p.vx += dx * stiffness;
        p.vy += dy * stiffness;
        p.vz += dz * stiffness;

        if (isScatter) {
           // Smooth Brownian Drift
           // Reduced frequency (0.1/0.15) and amplitude (0.05) to stop "jitter/bounce"
           const t = timeRef.current;
           const noise = 0.08; 
           p.vx += Math.sin(t * 0.2 + i * 0.1) * noise;
           p.vy += Math.cos(t * 0.15 + i * 0.1) * noise;
           p.vz += Math.sin(t * 0.1 + i * 0.1) * noise;
        }

        p.vx *= friction;
        p.vy *= friction;
        p.vz *= friction;

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        
        p.rotation += p.rotationSpeed;
      }

      // --- PHASE 2: SORT BY DEPTH (Z) ---
      // Sort by z-depth, but always render PHOTO particles last (on top)
      particles.sort((a, b) => {
        // PHOTO particles always render last (on top)
        if (a.type === 'PHOTO' && b.type !== 'PHOTO') return 1;
        if (b.type === 'PHOTO' && a.type !== 'PHOTO') return -1;
        // Otherwise sort by z-depth
        return b.z - a.z;
      });

      // --- PHASE 3: RENDER ---
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        
        const scale = FOV / (VIEWER_DIST + p.z);
        
        if (scale > 0) {
          const x2d = (p.x * scale) + width / 2;
          const y2d = (-p.y * scale) + height / 2;
          const s = p.size * scale; 

          if (x2d > -100 && x2d < width + 100 && y2d > -100 && y2d < height + 100) {
            ctx.save();
            ctx.translate(x2d, y2d);
            
            // Only rotate if not the Star (Star stays upright)
            if (p.type !== 'STAR') {
              ctx.rotate(p.rotation);
            }

            if (p.type === 'GIFT') {
              ctx.fillStyle = p.color;
              ctx.fillRect(-s, -s, s * 2, s * 2);
              if (p.secondaryColor) {
                ctx.fillStyle = p.secondaryColor;
                const ribbonWidth = s * 0.4;
                ctx.fillRect(-ribbonWidth/2, -s, ribbonWidth, s*2); 
                ctx.fillRect(-s, -ribbonWidth/2, s*2, ribbonWidth); 
              }
            
            } else if (p.type === 'CANE') {
               ctx.strokeStyle = p.color;
               ctx.lineWidth = s * 0.6;
               ctx.lineCap = 'round';
               ctx.beginPath();
               ctx.arc(0, -s * 0.5, s * 0.5, Math.PI, 0); 
               ctx.lineTo(s * 0.5, s * 1.5);
               ctx.stroke();
               
            } else if (p.type === 'RING') {
               ctx.strokeStyle = p.color;
               ctx.lineWidth = s * 0.4;
               ctx.beginPath();
               ctx.arc(0, 0, s, 0, Math.PI * 2);
               ctx.stroke();

            } else if (p.type === 'LEAF') {
               ctx.fillStyle = p.color;
               ctx.beginPath();
               ctx.moveTo(0, -s);
               ctx.lineTo(s, s);
               ctx.lineTo(-s, s);
               ctx.fill();

            } else if (p.type === 'STAR') {
               // --- MAGICAL GLOWING STAR ---
               
               // 1. Halo Glow
               ctx.shadowBlur = 60 * scale;
               ctx.shadowColor = 'rgba(255, 223, 100, 0.8)'; // Golden Glow
               ctx.fillStyle = 'rgba(255, 255, 255, 0)'; 
               ctx.beginPath();
               ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
               ctx.fill();
               ctx.shadowBlur = 0; // Reset for shape

               // 2. Main Star Shape (Soft Gradient)
               const gradient = ctx.createRadialGradient(0, 0, s * 0.1, 0, 0, s);
               gradient.addColorStop(0, '#FFFFFF'); // Bright center
               gradient.addColorStop(0.4, '#FFEB3B'); // Yellow mid
               gradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)'); // Transparent edge

               ctx.fillStyle = gradient;
               
               const spikes = 5;
               const outerRadius = s;
               const innerRadius = s * 0.4;
               
               ctx.beginPath();
               for (let k = 0; k < spikes * 2; k++) {
                  const r = k % 2 === 0 ? outerRadius : innerRadius;
                  const angle = (Math.PI / spikes) * k - Math.PI / 2;
                  const x = Math.cos(angle) * r;
                  const y = Math.sin(angle) * r;
                  if (k === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
               }
               ctx.closePath();
               ctx.fill();

               // Removed Cross Lines

            } else if (p.type === 'PHOTO' && p.photoData) {
               // --- PHOTO ORNAMENT ---
               const photoImage = photoImagesRef.current.get(p.photoData);
               if (photoImage) {
                 // Draw white border/frame
                 ctx.fillStyle = '#ffffff';
                 ctx.shadowBlur = 15 * scale;
                 ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
                 ctx.fillRect(-s * 1.15, -s * 1.15, s * 2.3, s * 2.3);
                 ctx.shadowBlur = 0;

                 // Draw photo
                 ctx.save();
                 // Clip to photo area
                 ctx.beginPath();
                 ctx.rect(-s, -s, s * 2, s * 2);
                 ctx.clip();
                 ctx.drawImage(photoImage, -s, -s, s * 2, s * 2);
                 ctx.restore();
               }
            }

            ctx.restore();
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [gesture]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

export default ParticleCanvas;