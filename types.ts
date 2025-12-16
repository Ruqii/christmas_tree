export enum GestureState {
  IDLE = 'IDLE',      // No hand or ambiguous
  TREE = 'TREE',      // Closed Fist
  SCATTER = 'SCATTER', // Open Hand
  POINTING = 'POINTING' // Index finger only
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  // Current Target (based on active mode)
  tx: number;
  ty: number;
  tz: number;
  // Pre-calculated targets for each mode
  treeX: number;
  treeY: number;
  treeZ: number;
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  
  // New Visual Types
  type: 'LEAF' | 'GIFT' | 'CANE' | 'RING' | 'STAR' | 'PHOTO';

  // Specific visual props
  secondaryColor?: string; // For ribbons on gifts
  photoData?: string; // Base64 image data for PHOTO type
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}