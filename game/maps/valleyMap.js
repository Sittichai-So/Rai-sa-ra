import { WILD, fillMap, paintMountains } from './wildTiles'

export const TILE_SIZE = 16
export const MAP_COLS = 22
export const MAP_ROWS = 16

function tileCenter (col, row) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 }
}

function mountainCells () {
  const cells = []
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      const top = y <= 1
      const left = x <= 1 && y <= 12
      const right = x >= MAP_COLS - 2
      const bottom = y >= MAP_ROWS - 2 && x >= 7
      if (top || left || right || bottom) { cells.push([x, y]) }
    }
  }
  return cells
}

export function buildGroundMap () {
  const map = fillMap(MAP_COLS, MAP_ROWS, WILD.DIRT_FLAT)
  paintMountains(map, mountainCells())
  return map
}

export function spawnPoint () {
  return tileCenter(3, MAP_ROWS - 2)
}

export const DECORATIONS = [
  { sprite: 'boulder', tile: [4, 3], solid: true }, { sprite: 'boulder', tile: [8, 5], solid: true },
  { sprite: 'boulder', tile: [13, 4], solid: true }, { sprite: 'boulder', tile: [17, 7], solid: true },
  { sprite: 'boulder', tile: [6, 9], solid: true }, { sprite: 'boulder', tile: [11, 11], solid: true },
  { sprite: 'boulder', tile: [15, 12], solid: true }, { sprite: 'boulder', tile: [3, 12], solid: true },
  { sprite: 'boulder', tile: [19, 4], solid: true }, { sprite: 'log', tile: [10, 6], solid: false },
  { sprite: 'tree_pine', tile: [2, 8], solid: true }, { sprite: 'tree_pine', tile: [18, 10], solid: true },
  { sprite: 'tree_pine', tile: [7, 13], solid: true }
]

export const LOCAL_INTERACTABLES = [
  { id: 'valley_exit', x: 30, y: 244, radius: 26, verb: 'กลับหมู่บ้าน', label: 'ทางกลับหมู่บ้านลมเย็น', kind: 'exit', priority: 1, data: { to: 'village' } }
]

export const EXIT_PROPS = [{ sprite: 'signpost', tile: [1, 15] }]

export const ENCOUNTER_MARKERS = [
  { id: 'rockslide', ...tileCenter(10, 8), kind: 'clue', sprite: 'boulder', label: 'หน้าผาที่ร้าว', pulse: false, discover: 'เสียงหินกรอบแกรบดังมาจากหน้าผาเหนือศีรษะ ฝุ่นละอองร่วงลงมาเป็นสาย...' },
  { id: 'rickety_ladder', x: 264, y: 88, kind: 'clue', sprite: 'ladder', label: 'บันไดเชือกผุ', verb: 'ตรวจสอบ', discover: 'บันไดไม้เก่าคร่ำครึพาดอยู่กับหน้าผา เชือกที่มัดไว้กร่อนจนเห็นเส้นใยขาดเป็นช่วงๆ' },
  { id: 'treasure_1', ...tileCenter(5, 6), kind: 'chest', label: 'หีบไม้เก่า', verb: 'ตรวจสอบ', discover: 'ในซอกหินมีของบางอย่างสะท้อนแสงออกมา...' },
  { id: 'trap_1', ...tileCenter(14, 12), kind: 'trap', label: 'แผ่นหินกับดัก', shadow: false },
  { id: 'rest_1', ...tileCenter(18, 13), kind: 'campfire', label: 'กองไฟ', verb: 'พักผ่อน', discover: 'ซากกองไฟเก่าใต้ผาหินที่พอกำบังลมได้' }
]

export const RITUAL_ENCOUNTER_MARKERS = [
  { id: 'drained_corpse', ...tileCenter(9, 4), kind: 'clue', sprite: 'footprints', label: 'ซากสัตว์ไร้เลือด', verb: 'ตรวจสอบ', discover: 'ซากกวางตัวหนึ่งนอนอยู่ข้างทาง ผิวหนังแห้งกรังราวกับถูกดูดพลังชีวิตออกจนหมด' },
  { id: 'purple_mist', ...tileCenter(13, 9), kind: 'trap', label: 'หมอกม่วง', shadow: false },
  { id: 'ritual_guardian', ...tileCenter(17, 11), kind: 'creature', sprite: 'creature_skeleton', tint: 0x9B5FE0, origin: [0.5, 0.85], label: 'ผู้เฝ้าวงพิธี', discover: 'ปีศาจร่างใหญ่ลุกขึ้นจากวงพิธีที่เรืองแสงสีม่วง ดวงตาคู่นั้นจ้องมองมาที่คุณอย่างดุร้าย' }
]

export const RITUAL_AMBUSH_MARKERS = [
  { id: 'goblin_hire_ambush', ...tileCenter(5, 4), kind: 'creature', sprite: 'creature_goblin', origin: [0.5, 0.85], label: 'ก็อบลินรับจ้าง', discover: 'ก็อบลินรับจ้างสองตัวโผล่ออกมาจากพุ่มไม้ ผู้เฒ่าคงส่งพวกมันมาแน่ๆ' }
]
