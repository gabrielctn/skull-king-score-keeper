/** Pirate / nautical color palette and shared spacing tokens. */
export const colors = {
  bg: "#0b1722",
  bgElevated: "#13283a",
  card: "#173347",
  cardBorder: "#23475f",
  gold: "#e8b84b",
  goldDim: "#9c7b2e",
  text: "#f3f7fa",
  textDim: "#9fb4c4",
  positive: "#5cd6a0",
  negative: "#ff6b6b",
  accent: "#2f9bd6",
  danger: "#c0392b",
  overlay: "rgba(0,0,0,0.55)",
};

/**
 * Stable player-series colors shared by score charts and exported recaps.
 * The order follows the game's seating order and covers the eight-player cap.
 */
export const scoreSeriesColors = [
  "#e8b84b",
  "#55c7f3",
  "#ff7b72",
  "#66d9a3",
  "#c792ea",
  "#ffad5a",
  "#7aa2f7",
  "#f48fb1",
] as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
