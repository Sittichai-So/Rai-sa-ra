import {
  buildGroundMap,
  buildTreePositions,
  HOUSES,
  DECORATIONS,
  NPC_PLACEMENTS,
  LOCAL_INTERACTABLES,
  ENCOUNTER_MARKERS,
  SIEGE_ENCOUNTER_MARKERS,
  RUINED_ENCOUNTER_MARKERS,
  spawnPoint,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS
} from '../maps/villageMap'
import ZoneScene from './ZoneScene'

const HIDDEN_NPCS_ON_CRISIS = ['npc:elder', 'npc:innkeeper', 'npc:merchant', 'npc:healer', 'npc:villager']

export default class WorldScene extends ZoneScene {
  constructor () {
    super('World', 'village')
  }

  buildWorld () {
    const map = this.make.tilemap({ data: buildGroundMap(), tileWidth: TILE_SIZE, tileHeight: TILE_SIZE })
    const tileset = map.addTilesetImage('village-tileset', 'village-tileset', TILE_SIZE, TILE_SIZE, 0, 0)
    map.createLayer(0, tileset, 0, 0)

    this.objects.placeAll(buildTreePositions())
    this.objects.placeAll(HOUSES)
    this.objects.placeAll(DECORATIONS)

    this.leafEmitter = this.add.particles(0, 0, 'leaf-particle', {
      x: { min: 0, max: MAP_COLS * TILE_SIZE },
      y: -8,
      lifespan: 6000,
      speedY: { min: 12, max: 24 },
      speedX: { min: -8, max: 8 },
      rotate: { min: 0, max: 360 },
      alpha: { start: 0.8, end: 0.2 },
      frequency: 400,
      quantity: 1
    }).setDepth(9000)

    return { width: MAP_COLS * TILE_SIZE, height: MAP_ROWS * TILE_SIZE, spawn: spawnPoint() }
  }

  markerDefs () {
    return ENCOUNTER_MARKERS
  }

  worldReady () {
    NPC_PLACEMENTS.forEach(npc => this.addNpc(npc))
    LOCAL_INTERACTABLES.forEach(item => this.addLocalInteractable(item))
  }

  applyZoneVariant (variant) {
    if (variant === 'siege' || variant === 'ruined') {
      HIDDEN_NPCS_ON_CRISIS.forEach((id) => {
        const npc = this.npcs.get(id)
        if (npc) { npc.sprite.setVisible(false); npc.text.setVisible(false) }
        this.interaction.unregister(id)
      })
    }
    if (variant === 'siege') {
      this.markers.build(SIEGE_ENCOUNTER_MARKERS)
      this.markerDefList = this.markerDefList.concat(SIEGE_ENCOUNTER_MARKERS)
      this.startFireParticles()
    }
    if (variant === 'ruined') {
      this.markers.build(RUINED_ENCOUNTER_MARKERS)
      this.markerDefList = this.markerDefList.concat(RUINED_ENCOUNTER_MARKERS)
      this.addMonumentGlow('rgba(160, 80, 255, 0.9)', 'rgba(160, 80, 255, 0)', 'purple-glow')
    }
    if (variant === 'restored') {
      const elder = this.npcs.get('npc:elder')
      if (elder) { elder.sprite.setVisible(false); elder.text.setVisible(false) }
      this.interaction.unregister('npc:elder')
      this.addMonumentGlow('rgba(255, 215, 120, 0.9)', 'rgba(255, 200, 90, 0)', 'gold-glow')
    }
  }

  startFireParticles () {
    if (!this.textures.exists('ember-particle')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(0xFFAA33, 1)
      g.fillCircle(3, 3, 3)
      g.generateTexture('ember-particle', 6, 6)
      g.destroy()
    }
    const spots = [{ x: 56, y: 104 }, { x: 312, y: 88 }, { x: 280, y: 200 }]
    spots.forEach((spot) => {
      this.add.particles(spot.x, spot.y, 'ember-particle', {
        x: { min: -8, max: 8 },
        y: { min: -4, max: 4 },
        lifespan: 900,
        speedY: { min: -40, max: -70 },
        speedX: { min: -10, max: 10 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [0xFFAA33, 0xFF5522],
        frequency: 120,
        quantity: 1
      }).setDepth(9500)
    })
  }

  addMonumentGlow (inner, outer, key) {
    if (!this.textures.exists(key)) {
      const glow = this.textures.createCanvas(key, 48, 48)
      const ctx = glow.getContext()
      const gradient = ctx.createRadialGradient(24, 24, 2, 24, 24, 24)
      gradient.addColorStop(0, inner)
      gradient.addColorStop(1, outer)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 48, 48)
      glow.refresh()
    }
    const glowSprite = this.add.image(56, 224, key).setBlendMode('ADD').setAlpha(0.4).setDepth(9000)
    this.tweens.add({ targets: glowSprite, alpha: 0.65, scale: 1.15, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
  }
}
