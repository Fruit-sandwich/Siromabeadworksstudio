import React from 'react';
import {
  Eraser,
  Pipette,
  PaintBucket,
  Slash,
  Hand,
  Undo2,
  Redo2,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { BeadDropIcon } from './icons/BeadDropIcon';
import { ToolMode, MirrorMode } from '../types/bead';

interface ToolbarProps {
  currentTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  activeColor?: string;
  eraserRadius: number;
  onChangeEraserRadius: (radius: number) => void;
  mirrorMode: MirrorMode;
  onChangeMirrorMode: (mode: MirrorMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearCanvas: () => void;
  onOpenReferenceModal: () => void;
  hasReferenceImage: boolean;
  referenceVisible: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitCanvas: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  activeColor = '#e87524',
  eraserRadius,
  onChangeEraserRadius,
  mirrorMode,
  onChangeMirrorMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearCanvas,
  onOpenReferenceModal,
  hasReferenceImage,
  referenceVisible,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitCanvas,
}) => {
  const [showEraserMenu, setShowEraserMenu] = React.useState(false);

  // Auto-open eraser menu when switching to eraser
  React.useEffect(() => {
    if (currentTool === 'erase') {
      setShowEraserMenu(true);
    } else {
      setShowEraserMenu(false);
    }
  }, [currentTool]);

  const tools: { id: ToolMode; label: string; icon: React.ReactNode; shortcut: string }[] = [
    {
      id: 'paint',
      label: 'Drop Bead',
      icon: <BeadDropIcon className="w-5 h-5" beadColor={activeColor} />,
      shortcut: 'B / P (X: swap)',
    },
    { id: 'erase', label: 'Eraser', icon: <Eraser className="w-4 h-4" />, shortcut: 'E / Right-Click' },
    { id: 'eyedropper', label: 'Eyedropper', icon: <Pipette className="w-4 h-4" />, shortcut: 'I' },
    { id: 'fill', label: 'Bucket Fill', icon: <PaintBucket className="w-4 h-4" />, shortcut: 'G' },
    { id: 'line', label: 'Line Ruler', icon: <Slash className="w-4 h-4" />, shortcut: 'L' },
    { id: 'pan', label: 'Pan Hand', icon: <Hand className="w-4 h-4" />, shortcut: 'H / Space' },
  ];

  return (
    <aside className="w-14 md:w-16 bg-[#1f1b18] border-r border-[#2e2722] flex flex-col items-center py-3 select-none z-20 shrink-0 justify-between">
      {/* Primary Drawing Tools */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {tools.map((t) => {
          const isActive = currentTool === t.id;
          const isPaintTool = t.id === 'paint';
          const isEraserTool = t.id === 'erase';

          // When paint tool is active, use a refined dark copper badge with an active color indicator
          // When eraser is active, use a refined red-accented badge
          const buttonStyle = isActive
            ? isPaintTool
              ? 'bg-[#38281e] text-white shadow-sm ring-2 ring-[#e87524]'
              : isEraserTool
              ? 'bg-[#3a1a1a] text-[#ef4444] shadow-sm ring-2 ring-[#ef4444]'
              : 'bg-[#e87524] text-white shadow-sm'
            : 'text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722]';

          return (
            <div key={t.id} className="relative w-full flex justify-center">
              <button
                onClick={() => {
                  if (isEraserTool && isActive) {
                    setShowEraserMenu((prev) => !prev);
                  } else {
                    onSelectTool(t.id);
                  }
                }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group ${buttonStyle}`}
                title={`${t.label} (${t.shortcut})`}
                aria-label={t.label}
              >
                {t.icon}

                {/* Eraser Radius Badge */}
                {isEraserTool && eraserRadius > 1 && (
                  <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {eraserRadius}
                  </span>
                )}

                {/* Tooltip (only when flyout is closed) */}
                {(!isEraserTool || !showEraserMenu || !isActive) && (
                  <span className="hidden group-hover:flex absolute left-full ml-2.5 px-2 py-1 bg-[#111111] text-[#f8f3eb] text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none items-center gap-1.5 border border-[#2e2722]">
                    <span>{t.label}</span>
                    {isPaintTool && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/50 shrink-0 inline-block"
                        style={{ backgroundColor: activeColor }}
                      />
                    )}
                    {isEraserTool && (
                      <span className="text-[#ef4444] text-[10px] font-mono">
                        (r: {eraserRadius})
                      </span>
                    )}
                    <span className="text-[#a3978a] font-mono-numbers text-[10px] bg-[#1f1b18] px-1 rounded">
                      {t.shortcut}
                    </span>
                  </span>
                )}
              </button>

              {/* Eraser Radius Interactive Flyout Menu */}
              {isEraserTool && isActive && showEraserMenu && (
                <div className="absolute left-full ml-3 top-0 bg-[#1f1b18] border border-[#3d2b27] rounded-xl shadow-2xl p-3 z-50 w-56 text-[#f8f3eb] flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between border-b border-[#2e2722] pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Eraser className="w-3.5 h-3.5 text-[#ef4444]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#ded5c9]">
                        Eraser Radius
                      </span>
                    </div>
                    <span className="text-[10px] text-[#a3978a] font-mono bg-[#171412] px-1.5 py-0.5 rounded border border-[#2e2722]">
                      [ / ] keys
                    </span>
                  </div>

                  {/* Preset Radius Buttons */}
                  <div className="flex items-center justify-between gap-1">
                    {[1, 2, 3, 4, 5, 6].map((r) => {
                      const isSel = eraserRadius === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeEraserRadius(r);
                          }}
                          className={`flex-1 py-1 rounded text-xs font-mono font-medium transition-all ${
                            isSel
                              ? 'bg-[#ef4444] text-white font-bold shadow-sm scale-105 ring-1 ring-white/30'
                              : 'bg-[#2a241f] text-[#ded5c9] hover:bg-[#382f28] hover:text-white'
                          }`}
                          title={`Radius ${r} bead${r > 1 ? 's' : ''}`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  {/* Fine Adjustment Stepper & Slider */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeEraserRadius(Math.max(1, eraserRadius - 1));
                      }}
                      disabled={eraserRadius <= 1}
                      className="w-6 h-6 rounded bg-[#2a241f] text-[#ded5c9] hover:bg-[#382f28] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold font-mono transition-colors border border-[#3a3028]"
                      title="Decrease radius ([ key)"
                    >
                      -
                    </button>

                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={1}
                      value={eraserRadius}
                      onChange={(e) => {
                        e.stopPropagation();
                        onChangeEraserRadius(parseInt(e.target.value, 10));
                      }}
                      className="flex-1 accent-[#ef4444] h-1.5 bg-[#2e2722] rounded-lg cursor-pointer"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeEraserRadius(Math.min(6, eraserRadius + 1));
                      }}
                      disabled={eraserRadius >= 6}
                      className="w-6 h-6 rounded bg-[#2a241f] text-[#ded5c9] hover:bg-[#382f28] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold font-mono transition-colors border border-[#3a3028]"
                      title="Increase radius (] key)"
                    >
                      +
                    </button>
                  </div>

                  {/* Size description feedback */}
                  <div className="text-[10px] text-[#a3978a] flex justify-between items-center bg-[#171412] px-2 py-1 rounded border border-[#26201c]">
                    <span>
                      {eraserRadius === 1 && '1 bead (single)'}
                      {eraserRadius === 2 && '9 beads (3×3 block)'}
                      {eraserRadius === 3 && '21 beads (5×5 circle)'}
                      {eraserRadius === 4 && '37 beads (7×7 circle)'}
                      {eraserRadius === 5 && '69 beads (9×9 circle)'}
                      {eraserRadius === 6 && '97 beads (11×11 circle)'}
                    </span>
                    <span className="font-mono text-[#ef4444] font-bold">
                      {eraserRadius}×
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="w-7 h-[1px] bg-[#2e2722] my-1.5" />

        {/* Mirror Mode Dropdown / Button Cycle */}
        <div className="flex flex-col items-center gap-1 w-full">
          <button
            onClick={() => {
              const modes: MirrorMode[] = ['none', 'horizontal', 'vertical', 'both'];
              const nextIdx = (modes.indexOf(mirrorMode) + 1) % modes.length;
              onChangeMirrorMode(modes[nextIdx]);
            }}
            className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-colors relative group ${
              mirrorMode !== 'none'
                ? 'bg-[#e87524]/20 text-[#e87524] border border-[#e87524]/40'
                : 'text-[#a3978a] hover:text-[#ded5c9] hover:bg-[#2e2722]'
            }`}
            title={`Mirror Mode: ${mirrorMode} (Click to cycle)`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px] font-mono tracking-tighter leading-none mt-0.5 uppercase">
              {mirrorMode === 'none' ? 'OFF' : mirrorMode === 'horizontal' ? 'H' : mirrorMode === 'vertical' ? 'V' : 'BOTH'}
            </span>
            <span className="hidden group-hover:flex absolute left-full ml-2.5 px-2 py-1 bg-[#111111] text-[#f8f3eb] text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none border border-[#2e2722]">
              Symmetry Mirror: {mirrorMode}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-7 h-[1px] bg-[#2e2722] my-1.5" />

        {/* Reference Image Button */}
        <button
          onClick={onOpenReferenceModal}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group ${
            hasReferenceImage && referenceVisible
              ? 'bg-[#2894a2]/20 text-[#2894a2] border border-[#2894a2]/40'
              : 'text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722]'
          }`}
          title="Reference Image Overlay"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden group-hover:flex absolute left-full ml-2.5 px-2 py-1 bg-[#111111] text-[#f8f3eb] text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none border border-[#2e2722]">
            Reference Image
          </span>
        </button>
      </div>

      {/* Bottom Actions: Undo, Redo, Zoom, Clear */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group ${
            canUndo ? 'text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722]' : 'text-[#483d35] cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden group-hover:flex absolute left-full ml-2.5 px-2 py-1 bg-[#111111] text-[#f8f3eb] text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none border border-[#2e2722]">
            Undo (Ctrl+Z)
          </span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group ${
            canRedo ? 'text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722]' : 'text-[#483d35] cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y / Shift+Ctrl+Z)"
        >
          <Redo2 className="w-4 h-4" />
          <span className="hidden group-hover:flex absolute left-full ml-2.5 px-2 py-1 bg-[#111111] text-[#f8f3eb] text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none border border-[#2e2722]">
            Redo (Ctrl+Y)
          </span>
        </button>

        {/* Divider */}
        <div className="w-7 h-[1px] bg-[#2e2722] my-1" />

        {/* Zoom Controls */}
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetZoom}
          className="text-[10px] font-mono-numbers text-[#a3978a] hover:text-[#f8f3eb] transition-colors"
          title="Reset Zoom to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onFitCanvas}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722] transition-colors"
          title="Fit Canvas to Viewport"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-7 h-[1px] bg-[#2e2722] my-1" />

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[#ded5c9] hover:text-red-400 hover:bg-red-950/30 transition-colors relative group"
          title="Clear Canvas"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden group-hover:flex absolute left-full ml-2.5 px-2 py-1 bg-[#111111] text-[#f8f3eb] text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none border border-[#2e2722]">
            Clear Canvas
          </span>
        </button>
      </div>
    </aside>
  );
};
