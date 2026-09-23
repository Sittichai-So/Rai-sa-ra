import {
  buildGroundMap,
  spawnPoint,
  TREES,
  DECORATIONS,
  EXIT_PROPS,
  LOCAL_INTERACTABLES,
  ENCOUNTER_MARKERS,
  CAMP_DECORATIONS,
  CAMP_ENCOUNTER_MARKERS,
  CAMP_NPC_PLACEMENTS,
  CAMP_NPC_PLACEMENTS_MALI,
  CAMP_NPC_PLACEMENTS_HERBALIST,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS
} from '../maps/forestMap'
import { getFlag } from '../systems/gameState'
import ZoneScene from './ZoneScene'

export default class ForestScene extends ZoneScene {
  constructor () {
    super('Forest', 'forest')
  }

  buildWorld () {
    const map = this.make.tilemap({ data: buildGroundMap(), tileWidth: TILE_SIZE, tileHeight: TILE_SIZE })
    const tileset = map.addTilesetImage('wild-tileset', 'wild-tileset', TILE_SIZE, TILE_SIZE, 0, 0)
    map.createLayer(0, tileset, 0, 0)

    this.objects.placeAll(TREES)
    this.objects.placeAll(DECORATIONS)
    this.objects.placeAll(EXIT_PROPS)

    this.add.particles(0, 0, 'forest-leaf-particle', {
      x: { min: 0, max: MAP_COLS * TILE_SIZE },
      y: -8,
      lifespan: 7000,
      speedY: { min: 10, max: 20 },
      speedX: { min: -6, max: 6 },
      rotate: { min: 0, max: 360 },
      alpha: { start: 0.7, end: 0.15 },
      frequency: 500,
      quantity: 1
    }).setDepth(9000)

    return { width: MAP_COLS * TILE_SIZE, height: MAP_ROWS * TILE_SIZE, spawn: spawnPoint() }
  }

  markerDefs () {
    return ENCOUNTER_MARKERS
  }

  worldReady () {
    LOCAL_INTERACTABLES.forEach(item => this.addLocalInteractable(item))
  }

  applyZoneVariant (variant) {
    if (variant !== 'camp') { return }
    this.objects.placeAll(CAMP_DECORATIONS)
    this.markers.build(CAMP_ENCOUNTER_MARKERS)
    this.markerDefList = this.markerDefList.concat(CAMP_ENCOUNTER_MARKERS)
    CAMP_NPC_PLACEMENTS.forEach(npc => this.addNpc(npc))
    if (getFlag('saved_mali')) { CAMP_NPC_PLACEMENTS_MALI.forEach(npc => this.addNpc(npc)) }
    if (getFlag('saved_herbalist')) { CAMP_NPC_PLACEMENTS_HERBALIST.forEach(npc => this.addNpc(npc)) }
  }
}
