import React, { useRef } from 'react';
import { X, FolderOpen, Plus, Copy, Trash2, Upload, FileDown, Check } from 'lucide-react';
import { DesignDocument } from '../types/bead';
import { PRESET_DESIGNS } from '../data/presetDesigns';

interface DesignLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDesignId: string;
  savedDesigns: DesignDocument[];
  onLoadDesign: (design: DesignDocument) => void;
  onCreateNewDesign: () => void;
  onDuplicateDesign: (design: DesignDocument) => void;
  onDeleteDesign: (id: string) => void;
  onImportJson: (file: File) => void;
}

export const DesignLibraryModal: React.FC<DesignLibraryModalProps> = ({
  isOpen,
  onClose,
  currentDesignId,
  savedDesigns,
  onLoadDesign,
  onCreateNewDesign,
  onDuplicateDesign,
  onDeleteDesign,
  onImportJson,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1b18] border border-[#2e2722] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e87524]/10 text-[#e87524] flex items-center justify-center border border-[#e87524]/20">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f8f3eb] font-cinzel">
                Pattern Archive & Library
              </h2>
              <p className="text-xs text-[#a3978a]">
                Load starter templates, manage your sketch archive, or import design JSON.
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

        {/* Action ribbon */}
        <div className="px-6 py-3 bg-[#171412] border-b border-[#2e2722] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onCreateNewDesign();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#e87524] hover:bg-[#d46517] rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Canvas</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#ded5c9] hover:text-[#f8f3eb] bg-[#1f1b18] hover:bg-[#2e2722] border border-[#2e2722] rounded-md transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#e87524]" />
              <span>Import JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <span className="text-xs text-[#71675f]">
            {savedDesigns.length} saved patterns
          </span>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Saved Designs */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524] mb-3">
              Your Studio Sketches
            </h3>

            {savedDesigns.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#2e2722] rounded-lg text-xs text-[#71675f]">
                No custom designs saved yet. Create a pattern or load a starter template!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedDesigns.map((d) => {
                  const isCurrent = d.id === currentDesignId;
                  const placedBeads = d.cells.filter(Boolean).length;
                  return (
                    <div
                      key={d.id}
                      className={`p-3.5 rounded-lg border transition-all text-left relative group ${
                        isCurrent
                          ? 'bg-[#25201c] border-[#e87524]/60 ring-1 ring-[#e87524]/40'
                          : 'bg-[#171412] border-[#2e2722] hover:border-[#483d35]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-[#f8f3eb] truncate">
                            {d.metadata.title || 'Untitled Design'}
                          </h4>
                          <p className="text-xs text-[#a3978a] truncate mt-0.5">
                            {d.metadata.author || 'Artisan'}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#e87524]/20 text-[#e87524] px-1.5 py-0.5 rounded font-mono font-medium shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-[11px] text-[#71675f] flex items-center gap-2">
                        <span className="font-mono-numbers">
                          {d.settings.columns}×{d.settings.rows} beads
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{placedBeads} placed</span>
                      </div>

                      {/* Card actions */}
                      <div className="mt-3 pt-2.5 border-t border-[#2e2722] flex items-center justify-between">
                        <button
                          onClick={() => {
                            onLoadDesign(d);
                            onClose();
                          }}
                          className="text-xs font-semibold text-[#e87524] hover:underline"
                        >
                          {isCurrent ? 'Continue' : 'Load Canvas'}
                        </button>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => onDuplicateDesign(d)}
                            className="p-1 text-[#a3978a] hover:text-[#f8f3eb] transition-colors"
                            title="Duplicate pattern"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDesign(d.id)}
                            className="p-1 text-[#a3978a] hover:text-red-400 transition-colors"
                            title="Delete pattern"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Starter Presets */}
          <div className="pt-4 border-t border-[#2e2722]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e87524] mb-3">
              Starter Master Templates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_DESIGNS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3.5 rounded-lg border border-[#2e2722] bg-[#171412] hover:border-[#483d35] transition-all"
                >
                  <h4 className="font-semibold text-sm text-[#f8f3eb] truncate">
                    {preset.metadata.title}
                  </h4>
                  <p className="text-xs text-[#a3978a] line-clamp-2 mt-1">
                    {preset.metadata.description}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-[#2e2722] flex items-center justify-between">
                    <span className="text-[11px] font-mono-numbers text-[#71675f]">
                      {preset.settings.columns}×{preset.settings.rows} beads
                    </span>
                    <button
                      onClick={() => {
                        onLoadDesign({
                          ...preset,
                          id: `design-${Date.now()}`,
                          metadata: {
                            ...preset.metadata,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          },
                        });
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-[#e87524] hover:bg-[#2e2722] rounded transition-colors"
                    >
                      Load Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
