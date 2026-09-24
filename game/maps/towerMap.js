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
export const MAP_ROWS = 22

const DOOR_COL = 6
const STAIR_COLS = [5, 6, 7]
const SEPARATOR_ROWS = [7, 14]

function wallRow (x, lastCol, left, mid, right) {
  if (x === 0) { return left }
  if (x === lastCol) { return right }
  return mid
}

export function buildRoomMap () {
  const map = []
  const lastCol = MAP_COLS - 1
  const lastRow = MAP_ROWS - 1
  for (let y = 0; y < MAP_ROWS; y++) {
    const row = new Array(MAP_COLS).fill(TILE.FLOOR)
    for (let x = 0; x < MAP_COLS; x++) {
      if (y === 0) {
        row[x] = wallRow(x, lastCol, TILE.WALL_TOP_LEFT, TILE.WALL_TOP_MID, TILE.WALL_TOP_RIGHT)
      } else if (y === 1) {
        row[x] = wallRow(x, lastCol, TILE.WALL_LEFT, TILE.WALL_MID, TILE.WALL_RIGHT)
      } else if (SEPARATOR_ROWS.includes(y)) {
        row[x] = STAIR_COLS.includes(x) ? TILE.FLOOR : wallRow(x, lastCol, TILE.WALL_LEFT, TILE.WALL_TOP_MID, TILE.WALL_RIGHT)
      } else if (SEPARATOR_ROWS.includes(y - 1)) {
        row[x] = STAIR_COLS.includes(x) ? TILE.FLOOR : wallRow(x, lastCol, TILE.WALL_LEFT, TILE.WALL_MID, TILE.WALL_RIGHT)
      } else if (y === lastRow) {
        row[x] = x === DOOR_COL ? TILE.FLOOR : wallRow(x, lastCol, TILE.WALL_LEFT, TILE.WALL_MID, TILE.WALL_RIGHT)
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

export const THRONE_POS = tileCenter(6, 3)

export const TORCHES = [
  tileCenter(2, 1), tileCenter(10, 1),
  tileCenter(2, 8), tileCenter(10, 8),
  tileCenter(2, 15), tileCenter(10, 15)
]

export const BANNERS = [tileCenter(4, 1), tileCenter(8, 1)]

export const DECORATIONS = [
  { sprite: 'floor_ladder', ...tileCenter(DOOR_COL, MAP_ROWS - 2) },
  { sprite: 'skull', ...tileCenter(2, 18) },
  { sprite: 'skull', ...tileCenter(10, 19) },
  { sprite: 'skull', ...tileCenter(3, 4) },
  { sprite: 'skull', ...tileCenter(9, 4) },
  { sprite: 'skull', ...tileCenter(11, 10) }
]

export const LOCAL_INTERACTABLES = [
  { id: 'tower_exit', x: spawnPoint().x, y: spawnPoint().y, radius: 22, verb: 'ขึ้นไปข้างบน', label: 'ทางออกสู่หมู่บ้าน', kind: 'exit', priority: 1, data: { to: 'village' } }
]

export const ENCOUNTER_MARKERS = [
  { id: 'crypt_skeletons', x: 104, y: 272, kind: 'creature', sprite: 'creature_skeleton', tint: 0x9FE89F, scale: 1.3, origin: [0.5, 0.85], label: 'โครงกระดูกคืนชีพ', discover: 'เสียงกระดูกกระทบกันดังมาจากห้องใต้ดิน โครงกระดูกสามตัวขวางบันไดวนไว้' },
  { id: 'tower_rest', x: 40, y: 280, kind: 'campfire', label: 'จุดพัก', verb: 'พักผ่อน', discover: 'มุมห้องมีกองไฟเก่าที่ยังพอใช้พักฟื้นแรงก่อนขึ้นบันได' },
  { id: 'cursed_bookshelf', x: 136, y: 168, kind: 'clue', sprite: 'crate', label: 'ตู้หนังสือต้องสาป', discover: 'ตู้หนังสือเต็มไปด้วยตำราเวท ตัวอักษรบนสันหนังสือเรืองแสงสีม่วงและกระซิบไม่หยุด' },
  { id: 'prisoner_whisper', x: 168, y: 184, kind: 'clue', sprite: 'skull', label: 'ห้องขังวิญญาณ', verb: 'ฟังเสียงกระซิบ', discover: 'เสียงกระซิบขอความช่วยเหลือดังมาจากห้องขังข้างทาง' },
  { id: 'morkal_throne', x: THRONE_POS.x, y: THRONE_POS.y + 8, kind: 'creature', sprite: 'npc_elder', tint: 0xB38CFF, scale: 1.3, origin: [0.5, 0.85], label: 'มรกาฬ', discover: 'บนบัลลังก์กระดูกกลางห้อง ชายชราที่คุณเคยเรียกว่าผู้เฒ่านั่งรออยู่ แสงม่วงลุกโชนรอบตัวเขา' }
]
