import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ToolMode,
  MirrorMode,
  CanvasSettings,
  ReferenceImage,
} from '../types/bead';
import { getBeadHandCursor, getEraserCursor, getCellsInRadius } from '../utils/cursorUtils';
import { Eraser } from 'lucide-react';

interface CanvasViewportProps {
  cells: (string | null)[];
  settings: CanvasSettings;
  activeColor: string;
  currentTool: ToolMode;
  eraserRadius?: number;
  onChangeEraserRadius?: (radius: number) => void;
  mirrorMode: MirrorMode;
  referenceImage: ReferenceImage | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onApplyCellChange: (changes: { index: number; color: string | null }[]) => void;
  onEyedropColor: (color: string) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  cells,
  settings,
  activeColor,
  currentTool,
  eraserRadius = 1,
  onChangeEraserRadius,
  mirrorMode,
  referenceImage,
  zoom,
  onZoomChange,
  onApplyCellChange,
  onEyedropColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan offsets (in screen pixels)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const isMouseDownRef = useRef(false);
  const isRightClickRef = useRef(false);
  const lastCellRef = useRef<{ col: number; row: number } | null>(null);
  const lineStartCellRef = useRef<{ col: number; row: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);
  const hoverCellRef = useRef<{ col: number; row: number } | null>(null);

  // Physical Loom Aspect Ratio Calibration:
  // For 36*49 beads with physical ratio 5.7/11.1 cm:
  // Width pitch = 5.7cm / 36 = 1.5833 mm
  // Height pitch = 11.1cm / 49 = 2.2653 mm
  // Row/Col pitch ratio = (11.1/49) / (5.7/36) = 1.4307196...
  const { cellSpacingX, cellSpacingY, rowToColRatio } = useMemo(() => {
    if (settings.aspectRatio === 'square') {
      return {
        cellSpacingX: settings.cellSpacing,
        cellSpacingY: settings.cellSpacing,
        rowToColRatio: 1.0,
      };
    }

    const mmPerCol = settings.physicalWidthCm && settings.columns
      ? (settings.physicalWidthCm * 10) / settings.columns
      : (settings.millimetresPerBead || 1.5833);

    const mmPerRow = settings.physicalHeightCm && settings.rows
      ? (settings.physicalHeightCm * 10) / settings.rows
      : (settings.millimetresPerRow || 2.2653);

    const ratio = mmPerRow / mmPerCol;
    return {
      cellSpacingX: settings.cellSpacing,
      cellSpacingY: settings.cellSpacing * ratio,
      rowToColRatio: ratio,
    };
  }, [
    settings.aspectRatio,
    settings.cellSpacing,
    settings.physicalWidthCm,
    settings.physicalHeightCm,
    settings.millimetresPerBead,
    settings.millimetresPerRow,
    settings.columns,
    settings.rows,
  ]);

  // Loaded reference image element
  const [refImageElement, setRefImageElement] = useState<HTMLImageElement | null>(null);

  // Load reference image when src changes
  useEffect(() => {
    if (!referenceImage?.src) {
      setRefImageElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = referenceImage.src;
    img.onload = () => setRefImageElement(img);
  }, [referenceImage?.src]);

  // Center canvas in viewport on initial load
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const canvasWidth = settings.columns * cellSpacingX;
    const canvasHeight = settings.rows * cellSpacingY;

    const initialX = Math.max(20, (container.clientWidth - canvasWidth * zoom) / 2);
    const initialY = Math.max(20, (container.clientHeight - canvasHeight * zoom) / 2);
    setPan({ x: initialX, y: initialY });
  }, [settings.columns, settings.rows, cellSpacingX, cellSpacingY]);

  // Transform screen coordinate to canvas cell (col, row)
  const screenToCell = useCallback(
    (screenX: number, screenY: number): { col: number; row: number } | null => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const localX = screenX - rect.left - pan.x;
      const localY = screenY - rect.top - pan.y;

      const canvasX = localX / zoom;
      const canvasY = localY / zoom;

      const col = Math.floor(canvasX / cellSpacingX);
      const row = Math.floor(canvasY / cellSpacingY);

      if (col >= 0 && col < settings.columns && row >= 0 && row < settings.rows) {
        return { col, row };
      }
      return null;
    },
    [pan.x, pan.y, zoom, cellSpacingX, cellSpacingY, settings.columns, settings.rows]
  );

  // Helper to compute mirrored cell coordinates based on mirrorMode
  const getMirroredCoords = useCallback(
    (col: number, row: number): { col: number; row: number }[] => {
      const coords = [{ col, row }];
      const mirrorCol = settings.columns - 1 - col;
      const mirrorRow = settings.rows - 1 - row;

      if (mirrorMode === 'horizontal' || mirrorMode === 'both') {
        if (mirrorCol !== col) coords.push({ col: mirrorCol, row });
      }
      if (mirrorMode === 'vertical' || mirrorMode === 'both') {
        if (mirrorRow !== row) coords.push({ col, row: mirrorRow });
      }
      if (mirrorMode === 'both') {
        if (mirrorCol !== col && mirrorRow !== row) {
          coords.push({ col: mirrorCol, row: mirrorRow });
        }
      }
      return coords;
    },
    [mirrorMode, settings.columns, settings.rows]
  );

  // Flood fill algorithm
  const floodFill = useCallback(
    (startCol: number, startRow: number, targetColor: string | null) => {
      const startIdx = startRow * settings.columns + startCol;
      const originalColor = cells[startIdx] || null;
      if (originalColor === targetColor) return;

      const visited = new Uint8Array(settings.columns * settings.rows);
      const queue: [number, number][] = [[startCol, startRow]];
      const changes: { index: number; color: string | null }[] = [];

      visited[startIdx] = 1;

      while (queue.length > 0) {
        const [c, r] = queue.pop()!;
        const idx = r * settings.columns + c;
        changes.push({ index: idx, color: targetColor });

        const neighbors: [number, number][] = [
          [c + 1, r],
          [c - 1, r],
          [c, r + 1],
          [c, r - 1],
        ];

        for (const [nc, nr] of neighbors) {
          if (nc >= 0 && nc < settings.columns && nr >= 0 && nr < settings.rows) {
            const nIdx = nr * settings.columns + nc;
            if (!visited[nIdx]) {
              visited[nIdx] = 1;
              const nColor = cells[nIdx] || null;
              if (nColor === originalColor) {
                queue.push([nc, nr]);
              }
            }
          }
        }
      }

      if (changes.length > 0) {
        onApplyCellChange(changes);
      }
    },
    [cells, settings.columns, settings.rows, onApplyCellChange]
  );

  // Bresenham interpolation between cells for smooth fast drags
  const interpolateLine = useCallback(
    (x0: number, y0: number, x1: number, y1: number): { col: number; row: number }[] => {
      const points: { col: number; row: number }[] = [];
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      let cx = x0;
      let cy = y0;

      while (true) {
        if (cx >= 0 && cx < settings.columns && cy >= 0 && cy < settings.rows) {
          points.push({ col: cx, row: cy });
        }
        if (cx === x1 && cy === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          cx += sx;
        }
        if (e2 < dx) {
          err += dx;
          cy += sy;
        }
      }
      return points;
    },
    [settings.columns, settings.rows]
  );

  // Render the virtual canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#171412';
    ctx.fillRect(0, 0, width, height);

    // Apply pan & zoom
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const { columns, rows, dotSize, beadShape, beadFinish, edgeBorder } = settings;
    const canvasW = columns * cellSpacingX;
    const canvasH = rows * cellSpacingY;

    // 1. Linen Canvas Background
    ctx.fillStyle = '#f4eee4';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Reference Image Overlay (if active)
    if (referenceImage?.visible && refImageElement) {
      ctx.save();
      ctx.globalAlpha = referenceImage.opacity;
      const imgW = canvasW * referenceImage.scale;
      const imgH = (imgW / refImageElement.width) * refImageElement.height;
      const imgX = referenceImage.offsetX;
      const imgY = referenceImage.offsetY;
      ctx.drawImage(refImageElement, imgX, imgY, imgW, imgH);
      ctx.restore();
    }

    // 3. Optional Grid lines
    if (settings.showGrid && zoom >= 0.75) {
      ctx.strokeStyle = '#ded5c9';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      for (let c = 0; c <= columns; c++) {
        const x = c * cellSpacingX;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasH);
      }
      for (let r = 0; r <= rows; r++) {
        const y = r * cellSpacingY;
        ctx.moveTo(0, y);
        ctx.lineTo(canvasW, y);
      }
      ctx.stroke();

      // Major grid line every 5 or 10 beads
      ctx.strokeStyle = '#c8bfb2';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      for (let c = 0; c <= columns; c += 5) {
        const x = c * cellSpacingX;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasH);
      }
      for (let r = 0; r <= rows; r += 5) {
        const y = r * cellSpacingY;
        ctx.moveTo(0, y);
        ctx.lineTo(canvasW, y);
      }
      ctx.stroke();
    }

    // 4. Edge Border Frame
    if (edgeBorder.enabled && edgeBorder.thickness > 0) {
      ctx.strokeStyle = edgeBorder.color || '#8c3b20';
      ctx.lineWidth = edgeBorder.thickness;
      ctx.strokeRect(0, 0, canvasW, canvasH);
    }

    // 5. Draw Beads & Guide Dots (High-performance rendering loop)
    const radius = dotSize / 2;
    const rx = radius * 0.94;
    const ry = radius * rowToColRatio * 0.94;
    const holeRx = Math.max(0.75, rx * 0.2);
    const holeRy = Math.max(0.9, ry * 0.22);

    for (let r = 0; r < rows; r++) {
      const cy = r * cellSpacingY + cellSpacingY / 2;
      const rowOffset = r * columns;

      for (let c = 0; c < columns; c++) {
        const color = cells[rowOffset + c];
        const cx = c * cellSpacingX + cellSpacingX / 2;

        if (color) {
          if (beadShape === 'circle') {
            // Seed bead on a loom: slightly oval / vertically elongated matching authentic loom tension
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Subtle dark rim for physical depth
            ctx.strokeStyle = '#171412';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Tactile highlight: fast specular sheen without creating heap gradient objects
            if (beadFinish === 'glossy') {
              ctx.beginPath();
              ctx.ellipse(cx - rx * 0.32, cy - ry * 0.32, rx * 0.32, ry * 0.28, 0, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.fill();
            }

            // Authentic bead thread hole along vertical warp path
            ctx.beginPath();
            ctx.ellipse(cx, cy, holeRx, holeRy, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(23, 20, 18, 0.55)';
            ctx.fill();
          } else if (beadShape === 'delica_cylinder') {
            // Miyuki Delica cylinder bead style (rectangular with rounded edges)
            const w = dotSize * 0.95;
            const h = dotSize * rowToColRatio * 0.72;
            const crx = radius * 0.25;

            ctx.beginPath();
            ctx.roundRect(cx - w / 2, cy - h / 2, w, h, crx);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#171412';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            if (beadFinish === 'glossy') {
              ctx.beginPath();
              ctx.rect(cx - w / 2 + 1, cy - h / 2 + 1, w - 2, Math.max(1, h * 0.25));
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fill();
            }

            // Central vertical thread channel
            ctx.beginPath();
            ctx.rect(cx - 0.75, cy - h / 2, 1.5, h);
            ctx.fillStyle = 'rgba(23, 20, 18, 0.4)';
            ctx.fill();
          } else {
            // Square fuse bead
            ctx.beginPath();
            ctx.roundRect(cx - radius, cy - radius, dotSize, dotSize, 1.5);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#171412';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        } else if (settings.showEmptyDots) {
          // Guide dot for empty bead placement
          ctx.beginPath();
          ctx.arc(cx, cy, 1.25, 0, Math.PI * 2);
          ctx.fillStyle = '#c8bfb2';
          ctx.fill();
        }
      }
    }

    // 6. Mirror Symmetry Axes
    if (mirrorMode === 'horizontal' || mirrorMode === 'both') {
      const midX = (columns * cellSpacingX) / 2;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#e87524';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, canvasH);
      ctx.stroke();
      ctx.restore();
    }
    if (mirrorMode === 'vertical' || mirrorMode === 'both') {
      const midY = (rows * cellSpacingY) / 2;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#e87524';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(canvasW, midY);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Line Tool Preview
    if (currentTool === 'line' && isMouseDownRef.current && lineStartCellRef.current && hoverCell) {
      const lineCells = interpolateLine(
        lineStartCellRef.current.col,
        lineStartCellRef.current.row,
        hoverCell.col,
        hoverCell.row
      );

      ctx.save();
      ctx.fillStyle = isRightClickRef.current ? 'rgba(220, 38, 38, 0.5)' : activeColor;
      for (const pt of lineCells) {
        const mirrored = getMirroredCoords(pt.col, pt.row);
        for (const m of mirrored) {
          const cx = m.col * cellSpacingX + cellSpacingX / 2;
          const cy = m.row * cellSpacingY + cellSpacingY / 2;
          ctx.beginPath();
          if (beadShape === 'circle') {
            ctx.ellipse(cx, cy, rx * 0.8, ry * 0.8, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 8. Hover Highlight & Bead Drop Ghost Indicator
    if (hoverCell && currentTool !== 'pan') {
      const mirrored = getMirroredCoords(hoverCell.col, hoverCell.row);
      ctx.save();
      for (const m of mirrored) {
        const cx = m.col * cellSpacingX + cellSpacingX / 2;
        const cy = m.row * cellSpacingY + cellSpacingY / 2;
        const targetIdx = m.row * settings.columns + m.col;
        const existingColor = cells[targetIdx];

        if (currentTool === 'paint' || currentTool === 'line') {
          // Artisan Bead Drop Preview: show ghost bead in activeColor with subtle pulse
          ctx.save();
          ctx.globalAlpha = existingColor ? 0.85 : 0.65;
          ctx.fillStyle = activeColor;
          ctx.beginPath();
          if (beadShape === 'circle') {
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          }
          ctx.fill();

          // Dropping locator ring around the cell
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = '#f8f3eb';
          ctx.lineWidth = 1.2 / zoom;
          ctx.beginPath();
          if (beadShape === 'circle') {
            ctx.ellipse(cx, cy, rx + 2.5, ry + 2.5, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(cx, cy, radius + 2.5, 0, Math.PI * 2);
          }
          ctx.stroke();
          ctx.restore();
        } else if (currentTool === 'erase') {
          // Eraser Radius Preview: highlight affected bead cells and circular perimeter
          const cellsInRadius = getCellsInRadius(m.col, m.row, eraserRadius, columns, rows);

          ctx.save();
          // Highlight every cell in the radius with red deletion indicator
          for (const c of cellsInRadius) {
            const beadCX = c.col * cellSpacingX + cellSpacingX / 2;
            const beadCY = c.row * cellSpacingY + cellSpacingY / 2;
            const hasBead = !!cells[c.row * columns + c.col];

            ctx.fillStyle = hasBead ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.15)';
            ctx.beginPath();
            if (beadShape === 'circle') {
              ctx.ellipse(beadCX, beadCY, rx, ry, 0, 0, Math.PI * 2);
            } else {
              ctx.arc(beadCX, beadCY, radius, 0, Math.PI * 2);
            }
            ctx.fill();

            if (hasBead) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 1.2 / zoom;
              ctx.stroke();
            }
          }

          // Outer dashed boundary for the eraser radius
          const outerRX = Math.max(rx + 2, (eraserRadius - 0.5) * cellSpacingX);
          const outerRY = Math.max(ry + 2, (eraserRadius - 0.5) * cellSpacingY);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5 / zoom;
          ctx.setLineDash([4 / zoom, 3 / zoom]);
          ctx.beginPath();
          ctx.ellipse(cx, cy, outerRX, outerRY, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Center crosshair / pivot dot
          ctx.setLineDash([]);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(cx, cy, 2 / zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.strokeStyle = '#e87524';
          ctx.lineWidth = 1.5 / zoom;
          ctx.beginPath();
          if (beadShape === 'circle') {
            ctx.ellipse(cx, cy, rx + 2, ry + 2, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 9. Coordinate Rulers (Top & Left)
    if (settings.showCoordinates) {
      ctx.save();
      ctx.fillStyle = '#71675f';
      ctx.font = `500 ${Math.max(8, 10 / zoom)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // Top columns numbers every 5 beads
      for (let c = 0; c < columns; c++) {
        if (c === 0 || (c + 1) % 5 === 0 || c === columns - 1) {
          const x = c * cellSpacingX + cellSpacingX / 2;
          ctx.fillText(String(c + 1), x, -4);
        }
      }

      // Left rows numbers every 5 beads
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const isBottomUp = settings.rowNumberingDirection !== 'top-to-bottom';

      for (let r = 0; r < rows; r++) {
        // When bottom-to-top (traditional loom standard), bottom row is 1 and top row is rows
        const rowNum = isBottomUp ? rows - r : r + 1;
        if (rowNum === 1 || rowNum % 5 === 0 || rowNum === rows) {
          const y = r * cellSpacingY + cellSpacingY / 2;
          ctx.fillText(String(rowNum), -6, y);
        }
      }
      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }, [
    cells,
    settings,
    activeColor,
    currentTool,
    eraserRadius,
    mirrorMode,
    referenceImage,
    refImageElement,
    zoom,
    pan,
    hoverCell,
    interpolateLine,
    getMirroredCoords,
  ]);

  // Request animation frame for canvas redraw
  useEffect(() => {
    let animId: number;
    const render = () => {
      drawCanvas();
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [drawCanvas]);

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      drawCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  // Handle placing bead or action at cell
  const handleCellAction = useCallback(
    (col: number, row: number, isErase: boolean) => {
      if (currentTool === 'eyedropper') {
        const idx = row * settings.columns + col;
        const color = cells[idx];
        if (color) {
          onEyedropColor(color);
        }
        return;
      }

      if (currentTool === 'fill') {
        const fillCol = isErase ? null : activeColor;
        floodFill(col, row, fillCol);
        return;
      }

      const isEraseAction = isErase || currentTool === 'erase';

      if (isEraseAction) {
        const targetCoords = getMirroredCoords(col, row);
        const cellIndices = new Set<number>();

        for (const m of targetCoords) {
          const inRad = getCellsInRadius(m.col, m.row, eraserRadius, settings.columns, settings.rows);
          for (const c of inRad) {
            cellIndices.add(c.row * settings.columns + c.col);
          }
        }

        const changes = Array.from(cellIndices).map((index) => ({
          index,
          color: null,
        }));

        onApplyCellChange(changes);
        return;
      }

      const targetCoords = getMirroredCoords(col, row);
      const changes = targetCoords.map((c) => ({
        index: c.row * settings.columns + c.col,
        color: activeColor,
      }));

      onApplyCellChange(changes);
    },
    [
      currentTool,
      cells,
      settings.columns,
      settings.rows,
      eraserRadius,
      activeColor,
      onEyedropColor,
      floodFill,
      getMirroredCoords,
      onApplyCellChange,
    ]
  );

  // Mouse / Touch Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or space key drag activates pan
    if (e.button === 1 || currentTool === 'pan' || e.altKey || e.shiftKey) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const isRight = e.button === 2;
    isMouseDownRef.current = true;
    isRightClickRef.current = isRight;

    const cell = screenToCell(e.clientX, e.clientY);
    if (!cell) return;

    if (currentTool === 'line') {
      lineStartCellRef.current = cell;
      return;
    }

    lastCellRef.current = cell;
    handleCellAction(cell.col, cell.row, isRight);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const cell = screenToCell(e.clientX, e.clientY);
    if (cell?.col !== hoverCellRef.current?.col || cell?.row !== hoverCellRef.current?.row) {
      hoverCellRef.current = cell;
      setHoverCell(cell);
    }

    if (!isMouseDownRef.current || !cell) return;

    if (currentTool === 'line') {
      // In line mode, visual preview is updated via hoverCell
      return;
    }

    if (currentTool === 'paint' || currentTool === 'erase' || isRightClickRef.current) {
      if (!lastCellRef.current) {
        lastCellRef.current = cell;
        handleCellAction(cell.col, cell.row, isRightClickRef.current);
        return;
      }

      // Drag to paint or erase: interpolate line between last and current cell
      if (lastCellRef.current.col !== cell.col || lastCellRef.current.row !== cell.row) {
        const line = interpolateLine(
          lastCellRef.current.col,
          lastCellRef.current.row,
          cell.col,
          cell.row
        );

        if (currentTool === 'erase' || isRightClickRef.current) {
          const cellIndices = new Set<number>();
          for (const pt of line) {
            const mirrored = getMirroredCoords(pt.col, pt.row);
            for (const m of mirrored) {
              const inRad = getCellsInRadius(m.col, m.row, eraserRadius, settings.columns, settings.rows);
              for (const c of inRad) {
                cellIndices.add(c.row * settings.columns + c.col);
              }
            }
          }
          onApplyCellChange(Array.from(cellIndices).map((index) => ({ index, color: null })));
        } else {
          // Batch paint changes along the line for fluid, instantaneous performance
          const cellIndices = new Set<number>();
          for (const pt of line) {
            const mirrored = getMirroredCoords(pt.col, pt.row);
            for (const m of mirrored) {
              cellIndices.add(m.row * settings.columns + m.col);
            }
          }
          onApplyCellChange(Array.from(cellIndices).map((index) => ({ index, color: activeColor })));
        }
        lastCellRef.current = cell;
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isMouseDownRef.current && currentTool === 'line' && lineStartCellRef.current) {
      const cell = screenToCell(e.clientX, e.clientY);
      if (cell) {
        const line = interpolateLine(
          lineStartCellRef.current.col,
          lineStartCellRef.current.row,
          cell.col,
          cell.row
        );
        const newColor = isRightClickRef.current ? null : activeColor;
        const changes: { index: number; color: string | null }[] = [];

        for (const pt of line) {
          const mirrored = getMirroredCoords(pt.col, pt.row);
          for (const m of mirrored) {
            changes.push({
              index: m.row * settings.columns + m.col,
              color: newColor,
            });
          }
        }
        onApplyCellChange(changes);
      }
    }

    isMouseDownRef.current = false;
    isRightClickRef.current = false;
    lastCellRef.current = null;
    lineStartCellRef.current = null;
  };

  // Wheel zoom around mouse pointer
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newZoom = Math.min(8.0, Math.max(0.5, zoom * zoomFactor));

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Adjust pan so point under cursor remains invariant
    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    onZoomChange(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  const cursorStyle = useMemo(() => {
    if (isPanning || currentTool === 'pan') {
      return { cursor: isPanning ? 'grabbing' : 'grab' };
    }
    if (currentTool === 'eyedropper') {
      return { cursor: 'crosshair' };
    }
    if (currentTool === 'erase') {
      return { cursor: getEraserCursor(eraserRadius) };
    }
    if (currentTool === 'paint' || currentTool === 'line') {
      return { cursor: getBeadHandCursor(activeColor) };
    }
    return { cursor: 'crosshair' };
  }, [isPanning, currentTool, activeColor, eraserRadius]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        isMouseDownRef.current = false;
        setIsPanning(false);
        setHoverCell(null);
      }}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={handleWheel}
      style={cursorStyle}
      className="relative w-full h-full overflow-hidden bg-[#171412] touch-none"
    >
      <canvas
        ref={canvasRef}
        style={cursorStyle}
        className="absolute inset-0 block w-full h-full"
      />

      {/* Floating Viewport Status Overlay */}
      <div className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-sm border border-[#2e2722] px-3 py-1.5 rounded-md text-[11px] text-[#a3978a] flex items-center gap-2 pointer-events-none select-none">
        {hoverCell ? (
          <>
            <span className="text-[#f8f3eb] font-mono-numbers">
              Col {hoverCell.col + 1}, Row{' '}
              {settings.rowNumberingDirection !== 'top-to-bottom'
                ? settings.rows - hoverCell.row
                : hoverCell.row + 1}
            </span>
            <span aria-hidden="true" className="text-[#574b43]">·</span>
            <span>
              {cells[hoverCell.row * settings.columns + hoverCell.col]
                ? 'Bead placed'
                : 'Empty'}
            </span>
          </>
        ) : (
          <span>Hover over canvas to inspect bead cells</span>
        )}
      </div>

      {/* Floating Eraser Radius HUD */}
      {currentTool === 'erase' && (
        <div className="absolute top-3 right-3 bg-[#1f1b18]/90 backdrop-blur-sm border border-[#ef4444]/40 px-3 py-1.5 rounded-lg text-xs text-[#ded5c9] flex items-center gap-2.5 shadow-xl select-none z-10 pointer-events-auto">
          <span className="flex items-center gap-1.5 font-medium text-[#ef4444]">
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser:</span>
          </span>
          {onChangeEraserRadius ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChangeEraserRadius(Math.max(1, eraserRadius - 1))}
                disabled={eraserRadius <= 1}
                className="w-5 h-5 rounded bg-[#2e2722] hover:bg-[#3d332c] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[#ded5c9] flex items-center justify-center font-bold font-mono text-xs transition-colors border border-[#3a3028]"
                title="Decrease radius ([ key)"
              >
                -
              </button>
              <span className="font-mono font-bold text-white px-1.5 min-w-[20px] text-center text-xs">
                {eraserRadius}
              </span>
              <button
                type="button"
                onClick={() => onChangeEraserRadius(Math.min(6, eraserRadius + 1))}
                disabled={eraserRadius >= 6}
                className="w-5 h-5 rounded bg-[#2e2722] hover:bg-[#3d332c] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-[#ded5c9] flex items-center justify-center font-bold font-mono text-xs transition-colors border border-[#3a3028]"
                title="Increase radius (] key)"
              >
                +
              </button>
            </div>
          ) : (
            <span className="font-mono font-bold text-white">{eraserRadius}</span>
          )}
          <span className="text-[#a3978a] text-[10px] border-l border-[#3a3028] pl-2 font-mono">
            [ / ]
          </span>
        </div>
      )}
    </div>
  );
};
