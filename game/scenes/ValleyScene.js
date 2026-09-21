import {
  buildGroundMap,
  spawnPoint,
  DECORATIONS,
  EXIT_PROPS,
  LOCAL_INTERACTABLES,
  ENCOUNTER_MARKERS,
  TILE_SIZE,
  MAP_COLS,
  MAP_ROWS
} from '../maps/valleyMap'
import { WILD, isMountainTile } from '../maps/wildTiles'
import ZoneScene from './ZoneScene'

export default class ValleyScene extends ZoneScene {
  constructor () {
    super('Valley', 'valley')
  }

  buildWorld () {
    const map = this.make.tilemap({ data: buildGroundMap(), tileWidth: TILE_SIZE, tileHeight: TILE_SIZE })
    const tileset = map.addTilesetImage('wild-tileset', 'wild-tileset', TILE_SIZE, TILE_SIZE, 0, 0)
    this.groundLayer = map.createLayer(0, tileset, 0, 0)
    this.groundLayer.setCollisionBetween(WILD.MOUNTAIN, WILD.MOUNTAIN + WILD.MOUNTAIN_COUNT - 1)

    this.objects.placeAll(DECORATIONS)
    this.objects.placeAll(EXIT_PROPS)

    return { width: MAP_COLS * TILE_SIZE, height: MAP_ROWS * TILE_SIZE, spawn: spawnPoint() }
  }

  addPlayerColliders () {
    this.objects.collide(this.player)
    this.physics.add.collider(this.player, this.groundLayer)
  }

  debugTiles () {
    return this.groundLayer.filterTiles(tile => isMountainTile(tile.index)).map(tile => ({ x: tile.pixelX, y: tile.pixelY, w: TILE_SIZE, h: TILE_SIZE }))
  }

  markerDefs () {
    return ENCOUNTER_MARKERS
  }

  worldReady () {
    LOCAL_INTERACTABLES.forEach(item => this.addLocalInteractable(item))
  }
}
