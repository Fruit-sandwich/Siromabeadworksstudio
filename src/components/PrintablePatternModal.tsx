import React, { useState, useMemo } from 'react';
import { X, Printer, ListOrdered, Grid, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { DesignDocument } from '../types/bead';
import { generateArtisanWordChart, RowInstruction } from '../utils/exportUtils';
import { getContrastColor } from '../utils/colorUtils';

interface PrintablePatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: DesignDocument;
}

export const PrintablePatternModal: React.FC<PrintablePatternModalProps> = ({
  isOpen,
  onClose,
  design,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'grid' | 'wordChart'>('both');
  const [showAllRows, setShowAllRows] = useState(false);

  const { columns, rows, millimetresPerBead, beadTypeLabel } = design.settings;
  const totalCells = columns * rows;

  // Calculate bead usage
  const colorStats = useMemo(() => {
    const counts = new Map<string, number>();
    let placedCount = 0;

    for (const cell of design.cells) {
      if (cell) {
        placedCount++;
        const hex = cell.toLowerCase();
        counts.set(hex, (counts.get(hex) || 0) + 1);
      }
    }

    const items = design.palette.map((p) => {
      const count = counts.get(p.hex.toLowerCase()) || 0;
      return {
        ...p,
        count,
        percentage: placedCount > 0 ? (count / placedCount) * 100 : 0,
        // Approx ~180-200 beads per gram for 11/0 delicas
        gramsEstimate: (count / 190).toFixed(1),
      };
    }).sort((a, b) => b.count - a.count);

    return {
      placedCount,
      emptyCount: totalCells - placedCount,
      items,
    };
  }, [design.cells, design.palette, totalCells]);

  // Word chart
  const wordChart = useMemo(() => {
    return generateArtisanWordChart(design);
  }, [design]);

  if (!isOpen) return null;

  const widthMm = (columns * millimetresPerBead).toFixed(1);
  const heightMm = (rows * millimetresPerBead).toFixed(1);
  const widthIn = ((columns * millimetresPerBead) / 25.4).toFixed(2);
  const heightIn = ((rows * millimetresPerBead) / 25.4).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const displayedRows = showAllRows ? wordChart : wordChart.slice(0, 20);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#fcfaf7] text-[#1c1917] rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto printable-area border border-[#d6cebe]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print bg-[#1f1b18] text-[#f8f3eb] px-6 py-3 border-b border-[#2e2722] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#e87524]" />
            <span className="text-sm font-semibold font-cinzel">
              Artisan Pattern & Physical Loom Specification
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#171412] p-0.5 rounded-lg border border-[#2e2722]">
              <button
                onClick={() => setActiveTab('both')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  activeTab === 'both' ? 'bg-[#e87524] text-white' : 'text-[#a3978a] hover:text-[#ded5c9]'
                }`}
              >
                Full Guide
              </button>
              <button
                onClick={() => setActiveTab('grid')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  activeTab === 'grid' ? 'bg-[#e87524] text-white' : 'text-[#a3978a] hover:text-[#ded5c9]'
                }`}
              >
                Chart Grid
              </button>
              <button
                onClick={() => setActiveTab('wordChart')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  activeTab === 'wordChart' ? 'bg-[#e87524] text-white' : 'text-[#a3978a] hover:text-[#ded5c9]'
                }`}
              >
                Word Chart
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#e87524] hover:bg-[#d46517] rounded-md shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#a3978a] hover:text-[#f8f3eb] p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body Content */}
        <div className="p-8 overflow-y-auto space-y-8 print:p-0 print:overflow-visible">
          {/* Header Block */}
          <div className="border-b-2 border-[#1c1917] pb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8c3b20] block mb-1">
                  BEADWORK LOOM & PEYOTE PRODUCTION SPECIFICATION
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-[#1c1917] tracking-tight">
                  {design.metadata.title}
                </h1>
                <p className="text-xs text-[#574b43] mt-1">
                  Artisan / Designer: <span className="font-medium text-[#1c1917]">{design.metadata.author || 'Independent Maker'}</span> · Date:{' '}
                  {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-[#574b43]">
                <div className="font-mono-numbers font-semibold text-base text-[#1c1917]">
                  {columns} × {rows} Beads
                </div>
                <div>{widthMm} mm × {heightMm} mm ({widthIn}″ × {heightIn}″)</div>
                <div className="text-[11px] text-[#8c3b20]">{beadTypeLabel}</div>
              </div>
            </div>

            {design.metadata.description && (
              <p className="text-xs italic text-[#44403c] mt-3 border-t border-[#e7e5e4] pt-2">
                "{design.metadata.description}"
              </p>
            )}

            {design.metadata.materialsNotes && (
              <div className="mt-2 text-[11px] bg-[#f5f0eb] p-2.5 rounded border border-[#e5ded6] text-[#292524]">
                <span className="font-semibold text-[#8c3b20]">Materials & Tooling: </span>
                {design.metadata.materialsNotes}
              </div>
            )}
          </div>

          {/* Color Key & Legend Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1917] mb-3 flex items-center gap-2">
              <span>01. Bead Color Palette & Quantity Breakdown</span>
              <span className="text-[10px] font-normal text-[#78716c]">({colorStats.placedCount} total placed beads)</span>
            </h2>

            <div className="border border-[#ded5c9] rounded-lg overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f4eee4] border-b border-[#ded5c9] text-[#574b43] text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2 px-3">Key</th>
                    <th className="py-2 px-3">Symbol</th>
                    <th className="py-2 px-3">Bead Color Name</th>
                    <th className="py-2 px-3">Hex Code</th>
                    <th className="py-2 px-3 text-right">Bead Count</th>
                    <th className="py-2 px-3 text-right">Pattern %</th>
                    <th className="py-2 px-3 text-right">Est. Grams</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae0] font-mono-numbers">
                  {colorStats.items.map((color, idx) => (
                    <tr key={color.hex} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#faf7f2]'}>
                      <td className="py-2 px-3 font-medium text-[#1c1917]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/30 shadow-inner block"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-sans text-[11px]">{String.fromCharCode(65 + idx)}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-semibold text-center font-sans text-sm">
                        {color.symbol || '●'}
                      </td>
                      <td className="py-2 px-3 font-sans font-medium text-[#1c1917]">
                        {color.name}
                      </td>
                      <td className="py-2 px-3 text-[#78716c] uppercase text-[11px]">
                        {color.hex}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-[#1c1917]">
                        {color.count.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-[#574b43]">
                        {color.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-right text-[#78716c]">
                        ~{color.gramsEstimate}g
                      </td>
                    </tr>
                  ))}
                  {colorStats.emptyCount > 0 && (
                    <tr className="bg-[#fff9f5] text-[#9a3412]">
                      <td className="py-2 px-3">
                        <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[#c8bfb2] inline-block" />
                      </td>
                      <td className="py-2 px-3 text-center">-</td>
                      <td className="py-2 px-3 font-sans italic">Unfilled / Empty Cells</td>
                      <td className="py-2 px-3 text-[11px]">-</td>
                      <td className="py-2 px-3 text-right font-semibold">{colorStats.emptyCount}</td>
                      <td className="py-2 px-3 text-right">{((colorStats.emptyCount / totalCells) * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Grid Chart (Shown if activeTab is both or grid) */}
          {(activeTab === 'both' || activeTab === 'grid') && (
            <div className="break-before-page">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1917]">
                  02. Visual Beadwork Grid Chart
                </h2>
                <span className="text-[11px] text-[#78716c]">
                  {design.settings.rowNumberingDirection !== 'top-to-bottom'
                    ? `Rows numbered Row 1 (bottom) to Row ${rows} (top) · Loom Standard`
                    : `Rows numbered Row 1 (top) to Row ${rows} (bottom)`}
                </span>
              </div>

              <div className="border border-[#ded5c9] rounded-lg p-4 bg-white overflow-x-auto shadow-sm flex flex-col items-center">
                {/* Column header indices */}
                <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
                  {Array.from({ length: columns }, (_, c) => (
                    <div
                      key={c}
                      className="text-[8px] font-mono-numbers text-[#78716c] text-center"
                      style={{ width: '12px' }}
                    >
                      {(c + 1) % 5 === 0 || c === 0 || c === columns - 1 ? c + 1 : ''}
                    </div>
                  ))}
                </div>

                {/* Rows with row number */}
                {Array.from({ length: rows }, (_, r) => {
                  const isBottomUp = design.settings.rowNumberingDirection !== 'top-to-bottom';
                  const rowLabel = isBottomUp ? rows - r : r + 1;
                  return (
                    <div key={r} className="flex items-center">
                      <span className="text-[8px] font-mono-numbers text-[#78716c] w-7 text-right pr-1 select-none">
                        {rowLabel === 1 || rowLabel % 5 === 0 || rowLabel === rows ? rowLabel : ''}
                      </span>
                      <div className="flex border-b border-r border-[#ded5c9]">
                        {Array.from({ length: columns }, (_, c) => {
                          const idx = r * columns + c;
                          const cellColor = design.cells[idx];
                          return (
                            <div
                              key={c}
                              className="w-3 h-3 border-t border-l border-[#ded5c9] flex items-center justify-center relative"
                              style={{
                                backgroundColor: cellColor || '#f4eee4',
                              }}
                            >
                              {!cellColor && (
                                <div className="w-1 h-1 rounded-full bg-[#c8bfb2]" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row-by-Row Word Chart (Shown if activeTab is both or wordChart) */}
          {(activeTab === 'both' || activeTab === 'wordChart') && (
            <div className="break-before-page pt-4 border-t border-[#ded5c9]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1917]">
                    03. Artisan Row-by-Row Instruction Chart
                  </h2>
                  <p className="text-[11px] text-[#78716c]">
                    {design.settings.rowNumberingDirection !== 'top-to-bottom'
                      ? 'Loom weaving sequence: starts at Row 1 (bottom warp row) and progresses upwards row-by-row.'
                      : 'Sequential bead counts per row from top to bottom.'}
                  </p>
                </div>

                <div className="no-print">
                  {wordChart.length > 20 && (
                    <button
                      onClick={() => setShowAllRows(!showAllRows)}
                      className="flex items-center gap-1 text-xs text-[#8c3b20] font-medium hover:underline"
                    >
                      <span>{showAllRows ? 'Show Fewer Rows' : `Show All ${wordChart.length} Rows`}</span>
                      {showAllRows ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="border border-[#ded5c9] rounded-lg overflow-hidden bg-white shadow-sm divide-y divide-[#f0eae0]">
                {displayedRows.map((row) => (
                  <div key={row.rowNumber} className="p-2.5 flex items-start gap-4 text-xs font-mono">
                    <div className="w-24 shrink-0 font-semibold text-[#1c1917]">
                      Row {row.rowNumber} <span className="text-[#8c3b20] font-sans text-[11px]">({row.direction})</span>:
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {row.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#e5ded6] bg-[#faf7f2]"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: item.hex }}
                          />
                          <span className="font-bold text-[#1c1917]">({item.count})</span>
                          <span className="text-[#574b43] font-sans text-[11px]">{item.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!showAllRows && wordChart.length > 20 && (
                <div className="no-print text-center pt-3">
                  <button
                    onClick={() => setShowAllRows(true)}
                    className="text-xs text-[#8c3b20] font-medium hover:underline"
                  >
                    View remaining {wordChart.length - 20} rows...
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer certification */}
          <div className="pt-6 border-t border-[#ded5c9] text-center text-[10px] text-[#78716c] font-sans">
            Generated with Siroma Beadworks Studio · Artisan Beadwork Loom & Peyote Specification
          </div>
        </div>
      </div>
    </div>
  );
};
