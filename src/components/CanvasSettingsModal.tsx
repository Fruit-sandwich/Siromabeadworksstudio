import React, { useState } from 'react';
import { X, Sliders, Check, Ruler, Sparkles } from 'lucide-react';
import { CanvasSettings, BeadShape, BeadFinish } from '../types/bead';
import { BEAD_STANDARDS } from '../utils/colorUtils';

interface CanvasSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CanvasSettings;
  onSaveSettings: (newSettings: CanvasSettings) => void;
}

export const CanvasSettingsModal: React.FC<CanvasSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [cols, setCols] = useState(settings.columns);
  const [rows, setRows] = useState(settings.rows);
  const [spacing, setSpacing] = useState(settings.cellSpacing);
  const [dotSize, setDotSize] = useState(settings.dotSize);
  const [beadShape, setBeadShape] = useState<BeadShape>(settings.beadShape);
  const [beadFinish, setBeadFinish] = useState<BeadFinish>(settings.beadFinish);
  const [showCoordinates, setShowCoordinates] = useState(settings.showCoordinates);
  const [rowNumberingDirection, setRowNumberingDirection] = useState<'bottom-to-top' | 'top-to-bottom'>(
    settings.rowNumberingDirection || 'bottom-to-top'
  );
  const [showGrid, setShowGrid] = useState(settings.showGrid);
  const [showEmptyDots, setShowEmptyDots] = useState(settings.showEmptyDots);
  const [mmPerBead, setMmPerBead] = useState(settings.millimetresPerBead);
  const [selectedStandard, setSelectedStandard] = useState(settings.beadTypeLabel);
  const [borderThickness, setBorderThickness] = useState(settings.edgeBorder.thickness);
  const [borderColor, setBorderColor] = useState(settings.edgeBorder.color);

  if (!isOpen) return null;

  const handleStandardChange = (name: string) => {
    setSelectedStandard(name);
    const standard = BEAD_STANDARDS.find((s) => s.name === name);
    if (standard && standard.mm > 0) {
      setMmPerBead(standard.mm);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      columns: Math.max(4, Math.min(120, cols)),
      rows: Math.max(4, Math.min(160, rows)),
      cellSpacing: Math.max(4, Math.min(32, spacing)),
      dotSize: Math.max(2, Math.min(24, dotSize)),
      beadShape,
      beadFinish,
      showCoordinates,
      rowNumberingDirection,
      showGrid,
      showEmptyDots,
      millimetresPerBead: mmPerBead,
      beadTypeLabel: selectedStandard,
      edgeBorder: {
        enabled: borderThickness > 0,
        thickness: borderThickness,
        color: borderColor,
      },
    });
    onClose();
  };

  const estWidthMm = (cols * mmPerBead).toFixed(1);
  const estHeightMm = (rows * mmPerBead).toFixed(1);
  const estWidthIn = ((cols * mmPerBead) / 25.4).toFixed(2);
  const estHeightIn = ((rows * mmPerBead) / 25.4).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1b18] border border-[#2e2722] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e87524]/10 text-[#e87524] flex items-center justify-center border border-[#e87524]/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f8f3eb] font-cinzel">
                Canvas & Bead Calibration
              </h2>
              <p className="text-xs text-[#a3978a]">
                Configure grid dimensions, bead geometry, and physical scale.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a3978a] hover:text-[#f8f3eb] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Section 1: Dimensions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524]">
              Canvas Dimensions (Cells)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                  Columns (Width: 4 – 120)
                </label>
                <input
                  type="number"
                  min={4}
                  max={120}
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-[#f8f3eb] font-mono-numbers focus:border-[#e87524] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                  Rows (Height: 4 – 160)
                </label>
                <input
                  type="number"
                  min={4}
                  max={160}
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-[#f8f3eb] font-mono-numbers focus:border-[#e87524] outline-none"
                />
              </div>
            </div>

            {/* Quick Physical Aspect Ratio Presets */}
            <div className="pt-1">
              <span className="text-[11px] text-[#a3978a] font-medium block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#e87524]" />
                Physical Canvas Proportions (6cm × 11cm Aspect Ratio 6:11):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCols(34);
                    setRows(62);
                    setMmPerBead(1.76);
                    setSelectedStandard('Siroma Tapestry 6cm × 11cm (34×62)');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    cols === 34 && rows === 62
                      ? 'border-[#e87524] bg-[#e87524]/15 text-[#f8f3eb] ring-1 ring-[#e87524]'
                      : 'border-[#2e2722] bg-[#171412] text-[#ded5c9] hover:border-[#483d35]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">34 × 62 (Exact 6×11cm)</span>
                    {cols === 34 && rows === 62 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e87524]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#a3978a]">
                    Matches physical piece @ 1.76mm
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCols(37);
                    setRows(68);
                    setMmPerBead(1.6);
                    setSelectedStandard('Miyuki Delica 11/0 (Cylinder)');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    cols === 37 && rows === 68
                      ? 'border-[#e87524] bg-[#e87524]/15 text-[#f8f3eb] ring-1 ring-[#e87524]'
                      : 'border-[#2e2722] bg-[#171412] text-[#ded5c9] hover:border-[#483d35]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">37 × 68 (Miyuki 11/0)</span>
                    {cols === 37 && rows === 68 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e87524]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#a3978a]">
                    59.2 × 108.8 mm (1.6mm Delica)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCols(28);
                    setRows(52);
                    setMmPerBead(2.1);
                    setSelectedStandard('Round Seed Bead 11/0 (Czech)');
                  }}
                  className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                    cols === 28 && rows === 52
                      ? 'border-[#e87524] bg-[#e87524]/15 text-[#f8f3eb] ring-1 ring-[#e87524]'
                      : 'border-[#2e2722] bg-[#171412] text-[#ded5c9] hover:border-[#483d35]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">28 × 52 (Czech 11/0)</span>
                    {cols === 28 && rows === 52 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e87524]" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#a3978a]">
                    58.8 × 109.2 mm (2.1mm Seed)
                  </span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#71675f]">
              Total beads capacity: <span className="font-mono-numbers font-medium text-[#ded5c9]">{(cols * rows).toLocaleString()} beads</span>
              {' · '}
              Aspect ratio: <span className="font-mono-numbers font-medium text-[#ded5c9]">{(cols / rows).toFixed(3)} (Target: {(6 / 11).toFixed(3)})</span>
            </p>
          </div>

          {/* Section 2: Physical Bead Type & Scale */}
          <div className="space-y-3 pt-3 border-t border-[#2e2722]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524] flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span>Physical Translation & Bead Standard</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                  Standard Bead Specification
                </label>
                <select
                  value={selectedStandard}
                  onChange={(e) => handleStandardChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-xs text-[#f8f3eb] focus:border-[#e87524] outline-none"
                >
                  {BEAD_STANDARDS.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.mm}mm)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                  Millimetres per Bead (mm)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min={0.5}
                  max={30}
                  value={mmPerBead}
                  onChange={(e) => setMmPerBead(parseFloat(e.target.value) || 1.6)}
                  className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-[#f8f3eb] font-mono-numbers focus:border-[#e87524] outline-none"
                />
              </div>
            </div>

            {/* Calculated Physical Dimensions card */}
            <div className="p-3 bg-[#171412] border border-[#2e2722] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#a3978a] block">Calculated Finished Object Size</span>
                <span className="text-sm font-semibold text-[#f8f3eb] font-mono-numbers">
                  {estWidthMm} × {estHeightMm} mm
                </span>
                <span className="text-xs text-[#71675f] font-mono-numbers ml-2">
                  ({estWidthIn}″ × {estHeightIn}″)
                </span>
              </div>
              <span className="text-[11px] text-[#a3978a] bg-[#1f1b18] px-2 py-1 rounded border border-[#2e2722]">
                1:{((mmPerBead * 10) / 10).toFixed(1)} Scale
              </span>
            </div>
          </div>

          {/* Section 3: Visual Appearance & Geometry */}
          <div className="space-y-3 pt-3 border-t border-[#2e2722]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524]">
              Visual Rendering & Bead Geometry
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                  Bead Shape
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBeadShape('circle')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      beadShape === 'circle'
                        ? 'bg-[#e87524]/20 border-[#e87524] text-[#f8f3eb]'
                        : 'bg-[#171412] border-[#2e2722] text-[#a3978a]'
                    }`}
                  >
                    Round Seed
                  </button>
                  <button
                    type="button"
                    onClick={() => setBeadShape('delica_cylinder')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      beadShape === 'delica_cylinder'
                        ? 'bg-[#e87524]/20 border-[#e87524] text-[#f8f3eb]'
                        : 'bg-[#171412] border-[#2e2722] text-[#a3978a]'
                    }`}
                  >
                    Delica Tube
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                  Bead Surface Finish
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBeadFinish('glossy')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      beadFinish === 'glossy'
                        ? 'bg-[#e87524]/20 border-[#e87524] text-[#f8f3eb]'
                        : 'bg-[#171412] border-[#2e2722] text-[#a3978a]'
                    }`}
                  >
                    Glossy Glass
                  </button>
                  <button
                    type="button"
                    onClick={() => setBeadFinish('matte')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                      beadFinish === 'matte'
                        ? 'bg-[#e87524]/20 border-[#e87524] text-[#f8f3eb]'
                        : 'bg-[#171412] border-[#2e2722] text-[#a3978a]'
                    }`}
                  >
                    Matte / Ceramic
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-[#ded5c9] mb-1">
                  <span>Cell Spacing (px)</span>
                  <span className="font-mono-numbers">{spacing}px</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={32}
                  value={spacing}
                  onChange={(e) => setSpacing(parseInt(e.target.value))}
                  className="w-full accent-[#e87524]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#ded5c9] mb-1">
                  <span>Dot Diameter (px)</span>
                  <span className="font-mono-numbers">{dotSize}px</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={24}
                  value={dotSize}
                  onChange={(e) => setDotSize(parseInt(e.target.value))}
                  className="w-full accent-[#e87524]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Display Toggles & Edge Border */}
          <div className="space-y-3 pt-3 border-t border-[#2e2722]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524]">
              Studio Display & Border Guides
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCoordinates}
                  onChange={(e) => setShowCoordinates(e.target.checked)}
                  className="rounded border-[#2e2722] text-[#e87524] focus:ring-0 accent-[#e87524]"
                />
                <span className="text-xs text-[#ded5c9]">
                  Show Row & Column Numbers on Rulers
                </span>
              </label>

              {/* Loom vs Standard Row Numbering Convention */}
              <div className="pl-6 pt-1 pb-1">
                <label className="block text-[11px] font-medium text-[#a3978a] mb-1.5">
                  Row Numbering Convention:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRowNumberingDirection('bottom-to-top')}
                    className={`px-3 py-2 rounded border text-left flex flex-col gap-0.5 transition-colors ${
                      rowNumberingDirection === 'bottom-to-top'
                        ? 'border-[#e87524] bg-[#e87524]/10 text-[#f8f3eb]'
                        : 'border-[#2e2722] bg-[#171412] text-[#a3978a] hover:border-[#483d35]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Bottom-Up (Loom Standard)</span>
                      {rowNumberingDirection === 'bottom-to-top' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e87524]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#71675f] leading-tight">
                      Row 1 at bottom, counting up to Row {rows}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRowNumberingDirection('top-to-bottom')}
                    className={`px-3 py-2 rounded border text-left flex flex-col gap-0.5 transition-colors ${
                      rowNumberingDirection === 'top-to-bottom'
                        ? 'border-[#e87524] bg-[#e87524]/10 text-[#f8f3eb]'
                        : 'border-[#2e2722] bg-[#171412] text-[#a3978a] hover:border-[#483d35]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Top-Down</span>
                      {rowNumberingDirection === 'top-to-bottom' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e87524]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#71675f] leading-tight">
                      Row 1 at top, counting down to Row {rows}
                    </span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-[#2e2722] text-[#e87524] focus:ring-0 accent-[#e87524]"
                />
                <span className="text-xs text-[#ded5c9]">
                  Show Grid Lines (#ded5c9)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmptyDots}
                  onChange={(e) => setShowEmptyDots(e.target.checked)}
                  className="rounded border-[#2e2722] text-[#e87524] focus:ring-0 accent-[#e87524]"
                />
                <span className="text-xs text-[#ded5c9]">
                  Show Empty Bead Position Guide Dots (#c8bfb2)
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                  Edge Border Thickness (px)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={borderThickness}
                  onChange={(e) => setBorderThickness(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#171412] border border-[#2e2722] rounded text-[#f8f3eb] font-mono-numbers focus:border-[#e87524] outline-none text-xs"
                />
              </div>

              {borderThickness > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[#ded5c9] mb-1">
                    Border Color
                  </label>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-[#2e2722] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#e87524] hover:bg-[#d46517] rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Canvas Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
