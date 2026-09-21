import { WILD, fillMap, paintBlock, paintPond } from './wildTiles'

export const TILE_SIZE = 16
export const MAP_COLS = 22
export const MAP_ROWS = 16

const CLEARING = { x: 8, y: 6, w: 6, h: 4 }
const POND = { x: 15, y: 10, w: 4, h: 3 }
const DARK_BLOBS = [
  { x: 1, y: 2, w: 4, h: 3 }, { x: 17, y: 3, w: 4, h: 3 }, { x: 1, y: 11, w: 4, h: 3 },
  { x: 16, y: 13, w: 4, h: 3 }, { x: 10, y: 2, w: 3, h: 3 }, { x: 6, y: 11, w: 3, h: 3 }
]

function tileCenter (col, row) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 }
}

export function buildGroundMap () {
  const map = fillMap(MAP_COLS, MAP_ROWS, WILD.GRASS)
  DARK_BLOBS.forEach(blob => paintBlock(map, blob, WILD.DARK_GRASS))
  paintBlock(map, CLEARING, WILD.DIRT)
  paintPond(map, POND)
  return map
}

export function spawnPoint () {
  return tileCenter(3, MAP_ROWS - 2)
}

// Large decorative sprites (bigger than one tile) placed by tile coordinate.
// solid: true means a small collision box is added at the sprite's base.
export const TREES = [
  { sprite: 'tree_bushy', tile: [1, 1], solid: true }, { sprite: 'tree_pine', tile: [3, 1], solid: true },
  { sprite: 'tree_bushy', tile: [5, 0], solid: true }, { sprite: 'tree_pine', tile: [0, 4], solid: true },
  { sprite: 'tree_bushy', tile: [2, 6], solid: true }, { sprite: 'tree_pine', tile: [1, 9], solid: true },
  { sprite: 'tree_bushy', tile: [0, 12], solid: true }, { sprite: 'tree_pine', tile: [2, 14], solid: true },
  { sprite: 'tree_bushy', tile: [9, 15], solid: true }, { sprite: 'tree_pine', tile: [15, 0], solid: true },
  { sprite: 'tree_bushy', tile: [18, 1], solid: true }, { sprite: 'tree_pine', tile: [20, 0], solid: true },
  { sprite: 'tree_bushy', tile: [21, 4], solid: true }, { sprite: 'tree_pine', tile: [19, 7], solid: true },
  { sprite: 'tree_bushy', tile: [21, 10], solid: true }, { sprite: 'tree_pine', tile: [20, 13], solid: true },
  { sprite: 'tree_pine', tile: [13, 14], solid: true },
  { sprite: 'tree_bushy', tile: [9, 1], solid: true }, { sprite: 'tree_pine', tile: [13, 2], solid: true },
  { sprite: 'tree_bushy', tile: [4, 8], solid: true }, { sprite: 'tree_pine', tile: [6, 13], solid: true }
]

export const DECORATIONS = [
  { sprite: 'bush_big', tile: [3, 3], solid: false }, { sprite: 'bush_small', tile: [4, 5], solid: false },
  { sprite: 'log', tile: [9, 4], solid: false }, { sprite: 'bush_small', tile: [17, 5], solid: false },
  { sprite: 'bush_big', tile: [19, 9], solid: false }, { sprite: 'reeds', tile: [14, 11], solid: false },
  { sprite: 'reeds', tile: [19, 12], solid: false }, { sprite: 'bush_small', tile: [8, 13], solid: false },
  { sprite: 'boulder', tile: [12, 3], solid: true }, { sprite: 'boulder', tile: [3, 10], solid: true },
  { sprite: 'tile_cliff', tile: [11, 1], solid: true }
]

export const LOCAL_INTERACTABLES = [
  { id: 'forest_exit', x: 30, y: 244, radius: 26, verb: 'กลับหมู่บ้าน', label: 'ทางกลับหมู่บ้านลมเย็น', kind: 'exit', priority: 1, data: { to: 'village' } }
]

export const EXIT_PROPS = [{ sprite: 'signpost', tile: [1, 15] }]

export const ENCOUNTER_MARKERS = [
  { id: 'footprints', x: 88, y: 208, kind: 'clue', sprite: 'footprints', label: 'รอยเท้าปริศนา', verb: 'ตรวจสอบ', discover: 'บนพื้นดินเปียกตรงหน้า มีรอยบางอย่างกดลึกลงไป...' },
  { id: 'haunted_grove', ...tileCenter(10, 8), kind: 'clue', sprite: 'mushroom_cluster', label: 'ป่าละเมาะผีสิง', pulse: false },
  { id: 'bandit_camp', ...tileCenter(6, 6), kind: 'clue', sprite: 'log', label: 'ค่ายโจรป่า', verb: 'สำรวจค่ายโจร', discover: 'กลิ่นควันไฟจางๆ ลอยมาตามลม ดูเหมือนมีคนตั้งค่ายอยู่แถวนี้' },
  { id: 'whisper_source', x: 232, y: 88, kind: 'clue', sprite: 'tree_dead', label: 'ต้นไม้กลวงโบราณ', verb: 'ตรวจสอบ', discover: 'เสียงกระซิบแหบพร่าดังชัดขึ้นเรื่อยๆ มาจากต้นไม้ใหญ่กลางลานเบื้องหน้า...', solid: [8, 8] },
  { id: 'treasure_1', ...tileCenter(15, 8), kind: 'chest', label: 'หีบไม้เก่า', verb: 'ตรวจสอบ', discover: 'ใต้รากไม้ที่โผล่พ้นดิน คุณสังเกตเห็นบางอย่างสะท้อนแสง...' },
  { id: 'trap_1', ...tileCenter(9, 12), kind: 'trap', label: 'แผ่นหินกับดัก', shadow: false },
  { id: 'shadow_wolf', x: 296, y: 56, kind: 'creature', sprite: 'creature_wolf', anim: 'creature_wolf-run', tint: 0x8E6BD1, scale: 1.5, label: 'หมาป่าเงา', discover: 'ดวงตาสีเขียวเรืองแสงคู่หนึ่งจ้องมองมาจากเงามืดของโพรงไม้... เสียงคำรามต่ำๆ ก้องอยู่ในลำคอของมัน' },
  { id: 'rest_1', ...tileCenter(17, 13), kind: 'campfire', label: 'กองไฟ', verb: 'พักผ่อน', discover: 'ร่องรอยกองไฟเก่าที่ยังพอใช้ก่อไฟพักได้อยู่' }
]
