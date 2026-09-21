export const TILE = {
  GRASS: 0,
  PATH: 1,
  WATER: 2
}

export const TILE_SIZE = 16
export const MAP_COLS = 26
export const MAP_ROWS = 19

export function buildGroundMap () {
  const map = []
  const pathCol = Math.floor(MAP_COLS / 2)
  for (let y = 0; y < MAP_ROWS; y++) {
    const row = []
    for (let x = 0; x < MAP_COLS; x++) {
      row.push(x === pathCol ? TILE.PATH : TILE.GRASS)
    }
    map.push(row)
  }
  return map
}

export function buildTreePositions () {
  const trees = []
  const pathCol = Math.floor(MAP_COLS / 2)
  const variants = ['tree_big', 'tree_round']
  let i = 0

  for (let x = 0; x < MAP_COLS; x++) {
    if (x !== pathCol) { trees.push({ sprite: variants[i++ % 2], tile: [x, 0] }) }
    trees.push({ sprite: variants[i++ % 2], tile: [x, MAP_ROWS - 1] })
  }
  for (let y = 1; y < MAP_ROWS - 1; y++) {
    trees.push({ sprite: variants[i++ % 2], tile: [0, y] })
    trees.push({ sprite: variants[i++ % 2], tile: [MAP_COLS - 1, y] })
  }

  return trees
}

function fenceRun (x0, x1, y) {
  const run = []
  for (let x = x0; x <= x1; x++) { run.push({ sprite: 'fence_h', tile: [x, y] }) }
  return run
}

export const HOUSES = [
  { sprite: 'house_red', tile: [3, 6] },
  { sprite: 'house_green', tile: [8, 4] },
  { sprite: 'house_blue', tile: [19, 5] },
  { sprite: 'house_big', tile: [17, 12] }
]

export const DECORATIONS = [
  { sprite: 'well', tile: [9, 12] },
  { sprite: 'statue', tile: [15, 3] },
  { sprite: 'monument', tile: [3, 14] },
  { sprite: 'tent', tile: [22, 10] },
  { sprite: 'tree_dead', tile: [23, 15] },
  { sprite: 'notice_board', tile: [10, 3] },
  { sprite: 'sign_inn', at: [262, 206], kind: 'decoration', depth: 500 },
  { sprite: 'barrel', tile: [24, 12] },
  { sprite: 'bench', tile: [6, 9] },
  { sprite: 'flowerpot', tile: [5, 6] },
  { sprite: 'jug', tile: [4, 13] },
  { sprite: 'torch', tile: [12, 4] },
  { sprite: 'torch', tile: [14, 4] },
  { sprite: 'stump', tile: [21, 14] },
  { sprite: 'bush_flower', tile: [5, 8] },
  { sprite: 'bush_green', tile: [10, 6] },
  { sprite: 'bush_flower', tile: [24, 7] },
  { sprite: 'bush_green', tile: [16, 14] },
  { sprite: 'bush_green', tile: [2, 10] },
  { sprite: 'bush_flower', tile: [11, 15] },
  { sprite: 'flower_patch', tile: [4, 4] },
  { sprite: 'flower_patch', tile: [12, 7] },
  { sprite: 'flower_patch', tile: [15, 10] },
  { sprite: 'flower_patch', tile: [22, 4] },
  { sprite: 'flower_patch', tile: [7, 16] },
  { sprite: 'flower_patch', tile: [19, 16] },
  ...fenceRun(6, 9, 8),
  ...fenceRun(20, 23, 7)
]

export function spawnPoint () {
  const pathCol = Math.floor(MAP_COLS / 2)
  return {
    x: pathCol * TILE_SIZE + TILE_SIZE / 2,
    y: (MAP_ROWS - 2) * TILE_SIZE + TILE_SIZE / 2
  }
}

export const NPC_PLACEMENTS = [
  { id: 'npc:elder', npcId: 'elder', x: 120, y: 232, texture: 'npc_elder', facing: 'right', name: 'ผู้เฒ่าประจำหมู่บ้าน', verb: 'พูดคุยกับ' },
  { id: 'npc:innkeeper', npcId: 'innkeeper', x: 322, y: 206, texture: 'npc_innkeeper', facing: 'left', name: 'ป้ามาลี', label: 'ป้ามาลี (โรงเตี๊ยม)', verb: 'พูดคุยกับ' },
  { id: 'npc:merchant', npcId: 'merchant', x: 348, y: 190, texture: 'npc_merchant', facing: 'left', name: 'พ่อค้าเร่', label: 'พ่อค้าเร่ นายเกล็ด', verb: 'พูดคุยกับ' },
  { id: 'npc:healer', npcId: 'healer', x: 232, y: 152, texture: 'npc_healer', facing: 'down', name: 'หมอสมุนไพร', label: 'หมอสมุนไพร', verb: 'พูดคุยกับ' },
  { id: 'npc:villager', npcId: 'villager', x: 110, y: 112, texture: 'npc_villager', facing: 'right', name: 'ชาวบ้าน', label: 'ชาวบ้านหัวฟักทอง', verb: 'พูดคุยกับ' }
]

export const LOCAL_INTERACTABLES = [
  { id: 'village_gate', x: 216, y: 16, radius: 30, verb: 'ออกผจญภัย', label: 'ประตูเหนือ', kind: 'gate', priority: 1 },
  { id: 'quest_board', x: 168, y: 62, radius: 26, verb: 'อ่านป้ายประกาศ', label: 'กระดานภารกิจ', kind: 'board', priority: 2 },
  { id: 'village_signpost', x: 200, y: 262, radius: 22, verb: 'อ่านป้าย', label: 'ป้ายไม้', kind: 'sign', priority: 1, data: { text: 'ป้ายไม้เขียนด้วยลายมือเก่าๆ ว่า: “ทิศเหนือ — ป่าต้องคำสาป · ทิศตะวันออก — หุบเขาร้าง” ปลายป้ายมีรอยข่วนลึกที่ดูเหมือนรอยเล็บของบางสิ่ง' } }
]

export const ENCOUNTER_MARKERS = [
  { id: 'goblin_ambush', x: 216, y: 40, kind: 'creature', sprite: 'creature_goblin', origin: [0.5, 0.85], label: 'ก็อบลินสอดแนม', verb: 'โจมตี', discover: 'เงาตะคุ่มๆ ขยับอยู่ริมทาง ก็อบลินตาเหล่ตัวหนึ่งกำลังซุ่มมองผู้คนที่เดินผ่านไปมา...' },
  { id: 'lost_pup', x: 184, y: 168, kind: 'creature', sprite: 'creature_pup', anim: 'creature_pup-run', label: 'ลูกหมาป่าหลงทาง', verb: 'เข้าไปดู', discover: 'เสียงร้องคราง “แงว...แงว...” แผ่วเบาดังมาจากข้างทาง' },
  { id: 'treasure_1', x: 280, y: 120, kind: 'chest', label: 'หีบไม้เก่า', verb: 'ตรวจสอบ', discover: 'ใต้เงาไม้ คุณสังเกตเห็นบางอย่างสะท้อนแสงวูบวาบ...' },
  { id: 'trap_1', x: 152, y: 120, kind: 'trap', label: 'แผ่นหินกับดัก', shadow: false },
  { id: 'rest_1', x: 248, y: 248, kind: 'campfire', label: 'กองไฟ', verb: 'พักผ่อน', discover: 'กองไฟเล็กๆ ที่ยังมีถ่านแดงคุอยู่ ดูเหมือนมีใครเคยพักที่นี่' }
]
