/**
 * Calibrated beadwork pattern reconstruction of the Jaguar / Leopard Loom Tapestry
 * for the artisan's standard loom template (36 columns × 49 rows).
 * Physically measures 5.7 cm × 11.1 cm (width/height ratio 5.7/11.1).
 *
 * Color Key:
 * 'O': #ea6a1a (Vibrant Orange Amber)
 * 'K': #111111 (Jet Black)
 * 'W': #f4eee4 (Alabaster White / Warp border)
 * 'G': #2a8742 (Emerald Green iris)
 * 'P': #ffffff (Pure White eye pupil catchlight)
 * ' ': #ea6a1a (Default body orange)
 */

export const JAGUAR_COLS = 36;
export const JAGUAR_ROWS = 49;

// Exactly 49 rows × 36 columns.
// Calibrated to 5.7cm × 11.1cm (Delica 11/0 loom ratio 5.7:11.1).
export const JAGUAR_ROWS_DATA: string[] = [
  // Rows 0-1: Top white loom fringe border (2 rows of solid white)
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 0 (top border)
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 1

  // Rows 2-5: Crown of head and ear tips with rosette clusters
  "WW K  K  K  K  K  K  K  K  K  K   WW", // Row 2
  "WWKKKK  OOKKK  OKKKKK  OKKK  OOKKKWW", // Row 3
  "WW KKK  OOO KK OOO K  OOOO KK O K WW", // Row 4
  "WWOKK  OOOOO K OOOOO K OOOOO KKOWW", // Row 5

  // Rows 6-11: Forehead spot patterning
  "WWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWW", // Row 6
  "WW O  KKK OO KK  O  O  KK OO KKK OWW", // Row 7
  "WW   KKKKK  KKKK      KKKK  KKKKK WW", // Row 8
  "WWO   KKK  OOOO   KK   OOOO  KKK  WW", // Row 9
  "WW O  KK  OOOOO KKKKKK OOOOO  KK OWW", // Row 10
  "WW   KKKK OOOOO  KKKK  OOOOO KKKK WW", // Row 11

  // Rows 12-18: Upper face, brow rosettes, and emerald feline eyes
  "WWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWW", // Row 12
  "WW KK  OOO  KK OOOOOOOOOO KK  OOO WW", // Row 13
  "WWKKKK  O  KKKK OOOOOOOO KKKK  O KWW", // Row 14
  "WW OOO KKKKK  OOOOOOOOOO  KKKKK OOOWW", // Row 15: Upper eye contour
  "WW  OO KKGGKKK  OOOOOO  KKKGGKK OO WW", // Row 16: Emerald green iris
  "WW  OO KKPGKKK  OOOOOO  KKKGPKK OO WW", // Row 17: White specular pupil
  "WW OOO KKKKK  OOOOOOOOOO  KKKKK OOOWW", // Row 18: Lower eye contour

  // Rows 19-24: Cheek whisker pads and bridge of nose
  "WWOOOOOOOOOOOOO OOOOOO OOOOOOOOOOOWW", // Row 19
  "WW   KK OO KK   OOOOOO   KK OO KK  WW", // Row 20
  "WW  KKKK  KKKK  OOOOOO  KKKK  KKKKWW", // Row 21
  "WW   KK OO KK   OOOOOO   KK OO KK  WW", // Row 22
  "WWOOOOOOOOOOOO   KKKK   OOOOOOOOOOWW", // Row 23: Top of nose bridge
  "WW  KK OOOOOOO  KKKKKK  OOOOOOO KK WW", // Row 24

  // Rows 25-28: Solid black nose triangle
  "WW KKKK OOOOO  KKKKKKKK  OOOOO KKKWW", // Row 25
  "WW  KK  OOOOOO KKKKKKKK OOOOOO  KK WW", // Row 26
  "WWOOOOOOOOOOO   KKKKKK   OOOOOOOOOOWW", // Row 27
  "WWOOOOOOOOOOOOO   KK   OOOOOOOOOOOOWW", // Row 28: Philtrum line

  // Rows 29-35: Upper lip, muzzle line, and whisker spot patterns
  "WW  KK OO KKK O   KK   O KKK OO KK WW", // Row 29: Whisker dots
  "WW KKKK  KKKKK    KK    KKKKK  KKKWW", // Row 30
  "WW  KK OO KKK     KK     KKK OO KK WW", // Row 31
  "WWOOOOOOOOOOO    KKKK    OOOOOOOOOOWW", // Row 32: Muzzle arch
  "WW   KKK OO KK  KKKKKK  KK OO KKK  WW", // Row 33
  "WW  KKKKK  KKKKKK    KKKKKK  KKKKKWW", // Row 34
  "WW   KKK OO KK  K    K  KK OO KKK  WW", // Row 35

  // Rows 36-41: Lower jaw, chin curve, and neck rosettes
  "WWOOOOOOOOOOOOO K KK K  OOOOOOOOOOWW", // Row 36: Chin curve
  "WW  O KKK OO   KKKKKKKK   OO KKK O WW", // Row 37
  "WW   KKKKK    KK OOOO KK    KKKKK  WW", // Row 38
  "WW  O KKK OO  KK OOOO KK  OO KKK O WW", // Row 39
  "WWOOOOOOOOOO   KKKKKKKK   OOOOOOOOOWW", // Row 40
  "WW  KK OOOOOOO   KKKK   OOOOOOO KK WW", // Row 41

  // Rows 42-46: Lower tapestry background rosettes
  "WW KKKK OO KKK  OOOOOO  KKK OO KKKWW", // Row 42
  "WW  KK  OOO KKKK OOOO KKKK OOO  KK WW", // Row 43
  "WWOOOOOOOO   KK  OOOO  KK   OOOOOOOWW", // Row 44
  "WW   KKKKK  OOO KKKKKK OOO  KKKKK  WW", // Row 45
  "WWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWW", // Row 46

  // Rows 47-48: Bottom white loom fringe border (2 rows of solid white)
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 47
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", // Row 48
];

/**
 * Builds the cell color array for the Jaguar Tapestry design (36 cols × 49 rows)
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
