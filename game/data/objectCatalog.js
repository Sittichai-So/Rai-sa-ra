export const KIND = {
  SOLID: 'solid',
  DECORATION: 'decoration',
  TRIGGER: 'trigger',
  INTERACTABLE: 'interactable'
}

const base = (w, h, lift = 0) => ({ base: [w, h, lift] })
const full = (insetX = 0, top = 0, bottom = 0) => ({ full: [insetX, top, bottom] })
const solid = footprint => ({ kind: KIND.SOLID, footprint })
const decor = () => ({ kind: KIND.DECORATION, footprint: null })

export const OBJECT_CATALOG = {
  house_red: solid(full(2, 8, 8)),
  house_green: solid(full(2, 8, 8)),
  house_blue: solid(full(2, 8, 8)),
  house_big: solid(full(2, 10, 8)),
  tree_big: solid(base(16, 12)),
  tree_round: solid(base(16, 12)),
  tree_dead: solid(base(8, 8)),
  fence_h: solid(full(0, 5, 0)),
  well: solid(full(1, 4, 0)),
  statue: solid(base(14, 10)),
  monument: solid(full(4, 22, 2)),
  tent: solid(full(4, 18, 2)),
  bench: solid(full(0, 1, 0)),
  campfire: solid(base(10, 8)),
  torch: solid(base(6, 6)),
  flowerpot: solid(base(8, 6)),
  jug: solid(base(10, 8)),
  barrel: solid(base(12, 10)),
  crate: solid(base(14, 10)),
  bed: solid(full(0, 8, 0)),
  stump: solid(base(9, 6)),
  bush_flower: solid(base(14, 9)),
  bush_green: solid(base(14, 9)),
  signpost: solid(base(8, 6)),
  notice_board: solid(base(12, 8)),
  flower_patch: decor(),
  tree_bushy: solid(base(22, 14)),
  tree_pine: solid(base(14, 12)),
  bush_big: solid(base(24, 12)),
  bush_small: decor(),
  boulder: solid(base(16, 14)),
  rock_small: solid(base(24, 12)),
  tile_cliff: solid(full(0, 2, 0)),
  log: decor(),
  reeds: decor(),
  grass_tuft: decor(),
  mushroom_cluster: decor(),
  mushroom_single: decor()
}

export function resolveFootprint (spec, width, height) {
  if (!spec) { return null }
  if (spec.box) {
    const [x, y, w, h] = spec.box
    return { x, y, w, h }
  }
  if (spec.full) {
    const [insetX, top, bottom] = spec.full
    return { x: insetX, y: top, w: Math.max(2, width - insetX * 2), h: Math.max(2, height - top - bottom) }
  }
  const [w, h, lift] = spec.base
  const bw = Math.min(w, width)
  const bh = Math.min(h, height)
  return { x: (width - bw) / 2, y: height - bh - lift, w: bw, h: bh }
}

export function defaultFootprint (width, height) {
  return { base: [Math.min(width, 14), Math.min(height, 10), 0] }
}

export function kindFor (def, spriteKey) {
  if (def.kind) { return def.kind }
  if (def.solid === true) { return KIND.SOLID }
  if (def.solid === false) { return KIND.DECORATION }
  const entry = OBJECT_CATALOG[spriteKey]
  return entry ? entry.kind : KIND.DECORATION
}

export function footprintFor (def, spriteKey, width, height) {
  if (def.footprint) { return resolveFootprint(def.footprint, width, height) }
  const entry = OBJECT_CATALOG[spriteKey]
  const spec = (entry && entry.footprint) || defaultFootprint(width, height)
  return resolveFootprint(spec, width, height)
}
