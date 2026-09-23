import { DesignDocument, CanvasSettings, BeadColor } from '../types/bead';
import { getColorName } from './colorUtils';

/**
 * Downloads a text file (JSON, CSV, SVG) in the browser
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports design as JSON specification
 */
export function exportToJson(design: DesignDocument): string {
  const exportPayload = {
    app: 'Siroma Beadworks Studio',
    app_version: design.metadata.appVersion || '0.1.0',
    title: design.metadata.title,
    author: design.metadata.author,
    description: design.metadata.description,
    materials_notes: design.metadata.materialsNotes,
    created_at: design.metadata.createdAt,
    updated_at: new Date().toISOString(),
    canvas_dimensions: {
      columns: design.settings.columns,
      rows: design.settings.rows,
      total_beads: design.settings.columns * design.settings.rows,
      bead_shape: design.settings.beadShape,
      aspect_ratio: design.settings.aspectRatio,
      spacing: design.settings.cellSpacing,
      dot_size: design.settings.dotSize,
      physical_width_cm: design.settings.physicalWidthCm || 5.7,
      physical_height_cm: design.settings.physicalHeightCm || 11.1,
      physical_scale_mm_per_bead: design.settings.millimetresPerBead || 1.5833,
      physical_scale_mm_per_row: design.settings.millimetresPerRow || 2.2653,
      estimated_width_mm: (design.settings.physicalWidthCm ? design.settings.physicalWidthCm * 10 : design.settings.columns * (design.settings.millimetresPerBead || 1.5833)).toFixed(1),
      estimated_height_mm: (design.settings.physicalHeightCm ? design.settings.physicalHeightCm * 10 : design.settings.rows * (design.settings.millimetresPerRow || 2.2653)).toFixed(1),
      edge_border: design.settings.edgeBorder,
    },
    palette: design.palette.map((p) => ({
      hex: p.hex,
      name: p.name,
      symbol: p.symbol,
    })),
    cell_encoding: 'row-major-colour-index',
    cell_colours: design.cells,
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Exports CSV colour grid
 */
export function exportToCsv(design: DesignDocument): string {
  const { columns, rows, physicalWidthCm, physicalHeightCm, millimetresPerBead, millimetresPerRow } = design.settings;
  const lines: string[] = [];
  const widthMm = (physicalWidthCm ? physicalWidthCm * 10 : columns * (millimetresPerBead || 1.5833)).toFixed(1);
  const heightMm = (physicalHeightCm ? physicalHeightCm * 10 : rows * (millimetresPerRow || 2.2653)).toFixed(1);

  // Metadata headers
  lines.push(`# Beaded Canvas CSV Grid Export`);
  lines.push(`# Title: "${design.metadata.title.replace(/"/g, '""')}"`);
  lines.push(`# Author: "${design.metadata.author.replace(/"/g, '""')}"`);
  lines.push(`# Dimensions: ${columns} cols x ${rows} rows`);
  lines.push(`# Physical Size: ${widthMm}mm x ${heightMm}mm (${(parseFloat(widthMm)/10).toFixed(1)}cm x ${(parseFloat(heightMm)/10).toFixed(1)}cm)`);
  lines.push('');

  // Column headers (Col 1, Col 2, ...)
  const colHeader = ['Row / Col', ...Array.from({ length: columns }, (_, i) => `Col ${i + 1}`)].join(',');
  lines.push(colHeader);

  const isBottomUp = design.settings.rowNumberingDirection !== 'top-to-bottom';

  // Rows
  for (let r = 0; r < rows; r++) {
    // When bottom-to-top, the bottom row (r = rows - 1) is Row 1
    const rowLabel = isBottomUp ? rows - r : r + 1;
    const rowValues = [`Row ${rowLabel}`];
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c;
      const val = design.cells[idx];
      rowValues.push(val ? val.toUpperCase() : 'EMPTY');
    }
    lines.push(rowValues.join(','));
  }

  return lines.join('\n');
}

/**
 * Exports high precision SVG
 */
export function exportToSvg(design: DesignDocument): string {
  const { columns, rows, cellSpacing, dotSize, beadShape, aspectRatio, physicalWidthCm, physicalHeightCm, millimetresPerBead, millimetresPerRow } = design.settings;

  const mmPerCol = physicalWidthCm && columns ? (physicalWidthCm * 10) / columns : (millimetresPerBead || 1.5833);
  const mmPerRow = physicalHeightCm && rows ? (physicalHeightCm * 10) / rows : (millimetresPerRow || 2.2653);
  const ratio = aspectRatio === 'square' ? 1.0 : (mmPerRow / mmPerCol);

  const cellSpacingX = cellSpacing;
  const cellSpacingY = cellSpacing * ratio;

  const pad = 40;
  const width = columns * cellSpacingX + pad * 2;
  const height = rows * cellSpacingY + pad * 2;

  let svgElements = '';

  // Background
  svgElements += `<rect width="${width}" height="${height}" fill="#f4eee4" rx="8" />\n`;

  // Grid border frame
  const gridW = columns * cellSpacingX;
  const gridH = rows * cellSpacingY;
  svgElements += `<rect x="${pad}" y="${pad}" width="${gridW}" height="${gridH}" fill="none" stroke="#ded5c9" stroke-width="1.5" />\n`;

  // Bead defs for 3D gradient
  svgElements += `
  <defs>
    <radialGradient id="beadShine" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  `;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c;
      const color = design.cells[idx];
      const cx = pad + c * cellSpacingX + cellSpacingX / 2;
      const cy = pad + r * cellSpacingY + cellSpacingY / 2;
      const radius = dotSize / 2;

      if (color) {
        if (beadShape === 'circle') {
          const rx = (radius * 0.94).toFixed(2);
          const ry = (radius * ratio * 0.94).toFixed(2);
          const holeRx = Math.max(0.75, radius * 0.2).toFixed(2);
          const holeRy = Math.max(0.9, radius * ratio * 0.22).toFixed(2);
          svgElements += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" stroke="#171412" stroke-width="0.5" />\n`;
          svgElements += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#beadShine)" />\n`;
          // Subtle bead hole along vertical warp path
          svgElements += `  <ellipse cx="${cx}" cy="${cy}" rx="${holeRx}" ry="${holeRy}" fill="#171412" fill-opacity="0.5" />\n`;
        } else if (beadShape === 'delica_cylinder') {
          const w = dotSize * 0.9;
          const h = dotSize * ratio * 0.72;
          svgElements += `  <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${radius * 0.25}" fill="${color}" stroke="#171412" stroke-width="0.5" />\n`;
        } else {
          svgElements += `  <rect x="${cx - radius}" y="${cy - radius}" width="${dotSize}" height="${dotSize}" rx="2" fill="${color}" />\n`;
        }
      } else {
        // Empty guide dot
        svgElements += `  <circle cx="${cx}" cy="${cy}" r="1.5" fill="#c8bfb2" opacity="0.75" />\n`;
      }
    }
  }

  // Footer metadata
  svgElements += `  <text x="${pad}" y="${height - 14}" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#71675f">${escapeXml(
    design.metadata.title
  )} · ${columns}×${rows} beads · ${design.metadata.author || 'Artisan'}</text>\n`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${svgElements}
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

/**
 * Builds an artisan row-by-row word chart (used by physical loom/peyote beaders)
 */
export interface RowInstructionItem {
  count: number;
  hex: string;
  name: string;
  symbol: string;
}

export interface RowInstruction {
  rowNumber: number;
  direction: 'L → R' | 'R ← L';
  items: RowInstructionItem[];
}

export function generateArtisanWordChart(design: DesignDocument): RowInstruction[] {
  const { columns, rows } = design.settings;
  const paletteMap = new Map<string, BeadColor>();
  design.palette.forEach((p) => paletteMap.set(p.hex.toLowerCase(), p));

  const instructions: RowInstruction[] = [];
  const isBottomUp = design.settings.rowNumberingDirection !== 'top-to-bottom';

  // For loom weaving, artisans start at Row 1 (the bottom of the loom) and work upwards.
  // When isBottomUp is true, Row 1 corresponds to visual grid row (rows - 1) and progresses to row 0.
  // When false, Row 1 is row 0 progressing down to (rows - 1).
  for (let stepIdx = 0; stepIdx < rows; stepIdx++) {
    const r = isBottomUp ? rows - 1 - stepIdx : stepIdx;
    const rowNumber = stepIdx + 1;

    // Loom work alternates directions: Row 1 L -> R, Row 2 R <- L, etc.
    const direction: 'L → R' | 'R ← L' = stepIdx % 2 === 0 ? 'L → R' : 'R ← L';
    const items: RowInstructionItem[] = [];

    let currentHex: string | null = null;
    let currentCount = 0;

    const startCol = direction === 'L → R' ? 0 : columns - 1;
    const endCol = direction === 'L → R' ? columns : -1;
    const step = direction === 'L → R' ? 1 : -1;

    for (let c = startCol; c !== endCol; c += step) {
      const idx = r * columns + c;
      const cellHex = design.cells[idx] ? design.cells[idx]!.toLowerCase() : 'EMPTY';

      if (cellHex === currentHex) {
        currentCount++;
      } else {
        if (currentHex !== null && currentCount > 0) {
          const colorMeta = paletteMap.get(currentHex);
          items.push({
            count: currentCount,
            hex: currentHex === 'EMPTY' ? '#ded5c9' : currentHex,
            name: currentHex === 'EMPTY' ? 'Empty Space' : colorMeta?.name || getColorName(currentHex),
            symbol: colorMeta?.symbol || '●',
          });
        }
        currentHex = cellHex;
        currentCount = 1;
      }
    }

    if (currentHex !== null && currentCount > 0) {
      const colorMeta = paletteMap.get(currentHex);
      items.push({
        count: currentCount,
        hex: currentHex === 'EMPTY' ? '#ded5c9' : currentHex,
        name: currentHex === 'EMPTY' ? 'Empty Space' : colorMeta?.name || getColorName(currentHex),
        symbol: colorMeta?.symbol || '●',
      });
    }

    instructions.push({
      rowNumber,
      direction,
      items,
    });
  }

  return instructions;
}
