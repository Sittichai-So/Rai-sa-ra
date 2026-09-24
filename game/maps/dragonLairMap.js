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
export const MAP_COLS = 18
export const MAP_ROWS = 14

const DOOR_COL = 9

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

export const DRAGON_POS = tileCenter(9, 3)
export const DRAGON_SCALE = 0.85

export const TORCHES = [
  tileCenter(2, 1), tileCenter(15, 1),
  tileCenter(2, MAP_ROWS - 2), tileCenter(15, MAP_ROWS - 2)
]

export const BONES_MARKER = tileCenter(4, 8)
export const SEAL_MARKER = tileCenter(14, 8)
export const LAVA_CROSSING_SPOT = tileCenter(9, 9)

export const DECORATIONS = [
  { sprite: 'skull', ...BONES_MARKER },
  { sprite: 'floor_ladder', ...tileCenter(DOOR_COL, MAP_ROWS - 2) },
  { sprite: 'door', ...SEAL_MARKER }
]

export const LAVA_GLOW_SPOTS = [
  tileCenter(6, 5), tileCenter(12, 5), LAVA_CROSSING_SPOT
]

export const LOCAL_INTERACTABLES = [
  { id: 'dragon_lair_exit', x: spawnPoint().x, y: spawnPoint().y, radius: 22, verb: 'เดินออกไป', label: 'ทางออก', kind: 'exit', priority: 1, data: { to: 'dungeon' } }
]

export const ENCOUNTER_MARKERS = [
  { id: 'dragon_fight', ...DRAGON_POS, kind: 'creature', sprite: 'dragon_ancient', scale: DRAGON_SCALE, origin: [0.5, 0.7], label: 'มังกรเฒ่าไฟกาฬ', discover: 'ไอร้อนพวยพุ่งจากด้านหน้า มังกรเฒ่าไฟกาฬนอนขดตัวอยู่บนกองสมบัติ ลืมตาขึ้นมองคุณ' },
  { id: 'adventurer_bones', ...BONES_MARKER, kind: 'clue', sprite: 'skull', label: 'กองกระดูกนักผจญภัย', verb: 'ตรวจสอบ' },
  { id: 'lava_crossing', ...LAVA_CROSSING_SPOT, kind: 'trap', label: 'ทางเดินลาวา', shadow: false }
]

export const DEFENSE_ENCOUNTER_MARKERS = [
  { id: 'wave_1', x: 152, y: 128, kind: 'creature', sprite: 'creature_skeleton', tint: 0x9FE89F, origin: [0.5, 0.85], label: 'กองโครงกระดูกคืนชีพ', discover: 'โครงกระดูกคืนชีพนับสิบทะลักเข้ามาจากปากถ้ำ มุ่งตรงไปที่มังกรเฒ่า' },
  { id: 'wave_2', x: 128, y: 112, kind: 'creature', sprite: 'creature_wolf', anim: 'creature_wolf-run', tint: 0xAA66FF, alpha: 0.7, scale: 1.4, label: 'วิญญาณหมาป่าเงา' },
  { id: 'wave_3', x: 176, y: 104, kind: 'creature', sprite: 'creature_troll', tint: 0x333344, alpha: 0.85, scale: 1.6, origin: [0.5, 0.85], label: 'เงาโทรลล์' }
]
