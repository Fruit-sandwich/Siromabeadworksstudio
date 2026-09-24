import { DesignDocument, BeadColor, CanvasSettings } from '../types/bead';
import { DEFAULT_SETTINGS } from '../data/presetDesigns';
import { PALETTE_PRESETS, buildPaletteColors, getColorName } from './colorUtils';

/**
 * Robust JSON parser and converter for Beaded Canvas designs.
 * Supports:
 * 1. Native Siroma Beadworks Studio export JSON schema
 * 2. Legacy / alternate schema formats (e.g., settings.columns, matrix 2D arrays, hex string arrays)
 * 3. Raw color grid arrays (2D arrays of strings [[hex, ...], ...])
 * 4. Generic bead pattern JSON definitions
 */
export function parseAndNormalizeDesignJson(
  rawJson: string,
  fallbackTitle: string = 'Imported Design'
): DesignDocument {
  const parsed = JSON.parse(rawJson);

  // 1. Detect canvas dimensions
  let cols = 36;
  let rows = 49;

  if (parsed.canvas_dimensions) {
    if (typeof parsed.canvas_dimensions.columns === 'number') cols = parsed.canvas_dimensions.columns;
    if (typeof parsed.canvas_dimensions.rows === 'number') rows = parsed.canvas_dimensions.rows;
  } else if (parsed.settings) {
    if (typeof parsed.settings.columns === 'number') cols = parsed.settings.columns;
    if (typeof parsed.settings.rows === 'number') rows = parsed.settings.rows;
  } else if (parsed.dimensions) {
    if (typeof parsed.dimensions.columns === 'number') cols = parsed.dimensions.columns;
    else if (typeof parsed.dimensions.width === 'number') cols = parsed.dimensions.width;
    if (typeof parsed.dimensions.rows === 'number') rows = parsed.dimensions.rows;
    else if (typeof parsed.dimensions.height === 'number') rows = parsed.dimensions.height;
  }

  // 2. Detect cell data
  let rawCells: (string | null)[] = [];

  // Case A: 2D array matrix [[c1, c2], [c3, c4]]
  if (Array.isArray(parsed.grid) && Array.isArray(parsed.grid[0])) {
    rows = parsed.grid.length;
    cols = parsed.grid[0].length;
    rawCells = parsed.grid.flat().map(normalizeColorValue);
  } else if (Array.isArray(parsed.matrix) && Array.isArray(parsed.matrix[0])) {
    rows = parsed.matrix.length;
    cols = parsed.matrix[0].length;
    rawCells = parsed.matrix.flat().map(normalizeColorValue);
  } else if (Array.isArray(parsed.cells) && Array.isArray(parsed.cells[0])) {
    rows = parsed.cells.length;
    cols = parsed.cells[0].length;
    rawCells = parsed.cells.flat().map(normalizeColorValue);
  }
  // Case B: 1D flat array (cell_colours or cells)
  else if (Array.isArray(parsed.cell_colours)) {
    rawCells = parsed.cell_colours.map(normalizeColorValue);
  } else if (Array.isArray(parsed.cells)) {
    rawCells = parsed.cells.map(normalizeColorValue);
  } else if (Array.isArray(parsed.pattern)) {
    rawCells = parsed.pattern.map(normalizeColorValue);
  }

  // If length doesn't match cols * rows, adjust or infer
  const total = cols * rows;
  if (rawCells.length > 0 && rawCells.length !== total) {
    if (rawCells.length < total) {
      // pad with null
      const padded = [...rawCells];
      while (padded.length < total) {
        padded.push(null);
      }
      rawCells = padded;
    } else {
      // slice or infer rows
      if (cols > 0 && rawCells.length % cols === 0) {
        rows = rawCells.length / cols;
      } else {
        rawCells = rawCells.slice(0, total);
      }
    }
  } else if (rawCells.length === 0) {
    rawCells = new Array(cols * rows).fill(null);
  }

  // 3. Extract or infer palette
  const uniqueHexes = new Set<string>();
  rawCells.forEach((c) => {
    if (c) uniqueHexes.add(c.toLowerCase());
  });

  let palette: BeadColor[] = [];

  if (Array.isArray(parsed.palette) && parsed.palette.length > 0) {
    if (typeof parsed.palette[0] === 'string') {
      palette = buildPaletteColors(parsed.palette);
    } else {
      palette = parsed.palette.map((p: { hex?: string; name?: string; symbol?: string }, idx: number) => ({
        hex: p.hex || '#111111',
        name: p.name || getColorName(p.hex || '#111111'),
        symbol: p.symbol || String.fromCharCode(65 + (idx % 26)),
      }));
    }
  }

  // Add any colors present in the grid that weren't in the declared palette
  uniqueHexes.forEach((hex) => {
    if (!palette.some((p) => p.hex.toLowerCase() === hex)) {
      palette.push({
        hex,
        name: getColorName(hex),
        symbol: String.fromCharCode(65 + (palette.length % 26)),
      });
    }
  });

  if (palette.length === 0) {
    palette = buildPaletteColors(PALETTE_PRESETS.warm_earth.colors);
  }

  // 4. Extract settings
  const canvasDims = parsed.canvas_dimensions || {};
  const parsedSettings = parsed.settings || {};

  const settings: CanvasSettings = {
    ...DEFAULT_SETTINGS,
    columns: cols,
    rows: rows,
    dotSize: parsedSettings.dotSize || canvasDims.dot_size || DEFAULT_SETTINGS.dotSize,
    cellSpacing: parsedSettings.cellSpacing || canvasDims.spacing || DEFAULT_SETTINGS.cellSpacing,
    beadShape: parsedSettings.beadShape || canvasDims.bead_shape || DEFAULT_SETTINGS.beadShape,
    beadFinish: parsedSettings.beadFinish || DEFAULT_SETTINGS.beadFinish,
    aspectRatio: parsedSettings.aspectRatio || canvasDims.aspect_ratio || DEFAULT_SETTINGS.aspectRatio,
    showGrid: parsedSettings.showGrid ?? DEFAULT_SETTINGS.showGrid,
    showEmptyDots: parsedSettings.showEmptyDots ?? DEFAULT_SETTINGS.showEmptyDots,
    showCoordinates: parsedSettings.showCoordinates ?? DEFAULT_SETTINGS.showCoordinates,
    millimetresPerBead:
      parsedSettings.millimetresPerBead ||
      canvasDims.physical_scale_mm_per_bead ||
      DEFAULT_SETTINGS.millimetresPerBead,
    millimetresPerRow:
      parsedSettings.millimetresPerRow ||
      canvasDims.physical_scale_mm_per_row ||
      DEFAULT_SETTINGS.millimetresPerRow,
    physicalWidthCm:
      parsedSettings.physicalWidthCm ||
      canvasDims.physical_width_cm ||
      DEFAULT_SETTINGS.physicalWidthCm,
    physicalHeightCm:
      parsedSettings.physicalHeightCm ||
      canvasDims.physical_height_cm ||
      DEFAULT_SETTINGS.physicalHeightCm,
    beadTypeLabel:
      parsedSettings.beadTypeLabel ||
      DEFAULT_SETTINGS.beadTypeLabel,
    edgeBorder: {
      ...DEFAULT_SETTINGS.edgeBorder,
      ...(parsedSettings.edgeBorder || canvasDims.edge_border || {}),
    },
  };

  const title =
    parsed.metadata?.title ||
    parsed.title ||
    fallbackTitle.replace(/\.json$/i, '');

  const author = parsed.metadata?.author || parsed.author || 'Artisan';
  const description =
    parsed.metadata?.description ||
    parsed.description ||
    `Imported pattern (${cols}×${rows} beads)`;

  const materialsNotes =
    parsed.metadata?.materialsNotes ||
    parsed.materials_notes ||
    '';

  const doc: DesignDocument = {
    id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    schemaVersion: '0.1.0',
    metadata: {
      title,
      author,
      description,
      materialsNotes,
      createdAt: parsed.metadata?.createdAt || parsed.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appVersion: parsed.metadata?.appVersion || parsed.app_version || '0.1.0',
    },
    settings,
    palette,
    cells: rawCells,
  };

  return doc;
}

function normalizeColorValue(val: unknown): string | null {
  if (!val || val === '' || val === 'transparent' || val === 'none' || val === null) {
    return null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) {
      return trimmed;
    }
    // Hex without hash
    if (/^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
      return `#${trimmed}`;
    }
    return trimmed;
  }
  return null;
}
