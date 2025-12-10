import { Point3D } from '../types';

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate points for a VOLUMETRIC cone (Solid Christmas tree)
export const generateTreeTarget = (index: number, totalParticles: number): Point3D => {
  // Y goes from -225 to 225
  // In our projection: Positive Y is UP, Negative Y is DOWN.
  const height = 450;
  const maxBaseRadius = 220;
  
  // 1. Height Distribution
  // To get uniform volumetric density, we want more points at the bottom (where volume is larger).
  let h = Math.random(); 
  h = 1 - Math.pow(h, 2); // Bias towards 1 (bottom) slightly to fill the base

  // Map h (0 to 1) to World Y (+225 to -225)
  // 0 -> Top (+225)
  // 1 -> Bottom (-225)
  const y = (height / 2) - (h * height);

  // 2. Calculate radius at this height
  const coneRadiusAtH = maxBaseRadius * h;

  // 3. Random placement INSIDE the circle at this height (Volumetric)
  const r = coneRadiusAtH * Math.sqrt(Math.random());
  const angle = Math.random() * Math.PI * 2;

  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);

  return { x, y, z };
};

// Generate points for the Star at the top
export const generateStarTarget = (): Point3D => {
  // Single point at the very tip
  return {
    x: 0,
    y: 240, // Slightly above the tree top (225)
    z: 0
  };
};

// Generate points for scattering (Uniform Box Distribution)
export const generateScatterTarget = (): Point3D => {
  const spreadX = 900;
  const spreadY = 600;
  const spreadZ = 800;

  return {
    x: randomRange(-spreadX, spreadX),
    y: randomRange(-spreadY, spreadY),
    z: randomRange(-spreadZ/2, spreadZ) 
  };
};