import {
  buildGroundMap,
  buildTreePositions,
  HOUSES,
  DECORATIONS,
  NPC_PLACEMENTS,
  LOCAL_INTERACTABLES,
  ENCOUNTER_MARKERS,
  spawnPoint,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS
} from '../maps/villageMap'
import ZoneScene from './ZoneScene'

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
}
