// eslint-disable-next-line import/default
import Phaser from 'phaser'
import { preloadCommon, createCommon } from '../systems/assets'
import wildTileset from '~/assets/images/rpg-world/forest/wild-tileset-openrtp.png'
import treeBushy from '~/assets/images/rpg-world/forest/tree_bushy.png'
import treePine from '~/assets/images/rpg-world/forest/tree_pine.png'
import bushBig from '~/assets/images/rpg-world/forest/bush_big.png'
import bushSmall from '~/assets/images/rpg-world/forest/bush_small.png'
import logSprite from '~/assets/images/rpg-world/forest/log.png'
import reeds from '~/assets/images/rpg-world/forest/reeds.png'
import boulder from '~/assets/images/rpg-world/forest/boulder.png'
import tileCliff from '~/assets/images/rpg-world/forest/tile_cliff.png'
import mushroomCluster from '~/assets/images/rpg-world/forest/mushroom_cluster.png'
import mushroomSingle from '~/assets/images/rpg-world/forest/mushroom_single.png'
import signpost from '~/assets/images/rpg-world/village-openrtp/signpost.png'
import tent from '~/assets/images/rpg-world/village-openrtp/tent.png'

const FOREST_IMAGES = {
  'wild-tileset': wildTileset,
  tree_bushy: treeBushy,
  tree_pine: treePine,
  bush_big: bushBig,
  bush_small: bushSmall,
  log: logSprite,
  reeds,
  boulder,
  tile_cliff: tileCliff,
  mushroom_cluster: mushroomCluster,
  mushroom_single: mushroomSingle,
  signpost,
  tent
}

export default class ForestPreloadScene extends Phaser.Scene {
  constructor () {
    super('ForestPreload')
  }

  preload () {
    Object.entries(FOREST_IMAGES).forEach(([key, image]) => this.load.image(key, image))
    preloadCommon(this)
  }

  create () {
    createCommon(this)

    const leaf = this.make.graphics({ x: 0, y: 0, add: false })
    leaf.fillStyle(0x3A5A2A, 1)
    leaf.fillEllipse(3, 2, 6, 4)
    leaf.generateTexture('forest-leaf-particle', 6, 4)
    leaf.destroy()

    this.scene.start('Forest')
  }
}
