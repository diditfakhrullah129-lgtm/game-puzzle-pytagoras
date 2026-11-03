export type Screen = 'menu' | 'level-select' | 'game' | 'learn';

export interface Point {
  x: number;
  y: number;
}

export interface PuzzlePiece {
  id: string;
  name: string;
  type: 'right_triangle' | 'square' | 'rectangle' | 'isosceles_triangle' | 'trapezoid' | 'parallelogram';
  color: string;
  borderColor: string;
  // Base polygon points centered at origin (0,0)
  vertices: Point[];
  // Current placement state
  x: number;
  y: number;
  rotation: number; // in degrees: 0, 90, 180, 270 (or 45 increments)
  initialX: number;
  initialY: number;
  // Mathematical properties
  area: number;
  dimensionsText: string;
  formulaText: string;
  // Target placement (for solution & snapping)
  targetX: number;
  targetY: number;
  targetRotation: number;
}

export interface TargetZone {
  name: string;
  vertices: Point[];
  targetArea: number;
  formula: string;
  description: string;
}

export interface LevelStage {
  id: string;
  title: string;
  subtitle: string;
  targetName: string;
  targetVertices: Point[];
  targetArea: number;
  formula: string;
  pieces: PuzzlePiece[];
  hint: string;
  explanation: string;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  concept: string;
  description: string;
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan' | 'Ahli' | 'Master';
  pythagoreanTriple: [number, number, number]; // a, b, c
  targetZone: TargetZone;
  pieces: PuzzlePiece[];
  hint: string;
  mathExplanation: string;
  stages?: LevelStage[];
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0 - 3
  bestTime: number; // seconds
}

export interface GameSettings {
  soundEnabled: boolean;
  showMathGrid: boolean;
  snapTolerance: number; // in pixels (e.g. 24)
}
