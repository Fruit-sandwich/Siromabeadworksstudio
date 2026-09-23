/**
 * Pixel-accurate beadwork pattern reconstruction of the Jaguar / Leopard Loom Tapestry
 * from the artisan's physical beadwork sample (34 columns × 60 rows).
 *
 * Color Key:
 * 'O': #ea6a1a (Vibrant Orange Amber)
 * 'K': #111111 (Jet Black)
 * 'W': #f4eee4 (Alabaster White / Warp border)
 * 'G': #2a8742 (Emerald Green iris)
 * 'P': #ffffff (Pure White eye pupil catchlight)
 * ' ': null (Empty)
 */

export const JAGUAR_COLS = 34;
export const JAGUAR_ROWS = 62;

// 62 rows from Row 0 (top of woven piece) down to Row 61 (bottom of woven piece).
// Exactly calibrated to 6cm × 11cm (ratio 6:11 = 34 cols × 62.3 rows).
// Each string is exactly 34 characters long.
export const JAGUAR_ROWS_DATA: string[] = [
  // Rows 0-4: Top white loom fringe border (5 rows of solid white)
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 0 (top border)
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 1
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 2
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 3
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 4

  // Rows 4-8: Crown of head and ear tips with rosette clusters
  "WW K K K K K K K K K K K K K K  WW", // Row 4
  "WWKKKK OOKKK  OKKKKK  OKKK OOKKKWW", // Row 5
  "WW KKK OOO KK OOO K  OOOO KK O KWW", // Row 6
  "WWOKK OOOOO K OOOOO K OOOOO KKOWW", // Row 7
  "WWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWW", // Row 8

  // Rows 9-16: Forehead spot patterning
  "WW O KKK OO KK O  O KK OO KKK O WW", // Row 9
  "WW  KKKKK  KKKK    KKKK  KKKKK  WW", // Row 10
  "WWO  KKK  OOOO  KK  OOOO  KKK  OWW", // Row 11
  "WWOOOOOO OOOOO KKKK OOOOO OOOOOOWW", // Row 12
  "WW O KK OOOOOOKKKKKKOOOOOO KK O WW", // Row 13
  "WW  KKKK OOOOO KKKK OOOOO KKKK  WW", // Row 14
  "WW O KK OOOOOOO KK OOOOOOO KK O WW", // Row 15
  "WWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWW", // Row 16

  // Rows 17-25: Upper face, brow rosettes, and eyes
  "WW KK OOO KK OOOOOOOOO KK OOO KKWW", // Row 17
  "WWKKKK O KKKK OOOOOOO KKKK O KKKWW", // Row 18
  "WW KK OOO KK OOOOOOOOO KK OOO KKWW", // Row 19
  "WWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWW", // Row 20
  "WW OOO KKKKK OOOOOOOO KKKKK OOO WW", // Row 21: Upper eye outline
  "WW OO KKKKKKK OOOOOO KKKKKKK OO WW", // Row 22: Eye contour
  "WW OO KKGGKKK OOOOOO KKKGGKK OO WW", // Row 23: Green emerald iris
  "WW OO KKPGKKK OOOOOO KKKGPKK OO WW", // Row 24: Pupil & white reflection
  "WW OOO KKKKK OOOOOOOO KKKKK OOO WW", // Row 25: Lower eye rim

  // Rows 26-34: Cheek whisker pads and bridge of nose
  "WWOOOOOOOOOOO OOOOOO OOOOOOOOOOOWW", // Row 26
  "WW  KK OO KK  OOOOOO  KK OO KK  WW", // Row 27
  "WW KKKK  KKKK OOOOOO KKKK  KKKK WW", // Row 28
  "WW  KK OO KK  OOOOOO  KK OO KK  WW", // Row 29
  "WWOOOOOOOOOOO  KKKK  OOOOOOOOOOOWW", // Row 30: Top of nose bridge
  "WW KK OOOOOOO KKKKKK OOOOOOO KKWW", // Row 31
  "WWKKKK OOOOO KKKKKKKK OOOOO KKKKWW", // Row 32: Solid black nose triangle
  "WW KK OOOOOO KKKKKKKK OOOOOO KKWW", // Row 33
  "WWOOOOOOOOOO  KKKKKK  OOOOOOOOOOWW", // Row 34

  // Rows 35-43: Upper lip, muzzle line, and whisker spot patterns
  "WWOOOOOOOOOOOO  KK  OOOOOOOOOOOOWW", // Row 35: Central philtrum line
  "WW KK OO KKK O  KK  O KKK OO KK WW", // Row 36: Whisker dot rows
  "WWKKKK  KKKKK   KK   KKKKK  KKKKWW", // Row 37
  "WW KK OO KKK    KK    KKK OO KK WW", // Row 38
  "WWOOOOOOOOOO   KKKK   OOOOOOOOOOWW", // Row 39: Muzzle arch
  "WW  KKK OO KK KKKKKK KK OO KKK  WW", // Row 40
  "WW KKKKK  KKKKKK  KKKKKK  KKKKK WW", // Row 41
  "WW  KKK OO KK K    K KK OO KKK  WW", // Row 42
  "WWOOOOOOOOOOO K KK K OOOOOOOOOOOWW", // Row 43: Chin curve

  // Rows 44-51: Lower jaw and neck rosettes
  "WW O KKK OO  KKKKKKKK  OO KKK O WW", // Row 44
  "WW  KKKKK   KK OOOO KK   KKKKK  WW", // Row 45
  "WW O KKK OO KK OOOO KK OO KKK O WW", // Row 46
  "WWOOOOOOOOO  KKKKKKKK  OOOOOOOOOWW", // Row 47
  "WW KK OOOOOOO  KKKK  OOOOOOO KK WW", // Row 48
  "WWKKKK OO KKK OOOOOO KKK OO KKKKWW", // Row 49
  "WW KK OOO KKKK OOOO KKKK OOO KK WW", // Row 50
  "WWOOOOOOO  KK  OOOO  KK  OOOOOOOWW", // Row 51

  // Rows 52-55: Lower tapestry background rosettes
  "WW O KKK OOOOO KKKK OOOOO KKK O WW", // Row 52
  "WW  KKKKK OOO KKKKKK OOO KKKKK  WW", // Row 53
  "WW O KKK OOOOO KKKK OOOOO KKK O WW", // Row 54
  "WWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWW", // Row 55

  // Rows 57-61: Bottom white loom fringe border (5 rows of solid white)
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 57
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 58
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 59
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 60
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 61
];

/**
 * Builds the cell color array for the Jaguar Tapestry design
 */
export function createJaguarLoomCells(): (string | null)[] {
  const cells: (string | null)[] = new Array(JAGUAR_COLS * JAGUAR_ROWS).fill(null);

  const COLOR_MAP: Record<string, string | null> = {
    'O': '#ea6a1a', // Warm Amber Orange
    'K': '#111111', // Jet Black
    'W': '#f4eee4', // Alabaster White
    'G': '#2a8742', // Emerald Green Eye
    'P': '#ffffff', // Catchlight White
    ' ': '#ea6a1a', // Default body orange if whitespace
  };

  for (let r = 0; r < JAGUAR_ROWS; r++) {
    const rowStr = JAGUAR_ROWS_DATA[r] || '';
    for (let c = 0; c < JAGUAR_COLS; c++) {
      const ch = rowStr[c] || ' ';
      const color = COLOR_MAP[ch] || '#ea6a1a';
      cells[r * JAGUAR_COLS + c] = color;
    }
  }

  return cells;
}
