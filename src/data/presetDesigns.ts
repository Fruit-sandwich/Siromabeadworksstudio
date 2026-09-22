import { DesignDocument, CanvasSettings } from '../types/bead';
import { buildPaletteColors, PALETTE_PRESETS } from '../utils/colorUtils';
import { createJaguarLoomCells, JAGUAR_COLS, JAGUAR_ROWS } from './jaguarPattern';

export const DEFAULT_SETTINGS: CanvasSettings = {
  columns: JAGUAR_COLS,
  rows: JAGUAR_ROWS,
  cellSpacing: 11,
  dotSize: 8,
  beadShape: 'circle',
  beadFinish: 'glossy',
  aspectRatio: 'square',
  orientation: 'portrait',
  edgeBorder: {
    enabled: true,
    thickness: 0,
    color: '#8c3b20',
  },
  showCoordinates: true,
  rowNumberingDirection: 'bottom-to-top',
  showGrid: true,
  showEmptyDots: true,
  millimetresPerBead: 1.6,
  beadTypeLabel: 'Miyuki Delica 11/0 (Cylinder)',
};

/**
 * Helper to generate a Southwestern/Anasazi geometric diamond beadwork pattern
 */
function createDesertBlossomCells(cols: number, rows: number): (string | null)[] {
  const cells: (string | null)[] = new Array(cols * rows).fill(null);
  const midX = (cols - 1) / 2;
  const midY = (rows - 1) / 2;

  // Background subtle canvas color or fill pattern
  const cGold = '#d9b44a';
  const cTangerine = '#f28c28';
  const cTerra = '#8c3b20';
  const cPine = '#226b3a';
  const cBlack = '#111111';
  const cIvory = '#f4eee4';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const dx = Math.abs(c - midX);
      const dy = Math.abs(r - midY);

      // Border chevron accents at top and bottom
      if (r <= 3 || r >= rows - 4) {
        if ((c + r) % 2 === 0) {
          cells[idx] = cBlack;
        } else if (c % 4 === 0) {
          cells[idx] = cGold;
        }
        continue;
      }

      // Outer diamond bounds
      const manhattan = dx * 1.3 + dy;

      if (manhattan <= 2) {
        cells[idx] = cTangerine; // Center seed
      } else if (manhattan <= 5) {
        cells[idx] = cGold;
      } else if (manhattan <= 8) {
        cells[idx] = cTerra;
      } else if (manhattan <= 12) {
        cells[idx] = (c + r) % 2 === 0 ? cIvory : cPine;
      } else if (manhattan <= 16) {
        cells[idx] = cBlack;
      } else if (manhattan <= 20) {
        // Step motif
        if (Math.floor(dx + dy) % 3 === 0) {
          cells[idx] = cTangerine;
        } else {
          cells[idx] = cIvory;
        }
      } else if (manhattan <= 25) {
        if (dx % 3 === 0 || dy % 3 === 0) {
          cells[idx] = cTerra;
        }
      }

      // Side arrowheads
      if ((r % 12 >= 4 && r % 12 <= 8) && (c < 5 || c >= cols - 5)) {
        cells[idx] = (c + r) % 2 === 0 ? cGold : cBlack;
      }
    }
  }

  return cells;
}

/**
 * Helper to generate a Classic Lapis & Sunburst loom pattern
 */
function createClassicLoomCells(cols: number, rows: number): (string | null)[] {
  const cells: (string | null)[] = new Array(cols * rows).fill(null);
  const midX = (cols - 1) / 2;
  const midY = (rows - 1) / 2;

  const cBlack = '#111111';
  const cIvory = '#f4eee4';
  const cRed = '#d9342b';
  const cBlue = '#1f5aa6';
  const cGold = '#e0a91b';
  const cGreen = '#23834a';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const dx = Math.abs(c - midX);
      const dy = Math.abs(r - midY);

      // Edge stripes
      if (c === 0 || c === cols - 1) {
        cells[idx] = cBlack;
        continue;
      }
      if (c === 1 || c === cols - 2) {
        cells[idx] = cGold;
        continue;
      }

      // Horizontal central medallion and repeating diamond chevrons
      const modY = Math.abs(((r % 16) - 8));
      const chevronDist = Math.abs(dx - modY * 1.5);

      if (chevronDist < 1.2) {
        cells[idx] = cRed;
      } else if (chevronDist < 2.5) {
        cells[idx] = cBlue;
      } else if (chevronDist < 3.8) {
        cells[idx] = cGold;
      } else if (dx < 3 && (dy < 6)) {
        cells[idx] = (r + c) % 2 === 0 ? cGreen : cIvory;
      }
    }
  }

  return cells;
}

export const PRESET_DESIGNS: DesignDocument[] = [
  {
    id: 'preset-siroma-jaguar',
    schemaVersion: '0.1.0',
    metadata: {
      title: 'Jaguar Loom Tapestry',
      author: 'Siroma beadworks',
      description: 'The signature Siroma artisan tapestry featuring a watchful jaguar motif with emerald gaze, black rosettes, and white loom fringe borders.',
      materialsNotes: 'Preciosa Ornela / Miyuki 11/0 seed beads in Amber Orange (#ea6a1a), Jet Black (#111111), Alabaster White (#f4eee4), and Emerald Green (#2a8742). Woven on a traditional bead loom.',
      createdAt: '2026-09-22T16:00:00.000Z',
      updatedAt: '2026-09-22T16:00:00.000Z',
      appVersion: '0.1.0',
    },
    settings: {
      ...DEFAULT_SETTINGS,
      columns: JAGUAR_COLS,
      rows: JAGUAR_ROWS,
    },
    palette: buildPaletteColors(PALETTE_PRESETS.jaguar_loom.colors),
    cells: createJaguarLoomCells(),
  },
  {
    id: 'preset-desert-blossom',
    schemaVersion: '0.1.0',
    metadata: {
      title: 'Desert Sunburst Medallion',
      author: 'Studio Artisan',
      description: 'A stepped diamond medallion inspired by traditional Southwestern loom beadwork using warm earth tones.',
      materialsNotes: 'Miyuki Delica 11/0 cylinder glass beads, FireLine 6lb smoke thread, loom or peyote stitch.',
      createdAt: '2026-09-22T12:00:00.000Z',
      updatedAt: '2026-09-22T12:00:00.000Z',
      appVersion: '0.1.0',
    },
    settings: {
      ...DEFAULT_SETTINGS,
      columns: 36,
      rows: 49,
    },
    palette: buildPaletteColors(PALETTE_PRESETS.warm_earth.colors),
    cells: createDesertBlossomCells(36, 49),
  },
  {
    id: 'preset-classic-loom',
    schemaVersion: '0.1.0',
    metadata: {
      title: 'Cobalt & Scarlet Chevron Belt',
      author: 'Master Weaver',
      description: 'High-contrast geometric chevron tapestry in classic primary beadwork enamels.',
      materialsNotes: 'Toho 11/0 round seed beads, Nymo D bonded nylon thread.',
      createdAt: '2026-09-22T13:00:00.000Z',
      updatedAt: '2026-09-22T13:00:00.000Z',
      appVersion: '0.1.0',
    },
    settings: {
      ...DEFAULT_SETTINGS,
      columns: 36,
      rows: 49,
    },
    palette: buildPaletteColors(PALETTE_PRESETS.classic_beadwork.colors),
    cells: createClassicLoomCells(36, 49),
  },
  {
    id: 'preset-blank',
    schemaVersion: '0.1.0',
    metadata: {
      title: 'Untitled Beadwork Canvas',
      author: 'Independent Maker',
      description: 'Fresh blank bead canvas ready for your custom sketching.',
      materialsNotes: 'Configurable bead count and physical dimensions.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appVersion: '0.1.0',
    },
    settings: {
      ...DEFAULT_SETTINGS,
      columns: 36,
      rows: 49,
    },
    palette: buildPaletteColors(PALETTE_PRESETS.warm_earth.colors),
    cells: new Array(36 * 49).fill(null),
  },
];
