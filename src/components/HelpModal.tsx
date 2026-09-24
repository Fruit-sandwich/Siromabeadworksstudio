import React from 'react';
import { X, HelpCircle, Keyboard, MousePointer, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1b18] border border-[#2e2722] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e87524]/10 text-[#e87524] flex items-center justify-center border border-[#e87524]/20">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f8f3eb] font-cinzel">
                Siroma Beadworks Studio Guide
              </h2>
              <p className="text-xs text-[#a3978a]">
                Virtual beadwork sketching principles and keyboard shortcuts.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#ded5c9]">
          {/* Design Philosophy */}
          <div className="p-3.5 bg-[#171412] border border-[#2e2722] rounded-lg">
            <div className="flex items-center gap-2 text-[#e87524] font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Artisan Design Principle & Loom Weaving Convention</span>
            </div>
            <p className="text-[#a3978a] leading-relaxed">
              Every dot on the virtual canvas corresponds to one physical bead. By default, row numbering follows traditional bead loom conventions: starting from Row 1 at the bottom warp row and working upwards row-by-row. You can switch between Bottom-Up (Loom Standard) and Top-Down in Canvas Settings.
            </p>
          </div>

          {/* Weaving Companion Mode */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weaving Companion HUD (Hands-on-the-Loom)</span>
            </h3>
            <div className="border border-[#2e2722] rounded-lg overflow-hidden divide-y divide-[#2e2722] bg-[#171412]">
              {[
                { key: 'Space / Enter', desc: 'Pick up next bead group on needle, or advance to next row' },
                { key: '→ / ←', desc: 'Step to next or previous row' },
                { key: 'Click Canvas Row', desc: 'Instantly jump active guide bar to clicked row' },
                { key: 'M', desc: 'Mute / unmute tactile wooden bead audio clicks' },
                { key: 'Esc', desc: 'Exit Weaving Mode back to design canvas' },
              ].map((item) => (
                <div key={item.key} className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-mono text-[#e87524] font-medium text-[11px] bg-[#1f1b18] px-1.5 py-0.5 rounded border border-[#2e2722]">
                    {item.key}
                  </span>
                  <span className="text-[#a3978a]">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mouse Gestures */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524] mb-2 flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5" />
              <span>Mouse & Touch Gestures</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#171412] rounded border border-[#2e2722]">
                <span className="font-semibold text-[#f8f3eb] block">Left Click / Tap</span>
                <span className="text-[#a3978a]">Place bead with selected color</span>
              </div>
              <div className="p-2 bg-[#171412] rounded border border-[#2e2722]">
                <span className="font-semibold text-[#f8f3eb] block">Left Drag</span>
                <span className="text-[#a3978a]">Continuous brush bead placement</span>
              </div>
              <div className="p-2 bg-[#171412] rounded border border-[#2e2722]">
                <span className="font-semibold text-[#f8f3eb] block">Right Click / Secondary</span>
                <span className="text-[#a3978a]">Erase bead (unplace)</span>
              </div>
              <div className="p-2 bg-[#171412] rounded border border-[#2e2722]">
                <span className="font-semibold text-[#f8f3eb] block">Mouse Wheel</span>
                <span className="text-[#a3978a]">Zoom in / out around cursor</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524] mb-2 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Shortcuts</span>
            </h3>
            <div className="border border-[#2e2722] rounded-lg overflow-hidden divide-y divide-[#2e2722] bg-[#171412]">
              {[
                { key: 'B / P', desc: 'Drop Bead (hand pinch placement)' },
                { key: 'E', desc: 'Eraser tool' },
                { key: '[ / ]', desc: 'Decrease / Increase Eraser Radius' },
                { key: '1 - 6', desc: 'Quick set Eraser Radius (in Eraser mode)' },
                { key: 'I', desc: 'Eyedropper (sample color)' },
                { key: 'G', desc: 'Bucket Fill (flood fill)' },
                { key: 'L', desc: 'Line tool (shows live bead release count tooltip)' },
                { key: 'H / Space', desc: 'Pan / Hand tool' },
                { key: 'M', desc: 'Cycle Mirror Symmetry (H / V / Both / Off)' },
                { key: 'Ctrl / Cmd + Z', desc: 'Undo' },
                { key: 'Ctrl / Cmd + Y', desc: 'Redo' },
              ].map((item) => (
                <div key={item.key} className="px-3 py-1.5 flex items-center justify-between">
                  <span className="font-mono text-[#e87524] font-medium text-[11px] bg-[#1f1b18] px-1.5 py-0.5 rounded border border-[#2e2722]">
                    {item.key}
                  </span>
                  <span className="text-[#a3978a]">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer close */}
          <div className="pt-2 border-t border-[#2e2722] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#e87524] hover:bg-[#d46517] rounded-lg shadow-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
