import React, { useRef } from 'react';
import { X, Image as ImageIcon, Eye, EyeOff, Lock, Unlock, Upload, Trash2, Sparkles } from 'lucide-react';
import { ReferenceImage } from '../types/bead';

interface ReferenceOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceImage: ReferenceImage | null;
  onUpdateReference: (ref: ReferenceImage | null) => void;
}

export const ReferenceOverlayModal: React.FC<ReferenceOverlayModalProps> = ({
  isOpen,
  onClose,
  referenceImage,
  onUpdateReference,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      onUpdateReference({
        src,
        name: file.name,
        opacity: 0.45,
        scale: 1.0,
        offsetX: 0,
        offsetY: 0,
        locked: false,
        visible: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleArtisanPhoto = () => {
    // Curated high quality generated artisan photograph
    onUpdateReference({
      src: '/src/assets/images/beadwork_craft_reference_1790115792845.jpg',
      name: 'Southwestern Beadwork Photograph.jpg',
      opacity: 0.4,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      locked: false,
      visible: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1b18] border border-[#2e2722] rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2894a2]/10 text-[#2894a2] flex items-center justify-center border border-[#2894a2]/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f8f3eb] font-cinzel">
                Reference Image Overlay
              </h2>
              <p className="text-xs text-[#a3978a]">
                Trace sketches, photos, or textile patterns directly onto the bead grid.
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
        <div className="p-6 space-y-5 text-sm">
          {!referenceImage ? (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-[#2e2722] hover:border-[#e87524] rounded-xl text-center cursor-pointer transition-colors group bg-[#171412]"
              >
                <Upload className="w-8 h-8 text-[#71675f] group-hover:text-[#e87524] mx-auto mb-2 transition-colors" />
                <span className="font-semibold text-xs text-[#f8f3eb] block">
                  Upload Reference Photo or Sketch
                </span>
                <span className="text-[11px] text-[#71675f] mt-1 block">
                  PNG, JPG, or SVG image (under 10MB)
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#2e2722]" />
                <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-[#71675f]">or</span>
                <div className="flex-grow border-t border-[#2e2722]" />
              </div>

              <button
                type="button"
                onClick={handleLoadSampleArtisanPhoto}
                className="w-full py-2.5 px-3 bg-[#171412] hover:bg-[#25201c] border border-[#2e2722] hover:border-[#e87524]/60 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e87524]" />
                <span>Load Sample Artisan Beadwork Photo</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active image status bar */}
              <div className="p-3 bg-[#171412] border border-[#2e2722] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#2894a2]" />
                  <span className="text-xs text-[#f8f3eb] truncate max-w-[180px]">
                    {referenceImage.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateReference({
                        ...referenceImage,
                        visible: !referenceImage.visible,
                      })
                    }
                    className={`p-1.5 rounded text-xs transition-colors ${
                      referenceImage.visible
                        ? 'text-[#2894a2] bg-[#2894a2]/20'
                        : 'text-[#71675f] hover:text-[#f8f3eb]'
                    }`}
                    title={referenceImage.visible ? 'Hide Overlay' : 'Show Overlay'}
                  >
                    {referenceImage.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateReference(null)}
                    className="p-1.5 text-[#71675f] hover:text-red-400 rounded transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex justify-between text-xs text-[#ded5c9] mb-1">
                  <span>Overlay Opacity</span>
                  <span className="font-mono-numbers">{Math.round(referenceImage.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={1.0}
                  step={0.05}
                  value={referenceImage.opacity}
                  onChange={(e) =>
                    onUpdateReference({
                      ...referenceImage,
                      opacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#2894a2]"
                />
              </div>

              {/* Scale slider */}
              <div>
                <div className="flex justify-between text-xs text-[#ded5c9] mb-1">
                  <span>Image Scale</span>
                  <span className="font-mono-numbers">{Math.round(referenceImage.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.05}
                  value={referenceImage.scale}
                  onChange={(e) =>
                    onUpdateReference({
                      ...referenceImage,
                      scale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#2894a2]"
                />
              </div>

              {/* Position Nudging */}
              <div>
                <div className="text-xs text-[#ded5c9] mb-1.5">Position Offsets (px)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#71675f] block mb-0.5">Offset X</label>
                    <input
                      type="number"
                      value={referenceImage.offsetX}
                      onChange={(e) =>
                        onUpdateReference({
                          ...referenceImage,
                          offsetX: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#171412] border border-[#2e2722] rounded text-xs font-mono-numbers text-[#f8f3eb]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#71675f] block mb-0.5">Offset Y</label>
                    <input
                      type="number"
                      value={referenceImage.offsetY}
                      onChange={(e) =>
                        onUpdateReference({
                          ...referenceImage,
                          offsetY: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-[#171412] border border-[#2e2722] rounded text-xs font-mono-numbers text-[#f8f3eb]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer close */}
          <div className="pt-3 border-t border-[#2e2722] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2894a2] hover:bg-[#207b87] rounded-lg shadow-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
