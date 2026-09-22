export const TILE = {
  FLOOR: 0,
  WALL_TOP_LEFT: 1,
  WALL_TOP_MID: 2,
  WALL_TOP_RIGHT: 3,
  WALL_LEFT: 4,
  WALL_MID: 5,
  WALL_RIGHT: 6
}

export const WALL_FRAMES = [
  TILE.WALL_TOP_LEFT, TILE.WALL_TOP_MID, TILE.WALL_TOP_RIGHT,
  TILE.WALL_LEFT, TILE.WALL_MID, TILE.WALL_RIGHT
]

export const TILE_SIZE = 16
export const MAP_COLS = 13
export const MAP_ROWS = 11

const DOOR_COL = 6

export function buildRoomMap () {
  const map = []
  const lastCol = MAP_COLS - 1
  const lastRow = MAP_ROWS - 1
  for (let y = 0; y < MAP_ROWS; y++) {
    const row = new Array(MAP_COLS).fill(TILE.FLOOR)
    for (let x = 0; x < MAP_COLS; x++) {
      if (y === 0) {
        row[x] = x === 0 ? TILE.WALL_TOP_LEFT : x === lastCol ? TILE.WALL_TOP_RIGHT : TILE.WALL_TOP_MID
      } else if (y === 1) {
        row[x] = x === 0 ? TILE.WALL_LEFT : x === lastCol ? TILE.WALL_RIGHT : TILE.WALL_MID
      } else if (y === lastRow) {
        if (x === DOOR_COL) { row[x] = TILE.FLOOR } else {
          row[x] = x === 0 ? TILE.WALL_LEFT : x === lastCol ? TILE.WALL_RIGHT : TILE.WALL_MID
        }
      } else if (x === 0) {
        row[x] = TILE.WALL_LEFT
      } else if (x === lastCol) {
        row[x] = TILE.WALL_RIGHT
      }
    }
    map.push(row)
  }
  return map
}

function tileCenter (col, row) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 }
}

export function spawnPoint () {
  return tileCenter(DOOR_COL, MAP_ROWS - 2)
}

export const DECORATIONS = [
  { sprite: 'floor_ladder', ...tileCenter(DOOR_COL, MAP_ROWS - 2) },
  { sprite: 'skull', ...tileCenter(2, 2) },
  { sprite: 'skull', ...tileCenter(10, 8) }
]

export const BANNERS = []

export const TORCHES = [
  tileCenter(2, 1), tileCenter(10, 1),
  tileCenter(2, MAP_ROWS - 2), tileCenter(10, MAP_ROWS - 2)
]

export const TREASURE_MARKER = tileCenter(3, 3)
export const TRAP_MARKER = tileCenter(9, 3)
export const IMP_MARKER = tileCenter(3, 7)
export const SKELETON_MARKER = tileCenter(9, 7)
export const REST_MARKER = tileCenter(6, 2)

export const LOCAL_INTERACTABLES = [
  { id: 'cave_exit', x: 104, y: 152, radius: 22, verb: 'เดินออกไป', label: 'ทางออก', kind: 'exit', priority: 1, data: { to: 'village' } }
]

export const ENCOUNTER_MARKERS = [
  { id: 'cave_imp_1', ...IMP_MARKER, kind: 'creature', sprite: 'creature_skeleton', tint: 0xFF9A5A, origin: [0.5, 0.85], label: 'ปีศาจตัวจิ๋ว', discover: 'เสียงหัวเราะแหลมๆ ดังก้องมาจากซอกหิน ปีศาจตัวจิ๋วกำลังหลบซ่อนอยู่แถวนี้' },
  { id: 'skeleton_1', ...SKELETON_MARKER, kind: 'creature', sprite: 'creature_skeleton', origin: [0.5, 0.85], label: 'โครงกระดูกเฝ้ายาม', discover: 'เสียงกระดูกกระทบกันดังกริ๊กๆ มีบางอย่างยืนนิ่งอยู่ในเงามืด' },
  { id: 'treasure_1', ...TREASURE_MARKER, kind: 'chest', label: 'หีบไม้เก่า', verb: 'ตรวจสอบ', discover: 'ในซอกมุมถ้ำมีหีบเก่าๆ ใบหนึ่งวางอยู่ ขอบเหล็กสะท้อนแสงคบไฟ' },
  { id: 'trap_1', ...TRAP_MARKER, kind: 'trap', label: 'แผ่นหินกับดัก', shadow: false },
  { id: 'rest_1', ...REST_MARKER, kind: 'campfire', label: 'กองไฟ', verb: 'พักผ่อน', discover: 'มุมถ้ำมีกองไฟเล็กๆ ที่ยังพอใช้พักหลบหนาวได้' }
]
