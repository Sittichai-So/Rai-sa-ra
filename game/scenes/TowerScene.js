import {
  buildRoomMap,
  spawnPoint,
  DECORATIONS,
  TORCHES,
  BANNERS,
  THRONE_POS,
  LOCAL_INTERACTABLES,
  ENCOUNTER_MARKERS,
  WALL_FRAMES,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS
} from '../maps/towerMap'
import ZoneScene from './ZoneScene'

export default class TowerScene extends ZoneScene {
  constructor () {
    super('Tower', 'tower')
    this.speed = 70
    this.viewWidth = 176
  }

  buildWorld () {
    const map = this.make.tilemap({ data: buildRoomMap(), tileWidth: TILE_SIZE, tileHeight: TILE_SIZE })
    const tileset = map.addTilesetImage('dungeon-tileset', 'dungeon-tileset', TILE_SIZE, TILE_SIZE, 0, 0)
    this.floorLayer = map.createLayer(0, tileset, 0, 0)
    this.floorLayer.setCollision(WALL_FRAMES)

    TORCHES.forEach((t) => {
      this.add.image(t.x, t.y + 1, 'torch').setOrigin(0.5, 0.7)
      const glow = this.add.image(t.x, t.y + 3, 'torch-glow').setBlendMode('ADD').setAlpha(0.3).setDepth(9000)
      this.tweens.add({ targets: glow, alpha: 0.48, scale: 1.08, duration: 420 + Math.random() * 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    })
    BANNERS.forEach(b => this.add.image(b.x, b.y, 'banner'))
    DECORATIONS.forEach((d) => {
      this.add.sprite(d.x, d.y + 5, 'marker-shadow').setScale(0.7)
      this.add.sprite(d.x, d.y, d.sprite).setOrigin(0.5, 0.75)
    })

    this.throneAura = this.add.particles(THRONE_POS.x, THRONE_POS.y + 4, 'soul-particle', {
      x: { min: -18, max: 18 },
      y: { min: -4, max: 6 },
      lifespan: 1600,
      speedY: { min: -18, max: -30 },
      alpha: { start: 0.8, end: 0 },
      tint: [0xB38CFF, 0x7A3FD1],
      frequency: 140,
      quantity: 1
    }).setDepth(9000)

    return { width: MAP_COLS * TILE_SIZE, height: MAP_ROWS * TILE_SIZE, spawn: spawnPoint() }
  }

  addPlayerColliders () {
    this.objects.collide(this.player)
    this.physics.add.collider(this.player, this.floorLayer)
  }

  debugTiles () {
    return this.floorLayer.filterTiles(tile => WALL_FRAMES.includes(tile.index)).map(tile => ({ x: tile.pixelX, y: tile.pixelY, w: TILE_SIZE, h: TILE_SIZE }))
  }

  markerDefs () {
    return ENCOUNTER_MARKERS
  }

  worldReady () {
    LOCAL_INTERACTABLES.forEach(item => this.addLocalInteractable(item))
  }

  applyZoneVariant (variant) {
    if (variant !== 'fallen') { return }
    this.markers.complete('morkal_throne')
    this.throneAura.stop()
  }
}
