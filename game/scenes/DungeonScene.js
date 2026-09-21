import {
  buildRoomMap,
  spawnPoint,
  DECORATIONS,
  BANNERS,
  TORCHES,
  LOCAL_INTERACTABLES,
  ENCOUNTER_MARKERS,
  WALL_FRAMES,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS
} from '../maps/dungeonMap'
import ZoneScene from './ZoneScene'

const DECOR_TEXTURES = {
  floor_ladder: 'floor_ladder',
  skull: 'skull',
  door: 'door'
}
const BANNER_TEXTURES = {
  banner_red: 'banner_red',
  banner_blue: 'banner_blue'
}

export default class DungeonScene extends ZoneScene {
  constructor () {
    super('Dungeon', 'dungeon')
    this.speed = 70
    this.viewWidth = 160
  }

  buildWorld () {
    const map = this.make.tilemap({ data: buildRoomMap(), tileWidth: TILE_SIZE, tileHeight: TILE_SIZE })
    const tileset = map.addTilesetImage('dungeon-tileset', 'dungeon-tileset', TILE_SIZE, TILE_SIZE, 0, 0)
    this.floorLayer = map.createLayer(0, tileset, 0, 0)
    this.floorLayer.setCollision(WALL_FRAMES)

    BANNERS.forEach((b) => {
      this.add.sprite(b.x, b.y, BANNER_TEXTURES[b.sprite]).setOrigin(0.5, 0.7)
    })
    TORCHES.forEach((t) => {
      this.add.image(t.x, t.y + 1, 'torch').setOrigin(0.5, 0.7)
      const glow = this.add.image(t.x, t.y + 3, 'torch-glow').setBlendMode('ADD').setAlpha(0.32).setDepth(9000)
      this.tweens.add({ targets: glow, alpha: 0.5, scale: 1.08, duration: 380 + Math.random() * 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    })
    DECORATIONS.forEach((d) => {
      this.add.sprite(d.x, d.y + 5, 'marker-shadow').setScale(0.7)
      this.add.sprite(d.x, d.y, DECOR_TEXTURES[d.sprite]).setOrigin(0.5, 0.75)
    })

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
}
