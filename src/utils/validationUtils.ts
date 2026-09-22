import { DesignDocument, PatternValidationResult } from '../types/bead';

export function validatePattern(design: DesignDocument): PatternValidationResult {
  const { columns, rows } = design.settings;
  const totalCells = columns * rows;
  const paletteHexes = new Set(design.palette.map((p) => p.hex.toLowerCase()));

  const colorCountsMap = new Map<string, number>();
  let emptyCount = 0;
  let beadCount = 0;
  const unsupportedSet = new Set<string>();

  let touchesTop = false;
  let touchesBottom = false;
  let touchesLeft = false;
  let touchesRight = false;

  let isSymmetricalHorizontal = true;
  let isSymmetricalVertical = true;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols(c); c++) {
      // Loop
    }
  }

  function cols(c: number) {
    return columns;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c;
      const val = design.cells[idx];

      if (!val) {
        emptyCount++;
      } else {
        beadCount++;
        const hex = val.toLowerCase();
        colorCountsMap.set(hex, (colorCountsMap.get(hex) || 0) + 1);

        if (!paletteHexes.has(hex)) {
          unsupportedSet.add(hex);
        }

        if (r === 0) touchesTop = true;
        if (r === rows - 1) touchesBottom = true;
        if (c === 0) touchesLeft = true;
        if (c === columns - 1) touchesRight = true;
      }

      // Check horizontal symmetry (left-right reflection)
      const mirrorC = columns - 1 - c;
      const mirrorVal = design.cells[r * columns + mirrorC];
      if (val !== mirrorVal) {
        isSymmetricalHorizontal = false;
      }

      // Check vertical symmetry (top-bottom reflection)
      const mirrorR = rows - 1 - r;
      const vertMirrorVal = design.cells[mirrorR * columns + c];
      if (val !== vertMirrorVal) {
        isSymmetricalVertical = false;
      }
    }
  }

  const warnings: string[] = [];

  if (beadCount === 0) {
    warnings.push('Canvas is empty. Place beads to begin pattern validation.');
  }

  if (unsupportedSet.size > 0) {
    warnings.push(
      `Pattern contains ${unsupportedSet.size} color(s) not currently saved in your active palette.`
    );
  }

  if (emptyCount > 0 && beadCount > 0) {
    warnings.push(
      `${emptyCount} empty cells remain on the canvas (${((emptyCount / totalCells) * 100).toFixed(1)}% of grid).`
    );
  }

  if (beadCount > 0 && (!touchesLeft || !touchesRight || !touchesTop || !touchesBottom)) {
    const borders: string[] = [];
    if (!touchesTop) borders.push('top');
    if (!touchesBottom) borders.push('bottom');
    if (!touchesLeft) borders.push('left');
    if (!touchesRight) borders.push('right');
    warnings.push(`Pattern does not touch the ${borders.join(', ')} border(s).`);
  }

  const colorCounts = Array.from(colorCountsMap.entries())
    .map(([hex, count]) => {
      const paletteItem = design.palette.find((p) => p.hex.toLowerCase() === hex);
      return {
        hex,
        name: paletteItem?.name || hex.toUpperCase(),
        count,
        percentage: beadCount > 0 ? (count / beadCount) * 100 : 0,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalCells,
    beadCount,
    emptyCount,
    uniqueColorsUsed: colorCounts.length,
    colorCounts,
    unsupportedColors: Array.from(unsupportedSet),
    edgeAlignment: {
      touchesTop,
      touchesBottom,
      touchesLeft,
      touchesRight,
      isSymmetricalHorizontal,
      isSymmetricalVertical,
    },
    isComplete: beadCount > 0 && unsupportedSet.size === 0 && emptyCount === 0,
    warnings,
  };
}
