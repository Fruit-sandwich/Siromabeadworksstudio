/**
 * Core type definitions for Beaded Canvas
 */

export type BeadShape = 'circle' | 'delica_cylinder' | 'square';
export type BeadFinish = 'glossy' | 'matte' | 'frosted';
export type ToolMode = 'paint' | 'erase' | 'eyedropper' | 'fill' | 'line' | 'pan';
export type MirrorMode = 'none' | 'horizontal' | 'vertical' | 'both';

export interface BeadColor {
  hex: string;
  name: string;
  symbol?: string; // Single letter or glyph for black-and-white symbol charts
}

export type RowNumberingDirection = 'bottom-to-top' | 'top-to-bottom';

export interface CanvasSettings {
  columns: number; // 4 to 120 (default 36)
  rows: number; // 4 to 160 (default 49)
  cellSpacing: number; // 4 to 32 (default 12)
  dotSize: number; // 2 to 24 (default 8)
  beadShape: BeadShape;
  beadFinish: BeadFinish;
  aspectRatio: 'square';
  orientation: 'portrait' | 'landscape';
  edgeBorder: {
    enabled: boolean;
    thickness: number; // in beads or pixels (0 = off)
    color: string;
  };
  showCoordinates: boolean;
  rowNumberingDirection: RowNumberingDirection; // 'bottom-to-top' (traditional loom) or 'top-to-bottom'
  showGrid: boolean;
  showEmptyDots: boolean;
  millimetresPerBead: number; // default 1.6 (Miyuki Delica 11/0 standard)
  beadTypeLabel: string;
}

export interface ReferenceImage {
  src: string;
  name: string;
  opacity: number; // 0.0 to 1.0
  scale: number; // 0.1 to 3.0
  offsetX: number;
  offsetY: number;
  locked: boolean;
  visible: boolean;
}

export interface DesignMetadata {
  title: string;
  author: string;
  description: string;
  materialsNotes: string;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
}

export interface DesignDocument {
  id: string;
  schemaVersion: '0.1.0';
  metadata: DesignMetadata;
  settings: CanvasSettings;
  palette: BeadColor[];
  // cells: (color hex string or null for empty) indexed row-major [row * cols + col]
  cells: (string | null)[];
}

export interface PatternValidationResult {
  totalCells: number;
  beadCount: number;
  emptyCount: number;
  uniqueColorsUsed: number;
  colorCounts: { hex: string; name: string; count: number; percentage: number }[];
  unsupportedColors: string[];
  edgeAlignment: {
    touchesTop: boolean;
    touchesBottom: boolean;
    touchesLeft: boolean;
    touchesRight: boolean;
    isSymmetricalHorizontal: boolean;
    isSymmetricalVertical: boolean;
  };
  isComplete: boolean;
  warnings: string[];
}

export interface HistoryEntry {
  cells: (string | null)[];
  description?: string;
}
