// HP 12C key table. Codes = row digit + column digit (column 10 -> 0); digit keys use the digit.
export const K = {
  N: 11, I: 12, PV: 13, PMT: 14, FV: 15, CHS: 16, DIV: 10,
  YX: 21, RECIP: 22, PCTT: 23, DPCT: 24, PCT: 25, EEX: 26, MUL: 20,
  RS: 31, SST: 32, RDN: 33, SWAP: 34, CLX: 35, ENTER: 36, SUB: 30,
  ON: 41, F: 42, G: 43, STO: 44, RCL: 45, DOT: 48, SIGMA: 49, ADD: 40,
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
};

// [code, row, col, label, f, g]
const T = [
  [11, 1, 1, 'n', 'AMORT', '12×'], [12, 1, 2, 'i', 'INT', '12÷'], [13, 1, 3, 'PV', 'NPV', 'CFo'],
  [14, 1, 4, 'PMT', 'RND', 'CFj'], [15, 1, 5, 'FV', 'IRR', 'Nj'], [16, 1, 6, 'CHS', 'RPN', 'DATE'],
  [7, 1, 7, '7', '', 'BEG'], [8, 1, 8, '8', '', 'END'], [9, 1, 9, '9', '', 'MEM'], [10, 1, 10, '÷', '', 'UNDO'],
  [21, 2, 1, 'yˣ', 'PRICE', '√x'], [22, 2, 2, '1/x', 'YTM', 'eˣ'], [23, 2, 3, '%T', 'SL', 'LN'],
  [24, 2, 4, 'Δ%', 'SOYD', 'FRAC'], [25, 2, 5, '%', 'DB', 'INTG'], [26, 2, 6, 'EEX', 'ALG', 'ΔDYS'],
  [4, 2, 7, '4', '', 'D.MY'], [5, 2, 8, '5', '', 'M.DY'], [6, 2, 9, '6', '', 'x̄w'], [20, 2, 10, '×', '', 'x²'],
  [31, 3, 1, 'R/S', 'P/R', 'PSE'], [32, 3, 2, 'SST', 'Σ', 'BST'], [33, 3, 3, 'R↓', 'PRGM', 'GTO'],
  [34, 3, 4, 'x≷y', 'FIN', 'x≤y'], [35, 3, 5, 'CLx', 'REG', 'x=0'], [36, 3, 6, 'ENTER', 'PREFIX', '='],
  [1, 3, 7, '1', '', 'x̂,r'], [2, 3, 8, '2', '', 'ŷ,r'], [3, 3, 9, '3', '', 'n!'], [30, 3, 10, '−', '', '←'],
  [41, 4, 1, 'ON', 'OFF', ''], [42, 4, 2, 'f', '', ''], [43, 4, 3, 'g', '', ''],
  [44, 4, 4, 'STO', '', '('], [45, 4, 5, 'RCL', '', ')'],
  [0, 4, 7, '0', '', 'x̄'], [48, 4, 8, '.', '', 's'], [49, 4, 9, 'Σ+', '', 'Σ−'], [40, 4, 10, '+', '', 'LSTx'],
];

export const LAYOUT = T.map(([code, row, col, label, f, g]) => ({
  code, row, col, rows: code === 36 ? 2 : 1, label, f, g,
}));

export const BRACKETS = [
  { text: 'BOND', row: 2, from: 1, to: 2 },
  { text: 'DEPRECIATION', row: 2, from: 3, to: 5 },
  { text: 'CLEAR', row: 3, from: 2, to: 6 },
];
