import React from 'react';
import {
  Paintbrush,
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
import { ToolMode, MirrorMode } from '../types/bead';

interface ToolbarProps {
  currentTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
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
  const tools: { id: ToolMode; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'paint', label: 'Bead Pen', icon: <Paintbrush className="w-4 h-4" />, shortcut: 'B / P' },
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
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group ${
                isActive
                  ? 'bg-[#e87524] text-white shadow-sm'
                  : 'text-[#ded5c9] hover:text-[#f8f3eb] hover:bg-[#2e2722]'
              }`}
              title={`${t.label} (${t.shortcut})`}
              aria-label={t.label}
            >
              {t.icon}
              {/* Tooltip */}
              <span className="hidden group-hover:flex absolute left-full ml-2.5 px-2 py-1 bg-[#111111] text-[#f8f3eb] text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none items-center gap-1.5 border border-[#2e2722]">
                <span>{t.label}</span>
                <span className="text-[#a3978a] font-mono-numbers text-[10px] bg-[#1f1b18] px-1 rounded">
                  {t.shortcut}
                </span>
              </span>
            </button>
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
