export const WILD = {
  GRASS: 0,
  DARK_GRASS: 3,
  DIRT: 12,
  DIRT_FLAT: 21,
  DIRT_RIDGE: 22,
  DIRT_RIDGE_B: 23,
  WATER: 24,
  MOUNTAIN: 40,
  MOUNTAIN_COUNT: 10
}

const SHORE_N = 1
const SHORE_E = 2
const SHORE_S = 4
const SHORE_W = 8

export function fillMap (cols, rows, tile) {
  const map = []
  for (let y = 0; y < rows; y++) { map.push(new Array(cols).fill(tile)) }
  return map
}

export function paintBlock (map, rect, base) {
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const col = x === rect.x ? 0 : x === rect.x + rect.w - 1 ? 2 : 1
      const row = y === rect.y ? 0 : y === rect.y + rect.h - 1 ? 2 : 1
      map[y][x] = base + row * 3 + col
    }
  }
}

export function paintPond (map, rect) {
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      let mask = 0
      if (y === rect.y) { mask |= SHORE_N }
      if (x === rect.x + rect.w - 1) { mask |= SHORE_E }
      if (y === rect.y + rect.h - 1) { mask |= SHORE_S }
      if (x === rect.x) { mask |= SHORE_W }
      map[y][x] = WILD.WATER + mask
    }
  }
}

export function paintCells (map, cells, tile) {
  cells.forEach(([x, y], i) => {
    if (map[y] && map[y][x] !== undefined) { map[y][x] = Array.isArray(tile) ? tile[i % tile.length] : tile }
  })
}

export function paintMountains (map, cells) {
  cells.forEach(([x, y]) => {
    if (map[y] && map[y][x] !== undefined) { map[y][x] = WILD.MOUNTAIN + ((x * 7 + y * 13) % WILD.MOUNTAIN_COUNT) }
  })
}

export function isMountainTile (index) {
  return index >= WILD.MOUNTAIN && index < WILD.MOUNTAIN + WILD.MOUNTAIN_COUNT
}
