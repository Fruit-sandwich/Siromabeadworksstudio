import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { DesignMetadata } from '../types/bead';

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DesignMetadata;
  onSaveMetadata: (newMeta: Partial<DesignMetadata>) => void;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onSaveMetadata,
}) => {
  const [title, setTitle] = useState(metadata.title);
  const [author, setAuthor] = useState(metadata.author);
  const [description, setDescription] = useState(metadata.description);
  const [materialsNotes, setMaterialsNotes] = useState(metadata.materialsNotes);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMetadata({
      title: title.trim() || 'Untitled Beadwork Canvas',
      author: author.trim() || 'Artisan',
      description: description.trim(),
      materialsNotes: materialsNotes.trim(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1b18] border border-[#2e2722] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e87524]/10 text-[#e87524] flex items-center justify-center border border-[#e87524]/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f8f3eb] font-cinzel">
                Design Documentation & Notes
              </h2>
              <p className="text-xs text-[#a3978a]">
                Title, maker credits, stitch method, and physical material specifications.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-[#ded5c9] mb-1">
              Pattern Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Desert Sunburst Medallion"
              className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-[#f8f3eb] focus:border-[#e87524] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#ded5c9] mb-1">
              Artisan / Maker / Studio
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Jane Doe, Studio Weaver"
              className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-[#f8f3eb] focus:border-[#e87524] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#ded5c9] mb-1">
              Design Description & Concept
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Inspiration, geometric symbolism, intended object (bracelet, tapestry, amulet bag)..."
              className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-[#f8f3eb] focus:border-[#e87524] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#ded5c9] mb-1">
              Materials, Threads & Tooling Notes
            </label>
            <textarea
              value={materialsNotes}
              onChange={(e) => setMaterialsNotes(e.target.value)}
              rows={3}
              placeholder="e.g., Miyuki Delica 11/0, FireLine 6lb smoke thread, beading needle #12, wire guard findings..."
              className="w-full px-3 py-2 bg-[#171412] border border-[#2e2722] rounded-lg text-[#f8f3eb] focus:border-[#e87524] outline-none resize-none text-xs font-mono"
            />
          </div>

          <div className="pt-3 border-t border-[#2e2722] flex justify-end gap-3">
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
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
