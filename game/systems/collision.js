import { KIND, kindFor, footprintFor } from '../data/objectCatalog'

const DEBUG_COLORS = {
  [KIND.SOLID]: 0xFF5A5A,
  npc: 0xFFB84A,
  blocker: 0xFF5A5A
}

export default class WorldObjects {
  constructor (scene, tileSize = 16) {
    this.scene = scene
    this.tileSize = tileSize
    this.solids = scene.physics.add.staticGroup()
    this.records = []
  }

  position (def) {
    if (def.at) { return { x: def.at[0], y: def.at[1] } }
    return {
      x: def.tile[0] * this.tileSize + this.tileSize / 2,
      y: def.tile[1] * this.tileSize + this.tileSize
    }
  }

  place (def) {
    const { x, y } = this.position(def)
    const sprite = this.scene.add.image(x, y, def.sprite).setOrigin(0.5, 1)
    sprite.setDepth(def.depth !== undefined ? def.depth : y)
    const kind = kindFor(def, def.sprite)
    let blocker = null
    if (kind === KIND.SOLID) {
      const fp = footprintFor(def, def.sprite, sprite.width, sprite.height)
      const left = x - sprite.width / 2 + fp.x
      const top = y - sprite.height + fp.y
      blocker = this.addBlocker(left + fp.w / 2, top + fp.h / 2, fp.w, fp.h, def.sprite)
    }
    this.records.push({ sprite, kind, def, blocker })
    return sprite
  }

  placeAll (defs) {
    defs.forEach(def => this.place(def))
  }

  addBlocker (cx, cy, w, h, tag = 'blocker') {
    const zone = this.scene.add.zone(cx, cy, w, h)
    this.scene.physics.add.existing(zone, true)
    this.solids.add(zone)
    zone.blockerTag = tag
    return zone
  }

  addNpcBlocker (x, y, tag = 'npc') {
    return this.addBlocker(x, y - 3, 10, 6, tag)
  }

  collide (target) {
    return this.scene.physics.add.collider(target, this.solids)
  }

  debugBoxes () {
    return this.solids.getChildren().map(zone => ({
      x: zone.body.x,
      y: zone.body.y,
      w: zone.body.width,
      h: zone.body.height,
      color: DEBUG_COLORS[zone.blockerTag === 'npc' ? 'npc' : KIND.SOLID],
      tag: zone.blockerTag
    }))
  }
}
