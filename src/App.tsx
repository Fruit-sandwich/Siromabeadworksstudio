import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { PaletteBar } from './components/PaletteBar';
import { CanvasViewport } from './components/CanvasViewport';
import { CanvasSettingsModal } from './components/CanvasSettingsModal';
import { MetadataModal } from './components/MetadataModal';
import { ValidationModal } from './components/ValidationModal';
import { PrintablePatternModal } from './components/PrintablePatternModal';
import { DesignLibraryModal } from './components/DesignLibraryModal';
import { ReferenceOverlayModal } from './components/ReferenceOverlayModal';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { WeavingCompanionHUD } from './components/WeavingCompanionHUD';
import { loomSounds } from './utils/soundEffects';

import {
  DesignDocument,
  CanvasSettings,
  ToolMode,
  MirrorMode,
  ReferenceImage,
  HistoryEntry,
  BeadColor,
} from './types/bead';
import { PRESET_DESIGNS, DEFAULT_SETTINGS } from './data/presetDesigns';
import { validatePattern } from './utils/validationUtils';
import { PALETTE_PRESETS, buildPaletteColors } from './utils/colorUtils';

const STORAGE_KEY_CURRENT = 'siroma_beadcanvas_current_v2';
const STORAGE_KEY_LIBRARY = 'siroma_beadcanvas_library_v2';

export default function App() {
  // Load saved designs library
  const [savedDesigns, setSavedDesigns] = useState<DesignDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LIBRARY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the saved library has outdated presets with old dimensions, update the presets to new standard
          return parsed.map((item: DesignDocument) => {
            const matchingPreset = PRESET_DESIGNS.find((p) => p.id === item.id);
            if (matchingPreset && (item.settings.columns !== matchingPreset.settings.columns || item.settings.rows !== matchingPreset.settings.rows)) {
              return matchingPreset;
            }
            return item;
          });
        }
      }
    } catch {
      // fallback
    }
    return PRESET_DESIGNS;
  });

  // Current active design document
  const [design, setDesign] = useState<DesignDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.settings && parsed?.cells) {
          if (!parsed.settings.rowNumberingDirection) {
            parsed.settings.rowNumberingDirection = 'bottom-to-top';
          }
          // If this was an untouched preset, sync its dimensions to calibrated 34x62
          const matchingPreset = PRESET_DESIGNS.find((p) => p.id === parsed.id);
          if (matchingPreset && (parsed.settings.columns !== matchingPreset.settings.columns || parsed.settings.rows !== matchingPreset.settings.rows)) {
            return matchingPreset;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return PRESET_DESIGNS[0];
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<HistoryEntry[]>([
    { cells: PRESET_DESIGNS[0].cells },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active drawing tools and settings
  const [activeColor, setActiveColor] = useState<string>(() => {
    return design.palette[0]?.hex || '#f28c28';
  });
  const [currentTool, setCurrentTool] = useState<ToolMode>('paint');
  const [eraserRadius, setEraserRadius] = useState<number>(1);
  const [mirrorMode, setMirrorMode] = useState<MirrorMode>('none');
  const [zoom, setZoom] = useState<number>(1.0);
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null);

  // Modal open states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Interactive Weaving Companion State
  const [isWeavingMode, setIsWeavingMode] = useState(false);
  const [activeWeaveRow, setActiveWeaveRow] = useState<number>(1);
  const [autoCenterWeaveRow, setAutoCenterWeaveRow] = useState(true);
  const [weavingSoundEnabled, setWeavingSoundEnabled] = useState(true);
  const [completedWeaveRows, setCompletedWeaveRows] = useState<number[]>([]);

  // Sync soundEnabled with loomSounds instance
  useEffect(() => {
    loomSounds.enabled = weavingSoundEnabled;
  }, [weavingSoundEnabled]);

  // Load saved weaving progress for the active design
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`siroma_weave_progress_${design.id || 'default'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.activeRow === 'number' && parsed.activeRow >= 1 && parsed.activeRow <= design.settings.rows) {
          setActiveWeaveRow(parsed.activeRow);
        } else {
          setActiveWeaveRow(1);
        }
        if (Array.isArray(parsed.completedRows)) {
          setCompletedWeaveRows(parsed.completedRows);
        } else {
          setCompletedWeaveRows([]);
        }
      } else {
        setActiveWeaveRow(1);
        setCompletedWeaveRows([]);
      }
    } catch {
      setActiveWeaveRow(1);
      setCompletedWeaveRows([]);
    }
  }, [design.id, design.settings.rows]);

  // Persist weaving progress
  useEffect(() => {
    try {
      localStorage.setItem(
        `siroma_weave_progress_${design.id || 'default'}`,
        JSON.stringify({
          activeRow: activeWeaveRow,
          completedRows: completedWeaveRows,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch {
      // storage full or disabled
    }
  }, [design.id, activeWeaveRow, completedWeaveRows]);

  const handleToggleCompletedWeaveRow = useCallback((rowNum: number) => {
    setCompletedWeaveRows((prev) =>
      prev.includes(rowNum) ? prev.filter((r) => r !== rowNum) : [...prev, rowNum]
    );
  }, []);

  const handleResetWeavingProgress = useCallback(() => {
    setCompletedWeaveRows([]);
    setActiveWeaveRow(1);
  }, []);

  // Save current design to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(design));
    } catch {
      // storage full or disabled
    }
  }, [design]);

  // Save library to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LIBRARY, JSON.stringify(savedDesigns));
    } catch {
      // storage full or disabled
    }
  }, [savedDesigns]);

  // Real-time Pattern Validation
  const validation = useMemo(() => {
    return validatePattern(design);
  }, [design]);

  // Color count lookup for PaletteBar badges
  const colorCountsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const cell of design.cells) {
      if (cell) {
        const h = cell.toLowerCase();
        map.set(h, (map.get(h) || 0) + 1);
      }
    }
    return map;
  }, [design.cells]);

  // Push new state to history stack
  const pushHistory = useCallback(
    (newCells: (string | null)[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        // Limit history to 30 states to keep memory light
        if (sliced.length >= 30) {
          sliced.shift();
        }
        return [...sliced, { cells: newCells }];
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex]
  );

  // Apply cell updates (e.g. from paint, line, fill, erase)
  const handleApplyCellChange = useCallback(
    (changes: { index: number; color: string | null }[]) => {
      if (changes.length === 0) return;

      setDesign((prev) => {
        const newCells = [...prev.cells];
        let hasDifference = false;

        for (const { index, color } of changes) {
          if (index >= 0 && index < newCells.length) {
            if (newCells[index] !== color) {
              newCells[index] = color;
              hasDifference = true;
            }
          }
        }

        if (!hasDifference) return prev;

        pushHistory(newCells);
        return {
          ...prev,
          cells: newCells,
          metadata: {
            ...prev.metadata,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [pushHistory]
  );

  // Eyedropper action: select clicked bead's color
  const handleEyedropColor = useCallback(
    (sampledColor: string) => {
      const normalized = sampledColor.toLowerCase();
      setActiveColor(normalized);
      // Auto-switch back to paint tool for fluid workflow
      setCurrentTool('paint');

      // If color not in active palette, add it!
      const exists = design.palette.some((p) => p.hex.toLowerCase() === normalized);
      if (!exists && design.palette.length < 32) {
        setDesign((prev) => ({
          ...prev,
          palette: buildPaletteColors([...prev.palette.map((p) => p.hex), normalized]),
        }));
      }
    },
    [design.palette]
  );

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetCells = history[targetIndex].cells;
      setHistoryIndex(targetIndex);
      setDesign((prev) => ({
        ...prev,
        cells: [...targetCells],
      }));
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetCells = history[targetIndex].cells;
      setHistoryIndex(targetIndex);
      setDesign((prev) => ({
        ...prev,
        cells: [...targetCells],
      }));
    }
  }, [historyIndex, history]);

  // Clear Canvas
  const handleClearCanvas = useCallback(() => {
    const isConfirmed = window.confirm(
      'Are you sure you want to clear all beads from the virtual canvas?'
    );
    if (!isConfirmed) return;

    const clearedCells = new Array(design.settings.columns * design.settings.rows).fill(null);
    pushHistory(clearedCells);
    setDesign((prev) => ({
      ...prev,
      cells: clearedCells,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, [design.settings.columns, design.settings.rows, pushHistory]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in inputs or textareas
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Tool switches
      switch (e.key.toLowerCase()) {
        case 'b':
        case 'p':
          setCurrentTool('paint');
          break;
        case 'e':
          setCurrentTool('erase');
          break;
        case 'i':
          setCurrentTool('eyedropper');
          break;
        case 'g':
          setCurrentTool('fill');
          break;
        case 'l':
          setCurrentTool('line');
          break;
        case 'h':
          setCurrentTool('pan');
          break;
        case 'm': {
          const modes: MirrorMode[] = ['none', 'horizontal', 'vertical', 'both'];
          const next = (modes.indexOf(mirrorMode) + 1) % modes.length;
          setMirrorMode(modes[next]);
          break;
        }
        case '+':
        case '=':
          setZoom((z) => Math.min(8.0, z * 1.2));
          break;
        case '-':
        case '_':
          setZoom((z) => Math.max(0.5, z / 1.2));
          break;
        case '0':
          setZoom(1.0);
          break;
        case '[':
          setEraserRadius((r) => Math.max(1, r - 1));
          break;
        case ']':
          setEraserRadius((r) => Math.min(6, r + 1));
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          if (currentTool === 'erase') {
            setEraserRadius(parseInt(e.key, 10));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, mirrorMode, currentTool]);

  // Palette modifications
  const handleAddPaletteColor = (hex: string) => {
    const normalized = hex.toLowerCase();
    if (design.palette.some((p) => p.hex.toLowerCase() === normalized)) {
      setActiveColor(normalized);
      return;
    }
    const updatedHexes = [...design.palette.map((p) => p.hex), normalized];
    const newPalette = buildPaletteColors(updatedHexes);
    setDesign((prev) => ({ ...prev, palette: newPalette }));
    setActiveColor(normalized);
  };

  const handleRemovePaletteColor = (hex: string) => {
    const filtered = design.palette.filter((p) => p.hex.toLowerCase() !== hex.toLowerCase());
    if (filtered.length === 0) return;
    setDesign((prev) => ({ ...prev, palette: filtered }));
    if (activeColor.toLowerCase() === hex.toLowerCase()) {
      setActiveColor(filtered[0].hex);
    }
  };

  const handleApplyPalettePreset = (presetKey: string) => {
    const preset = PALETTE_PRESETS[presetKey];
    if (!preset) return;
    const newPalette = buildPaletteColors(preset.colors);
    setDesign((prev) => ({ ...prev, palette: newPalette }));
    setActiveColor(newPalette[0].hex);
  };

  // Add unsupported colors to palette helper
  const handleAddUnsupportedToPalette = () => {
    if (validation.unsupportedColors.length === 0) return;
    const currentHexes = design.palette.map((p) => p.hex.toLowerCase());
    const combined = Array.from(new Set([...currentHexes, ...validation.unsupportedColors])).slice(
      0,
      32
    );
    setDesign((prev) => ({
      ...prev,
      palette: buildPaletteColors(combined),
    }));
  };

  // Canvas Settings Update (with grid dimension migration)
  const handleSaveSettings = (newSettings: CanvasSettings) => {
    setDesign((prev) => {
      const oldCols = prev.settings.columns;
      const oldRows = prev.settings.rows;
      const newCols = newSettings.columns;
      const newRows = newSettings.rows;

      if (oldCols === newCols && oldRows === newRows) {
        return { ...prev, settings: newSettings };
      }

      // Re-map cells into new grid dimensions
      const migratedCells: (string | null)[] = new Array(newCols * newRows).fill(null);
      for (let r = 0; r < Math.min(oldRows, newRows); r++) {
        for (let c = 0; c < Math.min(oldCols, newCols); c++) {
          const oldIdx = r * oldCols + c;
          const newIdx = r * newCols + c;
          migratedCells[newIdx] = prev.cells[oldIdx] || null;
        }
      }

      pushHistory(migratedCells);
      return {
        ...prev,
        settings: newSettings,
        cells: migratedCells,
      };
    });
  };

  // Metadata update
  const handleSaveMetadata = (newMeta: Partial<DesignDocument['metadata']>) => {
    setDesign((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...newMeta,
      },
    }));

    // Update in saved library if present
    setSavedDesigns((prev) =>
      prev.map((d) =>
        d.id === design.id
          ? {
              ...d,
              metadata: {
                ...d.metadata,
                ...newMeta,
              },
            }
          : d
      )
    );
  };

  // Design library actions
  const handleLoadDesign = (loaded: DesignDocument) => {
    setDesign(loaded);
    setHistory([{ cells: [...loaded.cells] }]);
    setHistoryIndex(0);
    if (loaded.palette.length > 0) {
      setActiveColor(loaded.palette[0].hex);
    }
  };

  const handleCreateNewDesign = () => {
    const newDoc: DesignDocument = {
      id: `design-${Date.now()}`,
      schemaVersion: '0.1.0',
      metadata: {
        title: 'New Beadwork Sketch',
        author: design.metadata.author || 'Artisan',
        description: 'New design canvas.',
        materialsNotes: 'Miyuki Delica 11/0, Nymo thread.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        appVersion: '0.1.0',
      },
      settings: { ...DEFAULT_SETTINGS },
      palette: buildPaletteColors(PALETTE_PRESETS.warm_earth.colors),
      cells: new Array(DEFAULT_SETTINGS.columns * DEFAULT_SETTINGS.rows).fill(null),
    };

    setDesign(newDoc);
    setSavedDesigns((prev) => [newDoc, ...prev]);
    setHistory([{ cells: newDoc.cells }]);
    setHistoryIndex(0);
    setActiveColor(newDoc.palette[0].hex);
  };

  const handleDuplicateDesign = (source: DesignDocument) => {
    const copy: DesignDocument = {
      ...source,
      id: `design-${Date.now()}`,
      metadata: {
        ...source.metadata,
        title: `${source.metadata.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      cells: [...source.cells],
    };
    setSavedDesigns((prev) => [copy, ...prev]);
  };

  const handleDeleteDesign = (id: string) => {
    if (savedDesigns.length <= 1) {
      alert('You must keep at least one design in your library.');
      return;
    }
    const filtered = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(filtered);
    if (design.id === id) {
      handleLoadDesign(filtered[0]);
    }
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Map imported schema to DesignDocument
        const importedCols = parsed.canvas_dimensions?.columns || parsed.settings?.columns || 36;
        const importedRows = parsed.canvas_dimensions?.rows || parsed.settings?.rows || 49;
        const importedCells = parsed.cell_colours || parsed.cells || new Array(importedCols * importedRows).fill(null);

        let importedPalette: BeadColor[] = [];
        if (Array.isArray(parsed.palette)) {
          if (typeof parsed.palette[0] === 'string') {
            importedPalette = buildPaletteColors(parsed.palette);
          } else {
            importedPalette = parsed.palette.map((p: any) => ({
              hex: p.hex || '#111111',
              name: p.name || 'Imported Bead',
              symbol: p.symbol || '●',
            }));
          }
        } else {
          importedPalette = buildPaletteColors(PALETTE_PRESETS.warm_earth.colors);
        }

        const importedDoc: DesignDocument = {
          id: `import-${Date.now()}`,
          schemaVersion: '0.1.0',
          metadata: {
            title: parsed.title || parsed.metadata?.title || file.name.replace(/\.json$/i, ''),
            author: parsed.author || parsed.metadata?.author || 'Imported Artisan',
            description: parsed.description || parsed.metadata?.description || 'Imported from JSON',
            materialsNotes: parsed.materials_notes || parsed.metadata?.materialsNotes || '',
            createdAt: parsed.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            appVersion: '0.1.0',
          },
          settings: {
            ...DEFAULT_SETTINGS,
            columns: importedCols,
            rows: importedRows,
            millimetresPerBead: parsed.canvas_dimensions?.physical_scale_mm_per_bead || 1.6,
          },
          palette: importedPalette,
          cells: importedCells,
        };

        setSavedDesigns((prev) => [importedDoc, ...prev]);
        handleLoadDesign(importedDoc);
        setIsLibraryOpen(false);
      } catch (err) {
        alert('Failed to parse JSON file. Please ensure it is a valid Beaded Canvas design file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#171412] text-[#f8f3eb] overflow-hidden select-none">
      {/* 1. Header (3-zone Top Bar Contract) */}
      <Header
        design={design}
        validation={validation}
        isWeavingMode={isWeavingMode}
        onToggleWeavingMode={() => {
          setIsWeavingMode((prev) => {
            const next = !prev;
            if (next) {
              setCurrentTool('pan');
            }
            return next;
          });
        }}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMetadata={() => setIsMetadataOpen(true)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main Studio Body: Toolbar + Canvas Viewport */}
      <div className="flex flex-1 min-h-0 relative">
        <Toolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          activeColor={activeColor}
          eraserRadius={eraserRadius}
          onChangeEraserRadius={setEraserRadius}
          mirrorMode={mirrorMode}
          onChangeMirrorMode={setMirrorMode}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClearCanvas={handleClearCanvas}
          onOpenReferenceModal={() => setIsReferenceOpen(true)}
          hasReferenceImage={!!referenceImage}
          referenceVisible={referenceImage?.visible ?? false}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(8.0, z * 1.25))}
          onZoomOut={() => setZoom((z) => Math.max(0.5, z / 1.25))}
          onResetZoom={() => setZoom(1.0)}
          onFitCanvas={() => {
            // Fit to viewport calculation
            const availableW = window.innerWidth - 64;
            const availableH = window.innerHeight - 120;
            const canvasW = design.settings.columns * design.settings.cellSpacing;
            const canvasH = design.settings.rows * design.settings.cellSpacing;
            const fitScale = Math.min(availableW / canvasW, availableH / canvasH) * 0.9;
            setZoom(Math.max(0.5, Math.min(4.0, fitScale)));
          }}
        />

        {/* Central interactive canvas */}
        <main className="flex-1 relative overflow-hidden">
          <CanvasViewport
            cells={design.cells}
            settings={design.settings}
            activeColor={activeColor}
            currentTool={currentTool}
            eraserRadius={eraserRadius}
            onChangeEraserRadius={setEraserRadius}
            mirrorMode={mirrorMode}
            referenceImage={referenceImage}
            zoom={zoom}
            onZoomChange={setZoom}
            onApplyCellChange={handleApplyCellChange}
            onEyedropColor={handleEyedropColor}
            isWeavingMode={isWeavingMode}
            activeWeaveRow={activeWeaveRow}
            completedWeaveRows={completedWeaveRows}
            onSelectWeaveRow={setActiveWeaveRow}
            autoCenterWeaveRow={autoCenterWeaveRow}
          />
        </main>
      </div>

      {/* 3. Bottom Shelf: Palette Bar or Weaving Companion HUD */}
      {isWeavingMode ? (
        <WeavingCompanionHUD
          design={design}
          activeRow={activeWeaveRow}
          completedRows={completedWeaveRows}
          onSelectRow={setActiveWeaveRow}
          onToggleCompletedRow={handleToggleCompletedWeaveRow}
          onResetProgress={handleResetWeavingProgress}
          onExitWeavingMode={() => setIsWeavingMode(false)}
          soundEnabled={weavingSoundEnabled}
          onToggleSound={() => setWeavingSoundEnabled((s) => !s)}
          autoCenter={autoCenterWeaveRow}
          onToggleAutoCenter={() => setAutoCenterWeaveRow((c) => !c)}
        />
      ) : (
        <PaletteBar
          palette={design.palette}
          activeColor={activeColor}
          onSelectColor={setActiveColor}
          onAddColor={handleAddPaletteColor}
          onRemoveColor={handleRemovePaletteColor}
          onApplyPreset={handleApplyPalettePreset}
          colorCounts={colorCountsMap}
        />
      )}

      {/* Modals & Drawers */}
      <CanvasSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={design.settings}
        onSaveSettings={handleSaveSettings}
      />

      <MetadataModal
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        metadata={design.metadata}
        onSaveMetadata={handleSaveMetadata}
      />

      <ValidationModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        validation={validation}
        design={design}
        onAddUnsupportedToPalette={handleAddUnsupportedToPalette}
      />

      <PrintablePatternModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        design={design}
      />

      <DesignLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentDesignId={design.id}
        savedDesigns={savedDesigns}
        onLoadDesign={handleLoadDesign}
        onCreateNewDesign={handleCreateNewDesign}
        onDuplicateDesign={handleDuplicateDesign}
        onDeleteDesign={handleDeleteDesign}
        onImportJson={handleImportJson}
      />

      <ReferenceOverlayModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
        referenceImage={referenceImage}
        onUpdateReference={setReferenceImage}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        design={design}
        onOpenPrint={() => setIsPrintOpen(true)}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
