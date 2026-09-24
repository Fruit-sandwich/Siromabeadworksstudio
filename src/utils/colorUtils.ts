import { BeadColor } from '../types/bead';

export const PALETTE_PRESETS: Record<string, { label: string; colors: string[] }> = {
  jaguar_loom: {
    label: 'Jaguar Loom (Siroma Master)',
    colors: ['#ea6a1a', '#111111', '#f4eee4', '#2a8742', '#ffffff', '#8c3b20'],
  },
  warm_earth: {
    label: 'Warm Earth',
    colors: ['#f28c28', '#111111', '#f4eee4', '#226b3a', '#8c3b20', '#d9b44a'],
  },
  classic_beadwork: {
    label: 'Classic Beadwork',
    colors: ['#111111', '#f4eee4', '#d9342b', '#1f5aa6', '#e0a91b', '#23834a'],
  },
  monochrome: {
    label: 'Monochrome',
    colors: ['#111111', '#555555', '#999999', '#d9d2c8', '#f4eee4'],
  },
  southwest_sky: {
    label: 'Turquoise & Copper',
    colors: ['#2894a2', '#e87524', '#f4eee4', '#111111', '#c84b31', '#d4af37', '#1a4958'],
  },
};

export const COLOR_NAMES: Record<string, string> = {
  '#f28c28': 'Tangerine Opal',
  '#111111': 'Jet Black',
  '#f4eee4': 'Ivory Alabaster',
  '#226b3a': 'Forest Green',
  '#8c3b20': 'Terracotta Rust',
  '#d9b44a': 'Harvest Ochre',
  '#d9342b': 'Ceramic Scarlet',
  '#1f5aa6': 'Lapis Cobalt',
  '#e0a91b': 'Sunburst Gold',
  '#23834a': 'Pine Jade',
  '#555555': 'Charcoal Slate',
  '#999999': 'Pewter Gray',
  '#d9d2c8': 'Bone Linen',
  '#2894a2': 'Turquoise Matrix',
  '#e87524': 'Copper Ember',
  '#c84b31': 'Desert Clay',
  '#d4af37': 'Antique Brass',
  '#1a4958': 'Deep Teal',
  '#ffffff': 'Pure White',
  '#000000': 'Onyx Black',
};

// Symbols for artisan pattern charts (cross-stitch / bead symbols)
const SYMBOLS = ['●', '▲', '■', '◆', '✕', '✚', '★', '✿', '◉', '◈', '✦', '▲', '▼', '◀', '▶', '⬟', '✪', '✱', '✢', '❖'];

export function getColorName(hex: string): string {
  const normalized = hex.toLowerCase();
  if (COLOR_NAMES[normalized]) return COLOR_NAMES[normalized];
  
  // Approximate color family
  const rgb = hexToRgb(normalized);
  if (!rgb) return normalized.toUpperCase();

  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  if (d < 20) {
    if (max > 220) return 'Chalk White';
    if (max > 160) return 'Silver Mist';
    if (max > 90) return 'Stone Gray';
    if (max > 40) return 'Charcoal';
    return 'Jet Black';
  }

  if (r > g && r > b) {
    if (g > 150 && b < 100) return 'Amber Gold';
    if (g > 80 && b < 60) return 'Canyon Rust';
    if (b > 100) return 'Rose Berry';
    return 'Carmine Red';
  }
  if (g > r && g > b) {
    if (b > 100) return 'Aquamarine';
    return 'Moss Green';
  }
  if (b > r && b > g) {
    if (r > 100) return 'Indigo Violet';
    return 'Cerulean Blue';
  }

  return normalized.toUpperCase();
}

export function buildPaletteColors(hexArray: string[]): BeadColor[] {
  return hexArray.map((hex, idx) => ({
    hex: hex.toLowerCase(),
    name: getColorName(hex),
    symbol: SYMBOLS[idx % SYMBOLS.length],
  }));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  // Standard luminance formula
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 128 ? '#171412' : '#ffffff';
}

/**
 * Detects if a bead color is white or near-white so it can be rendered with a subtle stroke
 * against a white canvas background, preventing it from disappearing.
 */
export function isWhiteBead(hex: string | null | undefined): boolean {
  if (!hex) return false;
  const clean = hex.trim().toLowerCase();
  if (clean === '#ffffff' || clean === '#fff' || clean === 'white') return true;
  const rgb = hexToRgb(clean);
  if (!rgb) return false;
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 238;
}

export const BEAD_STANDARDS = [
  { name: 'Siroma Tapestry 6cm × 11cm (34×62)', mm: 1.76, category: 'Artisan Tapestry' },
  { name: 'Miyuki Delica 11/0 (Cylinder)', mm: 1.6, category: 'Precision Cylinder' },
  { name: 'Toho Treasures 11/0 (Cylinder)', mm: 1.65, category: 'Precision Cylinder' },
  { name: 'Round Seed Bead 11/0 (Czech)', mm: 2.1, category: 'Round Seed' },
  { name: 'Round Seed Bead 8/0', mm: 3.0, category: 'Round Seed' },
  { name: 'Round Seed Bead 6/0', mm: 4.0, category: 'Round Seed' },
  { name: 'Pony Bead (Standard Craft)', mm: 6.0, category: 'Large Craft' },
  { name: 'Perler / Hama Midi Bead', mm: 5.0, category: 'Fuse Bead' },
  { name: 'Custom Dimension', mm: 2.0, category: 'User Defined' },
];
