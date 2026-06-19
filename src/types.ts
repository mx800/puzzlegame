export interface PuzzleConfig {
  id?: string;
  title: string;
  author: string;
  gridSize: number; // e.g., 2, 3, 4, 5
  imageData: string; // Base64 data or preset image URL
  createdAt: number;
  fogIntensity?: "off" | "sensual" | "blinding";
  veilMode?: "off" | "progress" | "hardcore";
}

export interface PuzzlePiece {
  id: string;
  correctCol: number;
  correctRow: number;
  correctIdx: number;
  currentCol: number;
  currentRow: number;
  currentIdx: number;
  rotation: number; // 0, 90, 180, or 270 degrees
}
