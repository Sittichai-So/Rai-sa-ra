export const TILE = {
  FLOOR: 0,
  WALL_TOP_LEFT: 1,
  WALL_TOP_MID: 2,
  WALL_TOP_RIGHT: 3,
  WALL_LEFT: 4,
  WALL_MID: 5,
  WALL_RIGHT: 6
}
const VOID = -1

export const WALL_FRAMES = [
  TILE.WALL_TOP_LEFT, TILE.WALL_TOP_MID, TILE.WALL_TOP_RIGHT,
  TILE.WALL_LEFT, TILE.WALL_MID, TILE.WALL_RIGHT
]

export const TILE_SIZE = 16
export const MAP_COLS = 9
const CHAMBER_ROWS = 7
const CORRIDOR_ROWS = 2
export const MAP_ROWS = CHAMBER_ROWS * 2 + CORRIDOR_ROWS

const DOOR_COL = 4
const ROOM1_TOP = 0
const CORRIDOR_TOP = CHAMBER_ROWS
const ROOM2_TOP = CHAMBER_ROWS + CORRIDOR_ROWS

function buildChamber (map, topRow, { gapNorth, gapSouth }) {
  const lastCol = MAP_COLS - 1
  for (let ry = 0; ry < CHAMBER_ROWS; ry++) {
    const row = map[topRow + ry]
    for (let x = 0; x < MAP_COLS; x++) {
      if (ry === 0) {
        if (gapNorth && x === DOOR_COL) { row[x] = TILE.FLOOR } else {
          row[x] = x === 0 ? TILE.WALL_TOP_LEFT : x === lastCol ? TILE.WALL_TOP_RIGHT : TILE.WALL_TOP_MID
        }
      } else if (ry === 1) {
        if (gapNorth && x === DOOR_COL) { row[x] = TILE.FLOOR } else {
          row[x] = x === 0 ? TILE.WALL_LEFT : x === lastCol ? TILE.WALL_RIGHT : TILE.WALL_MID
        }
      } else if (ry === CHAMBER_ROWS - 1) {
        if (gapSouth && x === DOOR_COL) { row[x] = TILE.FLOOR } else {
          row[x] = x === 0 ? TILE.WALL_LEFT : x === lastCol ? TILE.WALL_RIGHT : TILE.WALL_MID
        }
      } else if (x === 0) {
        row[x] = TILE.WALL_LEFT
      } else if (x === lastCol) {
        row[x] = TILE.WALL_RIGHT
      } else {
        row[x] = TILE.FLOOR
      }
    }
  }
}

function buildCorridor (map, topRow) {
  for (let ry = 0; ry < CORRIDOR_ROWS; ry++) {
    const row = map[topRow + ry]
    for (let x = 0; x < MAP_COLS; x++) {
      if (x >= DOOR_COL - 1 && x <= DOOR_COL + 1) {
        row[x] = TILE.FLOOR
      } else if (x === DOOR_COL - 2) {
        row[x] = TILE.WALL_RIGHT
      } else if (x === DOOR_COL + 2) {
        row[x] = TILE.WALL_LEFT
      } else {
        row[x] = VOID
      }
    }
  }
}

export function buildRoomMap () {
  const map = []
  for (let y = 0; y < MAP_ROWS; y++) { map.push(new Array(MAP_COLS).fill(VOID)) }
  buildChamber(map, ROOM1_TOP, { gapNorth: false, gapSouth: true })
  buildCorridor(map, CORRIDOR_TOP)
  buildChamber(map, ROOM2_TOP, { gapNorth: true, gapSouth: false })
  return map
}

function tileCenter (col, row) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 }
}

export function spawnPoint () {
  return tileCenter(4, 5)
}

export const DECORATIONS = [
  { sprite: 'floor_ladder', ...tileCenter(4, 2) },
  { sprite: 'door', ...tileCenter(6, 2) },
  { sprite: 'skull', ...tileCenter(6, ROOM2_TOP + 4) }
]

export const BANNERS = [
  { sprite: 'banner_red', ...tileCenter(2, 1) },
  { sprite: 'banner_blue', ...tileCenter(6, 1) },
  { sprite: 'banner_red', ...tileCenter(2, ROOM2_TOP + 1) },
  { sprite: 'banner_blue', ...tileCenter(6, ROOM2_TOP + 1) }
]

export const TORCHES = [
  tileCenter(3, 1), tileCenter(5, 1),
  tileCenter(3, ROOM2_TOP + 1), tileCenter(5, ROOM2_TOP + 1)
]

export const SKELETON_MARKER = tileCenter(5, 3)
export const OGRE_MARKER = tileCenter(4, ROOM2_TOP + 4)
export const TREASURE_MARKER = tileCenter(2, 2)
export const TRAP_MARKER = tileCenter(6, 4)
export const REST_MARKER = tileCenter(6, ROOM2_TOP + 3)

export const LOCAL_INTERACTABLES = [
  { id: 'dungeon_exit', x: 72, y: 46, radius: 22, verb: 'ปีนบันไดกลับขึ้นไป', label: 'บันไดทางออก', kind: 'exit', priority: 1, data: { to: 'village' } }
]

export const ENCOUNTER_MARKERS = [
  { id: 'wraith_ambush', ...SKELETON_MARKER, kind: 'creature', sprite: 'creature_skeleton', tint: 0xA9CBFF, origin: [0.5, 0.85], label: 'วิญญาณพเนจร', discover: 'อากาศเย็นเยียบขึ้นมาทันที ร่างจางๆ ลอยขึ้นมาจากพื้นดินตรงหน้าคุณ...' },
  { id: 'troll_bridge', ...OGRE_MARKER, kind: 'creature', sprite: 'creature_troll', anim: 'creature_troll-run-down', origin: [0.5, 0.85], scale: 2, label: 'โทรลล์เขี้ยวเหล็ก', discover: 'เสียงกระแทกหนักๆ สะเทือนพื้นหิน ร่างมหึมาของโทรลล์ยืนขวางสะพานอยู่เบื้องหน้า' },
  { id: 'treasure_1', ...TREASURE_MARKER, kind: 'chest', label: 'หีบไม้เก่า', verb: 'ตรวจสอบ', discover: 'ในซอกมุมห้อง มีหีบเก่าๆ ใบหนึ่งวางอยู่ ขอบเหล็กสะท้อนแสงคบไฟ' },
  { id: 'trap_1', ...TRAP_MARKER, kind: 'trap', label: 'แผ่นหินกับดัก', shadow: false },
  { id: 'rest_1', ...REST_MARKER, kind: 'campfire', label: 'กองไฟ', verb: 'พักผ่อน', discover: 'มุมห้องมีกองไฟเล็กๆ ที่ยังพอใช้พักหลบหนาวได้' }
]
