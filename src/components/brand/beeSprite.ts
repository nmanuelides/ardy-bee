// Pixel-art bee bitmap + palette (single source of truth for the logo + the
// cursor bee). Each sprite character is a palette slot "1".."5"; "." = transparent.
// Colors are customizable in the dev Bee Lab — edit BEE_PALETTE to recolor.
export const BEE_PALETTE = [
  "#ff9500", // 1 — accent (amber)
  "#ff5900", // 2 — ember
  "#edd6ad", // 3 — cream
  "#7a3a00", // 4
  "#ffffff", // 5
];

export const BEE_SPRITE = [
  ".......33......",
  ".....333333....",
  "...2.3333333...",
  "...2.333333....",
  ".....222222....",
  "..2221111112...",
  ".2332112112....",
  "....2222222....",
  ".....2.2.2.....",
];
