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

export type WordChartDensity = 'detailed' | 'condensed' | 'ultra';

export const PrintablePatternModal: React.FC<PrintablePatternModalProps> = ({
  isOpen,
  onClose,
  design,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'grid' | 'wordChart'>('both');
  const [showAllRows, setShowAllRows] = useState(true);
  const [density, setDensity] = useState<WordChartDensity>('ultra');
  const [showColorHex, setShowColorHex] = useState(false);
  const [columnsLayout, setColumnsLayout] = useState<'single' | 'two-column'>('two-column');

  const { columns, rows, millimetresPerBead, millimetresPerRow, physicalWidthCm, physicalHeightCm, beadTypeLabel } = design.settings;
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

  // Quick lookup for color key letter (A, B, C...) based on palette frequency
  const colorKeyMap = useMemo(() => {
    const map = new Map<string, string>();
    colorStats.items.forEach((item, idx) => {
      map.set(item.hex.toLowerCase(), String.fromCharCode(65 + idx));
    });
    return map;
  }, [colorStats.items]);

  if (!isOpen) return null;

  const widthMm = (physicalWidthCm ? physicalWidthCm * 10 : columns * (millimetresPerBead || 1.5833)).toFixed(1);
  const heightMm = (physicalHeightCm ? physicalHeightCm * 10 : rows * (millimetresPerRow || 2.2653)).toFixed(1);
  const widthIn = (parseFloat(widthMm) / 25.4).toFixed(2);
  const heightIn = (parseFloat(heightMm) / 25.4).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const displayedRows = showAllRows ? wordChart : wordChart.slice(0, 20);

  const renderRowInstruction = (row: RowInstruction) => {
    return (
      <div
        key={row.rowNumber}
        className={`px-3 py-1.5 flex items-start gap-2.5 text-xs font-mono transition-colors hover:bg-[#faf7f2] ${
          density === 'ultra' ? 'py-1' : 'py-2'
        }`}
      >
        {/* Row Header Badge */}
        <div className="w-18 shrink-0 flex items-center gap-1 font-semibold text-[#1c1917] select-none">
          <span className="text-[11px] font-mono-numbers">R{row.rowNumber}</span>
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold tracking-tight ${
              row.direction === 'L → R'
                ? 'bg-[#e87524]/10 text-[#8c3b20] border border-[#e87524]/20'
                : 'bg-[#2894a2]/10 text-[#1b656f] border border-[#2894a2]/20'
            }`}
            title={row.direction === 'L → R' ? 'Left to right warp pass' : 'Right to left return pass'}
          >
            {row.direction === 'L → R' ? 'L→R' : 'R←L'}
          </span>
        </div>

        {/* Bead Sequence */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 leading-normal">
          {row.items.map((item, idx) => {
            const keyLetter = colorKeyMap.get(item.hex.toLowerCase()) || '';

            if (density === 'ultra') {
              // Super condensed: Color bead circle followed immediately by count (e.g., [●] 4)
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f4eee4]/80 border border-[#ded5c9] text-[#1c1917] text-[11px] font-mono-numbers hover:border-[#8c3b20] transition-colors"
                  title={`${item.count}× ${item.name} (${item.hex}) [Key ${keyLetter}]`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs shrink-0"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="font-bold text-[#1c1917]">{item.count}</span>
                </span>
              );
            }

            if (density === 'condensed') {
              // Compact: Bead dot, count, and color key code (e.g., [●] 4A)
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[#faf7f2] border border-[#e5ded6] text-[#1c1917] text-[11px] font-mono-numbers hover:border-[#8c3b20] transition-colors"
                  title={`${item.count}× ${item.name} (${item.hex})`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs shrink-0"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="font-bold text-[#1c1917]">{item.count}</span>
                  {keyLetter && (
                    <span className="text-[10px] font-sans font-semibold text-[#8c3b20] bg-[#8c3b20]/10 px-1 rounded">
                      {keyLetter}
                    </span>
                  )}
                </span>
              );
            }

            // Detailed (Verbose): Bead dot, count, color name
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#e5ded6] bg-[#faf7f2] text-xs font-mono"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="font-bold text-[#1c1917]">({item.count})</span>
                <span className="text-[#574b43] font-sans text-[11px]">{item.name}</span>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#fcfaf7] text-[#1c1917] rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto printable-area border border-[#d6cebe]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print bg-[#1f1b18] text-[#f8f3eb] px-6 py-3 border-b border-[#2e2722] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#e87524]" />
            <span className="text-sm font-semibold font-cinzel">
              Artisan Pattern & Loom Specification
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Tab */}
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

            {/* Density Selector */}
            <div className="flex items-center gap-1.5 bg-[#171412] px-2 py-1 rounded-lg border border-[#2e2722]">
              <span className="text-[10px] uppercase font-semibold text-[#a3978a] tracking-wider">Density:</span>
              <button
                onClick={() => setDensity('ultra')}
                title="Super-condensed bead dot + number only (minimal paper, saves ink and pages)"
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  density === 'ultra' ? 'bg-[#8c3b20] text-white font-semibold' : 'text-[#a3978a] hover:text-[#f8f3eb]'
                }`}
              >
                ⚡ Ultra
              </button>
              <button
                onClick={() => setDensity('condensed')}
                title="Condensed badge with bead dot, count, and color key letter"
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  density === 'condensed' ? 'bg-[#8c3b20] text-white font-semibold' : 'text-[#a3978a] hover:text-[#f8f3eb]'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => setDensity('detailed')}
                title="Full verbose names"
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  density === 'detailed' ? 'bg-[#8c3b20] text-white font-semibold' : 'text-[#a3978a] hover:text-[#f8f3eb]'
                }`}
              >
                Verbose
              </button>
            </div>

            {/* Layout Toggle */}
            <button
              onClick={() => setColumnsLayout(columnsLayout === 'two-column' ? 'single' : 'two-column')}
              className="px-2.5 py-1 text-xs rounded-md border border-[#2e2722] bg-[#171412] text-[#ded5c9] hover:text-white transition-colors"
              title="Toggle between single column and space-saving two-column sheet format"
            >
              {columnsLayout === 'two-column' ? '2-Columns' : '1-Column'}
            </button>

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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1917] flex items-center gap-2">
                <span>01. Bead Color Palette & Quantity Breakdown</span>
                <span className="text-[10px] font-normal text-[#78716c]">({colorStats.placedCount} total placed beads)</span>
              </h2>
              {density === 'ultra' && (
                <span className="text-[11px] font-semibold text-[#8c3b20] bg-[#8c3b20]/10 px-2 py-0.5 rounded">
                  Super-Condensed Mode Active
                </span>
              )}
            </div>

            {/* In Ultra mode, show a super compact, paper-saving horizontal bead key badge row */}
            {density === 'ultra' ? (
              <div className="border border-[#ded5c9] rounded-lg p-3 bg-white shadow-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {colorStats.items.map((color, idx) => (
                    <div
                      key={color.hex}
                      className="flex items-center gap-2 p-1.5 rounded border border-[#e5ded6] bg-[#faf7f2]"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-xs shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#8c3b20]">{String.fromCharCode(65 + idx)}</span>
                          <span className="text-[11px] font-mono-numbers font-bold text-[#1c1917]">{color.count}</span>
                        </div>
                        <div className="text-[9px] text-[#78716c] truncate">{color.name}</div>
                      </div>
                    </div>
                  ))}
                  {colorStats.emptyCount > 0 && (
                    <div className="flex items-center gap-2 p-1.5 rounded border border-dashed border-[#ded5c9] bg-[#fff9f5]">
                      <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[#c8bfb2] shrink-0" />
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-[#9a3412]">Empty</span>
                          <span className="text-[11px] font-mono-numbers font-bold text-[#9a3412]">{colorStats.emptyCount}</span>
                        </div>
                        <div className="text-[9px] text-[#9a3412]/80">Unfilled</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
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
            )}
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

              {/* Row Grid Container: supports 1-column or 2-column format */}
              <div
                className={`border border-[#ded5c9] rounded-lg overflow-hidden bg-white shadow-sm ${
                  columnsLayout === 'two-column'
                    ? 'grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#ded5c9]'
                    : 'divide-y divide-[#f0eae0]'
                }`}
              >
                {/* Column Split helper */}
                {columnsLayout === 'two-column' ? (
                  <>
                    <div className="divide-y divide-[#f0eae0]">
                      {displayedRows
                        .slice(0, Math.ceil(displayedRows.length / 2))
                        .map((row) => renderRowInstruction(row))}
                    </div>
                    <div className="divide-y divide-[#f0eae0]">
                      {displayedRows
                        .slice(Math.ceil(displayedRows.length / 2))
                        .map((row) => renderRowInstruction(row))}
                    </div>
                  </>
                ) : (
                  displayedRows.map((row) => renderRowInstruction(row))
                )}
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
