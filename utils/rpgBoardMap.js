export const BOARD_MAP_WAYPOINTS = [
  { id: 0, xPct: 6.56, yPct: 6.09 },
  { id: 1, xPct: 12.76, yPct: 12.3 },
  { id: 2, xPct: 18.96, yPct: 6.09 },
  { id: 3, xPct: 25.16, yPct: 12.3 },
  { id: 4, xPct: 31.36, yPct: 18.51 },
  { id: 5, xPct: 37.56, yPct: 24.72 },
  { id: 6, xPct: 6.56, yPct: 18.51 },
  { id: 7, xPct: 12.76, yPct: 24.72 },
  { id: 8, xPct: 18.96, yPct: 30.93 },
  { id: 9, xPct: 31.36, yPct: 30.93 },
  { id: 10, xPct: 37.56, yPct: 37.14 },
  { id: 11, xPct: 43.76, yPct: 30.93 },
  { id: 12, xPct: 49.96, yPct: 37.14 },
  { id: 13, xPct: 56.17, yPct: 43.35 },
  { id: 14, xPct: 62.37, yPct: 49.57 },
  { id: 15, xPct: 68.57, yPct: 55.78 },
  { id: 16, xPct: 31.36, yPct: 43.35 },
  { id: 17, xPct: 37.56, yPct: 49.57 },
  { id: 18, xPct: 43.76, yPct: 55.78 },
  { id: 19, xPct: 49.96, yPct: 61.99 },
  { id: 20, xPct: 62.37, yPct: 61.99 },
  { id: 21, xPct: 68.57, yPct: 68.2 },
  { id: 22, xPct: 74.77, yPct: 61.99 },
  { id: 23, xPct: 80.97, yPct: 68.2 },
  { id: 24, xPct: 87.17, yPct: 74.41 },
  { id: 25, xPct: 93.37, yPct: 80.62 },
  { id: 26, xPct: 62.37, yPct: 74.41 },
  { id: 27, xPct: 68.57, yPct: 80.62 },
  { id: 28, xPct: 74.77, yPct: 86.83 },
  { id: 29, xPct: 87.17, yPct: 86.83 },
  { id: 30, xPct: 93.37, yPct: 93.04 }
]

export function waypointFor (tileId) {
  return BOARD_MAP_WAYPOINTS.find(w => w.id === tileId) || { id: tileId, xPct: 50, yPct: 50 }
}
