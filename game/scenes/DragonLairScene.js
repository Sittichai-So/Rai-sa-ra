import {
  buildRoomMap,
  spawnPoint,
  DECORATIONS,
  TORCHES,
  LAVA_GLOW_SPOTS,
  DRAGON_POS,
  LOCAL_INTERACTABLES,
  ENCOUNTER_MARKERS,
  WALL_FRAMES,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS
} from '../maps/dragonLairMap'
import { getFlag, setFlag } from '../systems/gameState'
import { narrateScene } from '../systems/dm'
import ZoneScene from './ZoneScene'

const DECOR_TEXTURES = {
  floor_ladder: 'floor_ladder',
  skull: 'skull',
  door: 'door'
}

export default class DragonLairScene extends ZoneScene {
  constructor () {
    super('DragonLair', 'dragon_lair')
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
    LAVA_GLOW_SPOTS.forEach((p) => {
      const glow = this.add.image(p.x, p.y, 'lava-glow').setBlendMode('ADD').setAlpha(0.5).setDepth(1)
      this.tweens.add({ targets: glow, alpha: 0.78, scale: 1.15, duration: 500 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    })
    if (!getFlag('dm:dragon_lair_intro')) {
      setFlag('dm:dragon_lair_intro')
      this.time.delayedCall(500, () => this.playDragonIntro())
    }
  }

  playDragonIntro () {
    this.setLock('cutscene', true)
    const cam = this.cameras.main
    const flashOverlay = this.add.rectangle(0, 0, 4000, 4000, 0x550000, 0).setScrollFactor(0).setDepth(999998)
    const pulse = () => this.tweens.add({ targets: flashOverlay, alpha: 0.22, duration: 450, yoyo: true, ease: 'Sine.easeInOut' })
    pulse()
    this.time.delayedCall(900, pulse)
    this.time.delayedCall(1900, () => {
      cam.stopFollow()
      cam.zoomTo(0.6, 900, 'Sine.easeInOut')
      cam.pan(DRAGON_POS.x, DRAGON_POS.y, 900, 'Sine.easeInOut')
      this.time.delayedCall(1200, () => {
        cam.shake(600, 0.012)
        cam.flash(300, 150, 20, 20)
        this.time.delayedCall(900, () => {
          cam.pan(this.player.x, this.player.y, 700, 'Sine.easeInOut')
          cam.zoomTo(this.zoom, 700, 'Sine.easeInOut')
          this.time.delayedCall(750, () => {
            cam.startFollow(this.player, true, 0.1, 0.1)
            flashOverlay.destroy()
            narrateScene([
              'กลิ่นเลือดของผู้พิทักษ์... ติดตัวเจ้ามาถึงที่นี่',
              'เจ้ามนุษย์ เจ้าฆ่าเงาแห่งป่า เจ้าฆ่าผู้เฝ้าสะพาน และบัดนี้เจ้ามาเพื่อข้า',
              'ดี จงแสดงให้ข้าเห็นว่าเจ้าคู่ควรจะได้ฟังความจริง หรือเป็นเพียงหุ่นเชิดของมัน'
            ], [], () => this.setLock('cutscene', false))
          })
        })
      })
    })
  }
}
