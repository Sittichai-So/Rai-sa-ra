// eslint-disable-next-line import/default
import Phaser from 'phaser'
import { preloadCommon, createCommon } from '../systems/assets'
import wildTileset from '~/assets/images/rpg-world/forest/wild-tileset-openrtp.png'
import treePine from '~/assets/images/rpg-world/forest/tree_pine.png'
import logSprite from '~/assets/images/rpg-world/forest/log.png'
import boulder from '~/assets/images/rpg-world/forest/boulder.png'
import signpost from '~/assets/images/rpg-world/village-openrtp/signpost.png'
import ladder from '~/assets/images/rpg-world/village-openrtp/ladder.png'

const VALLEY_IMAGES = {
  'wild-tileset': wildTileset,
  tree_pine: treePine,
  log: logSprite,
  boulder,
  signpost,
  ladder
}

export default class ValleyPreloadScene extends Phaser.Scene {
  constructor () {
    super('ValleyPreload')
  }

  preload () {
    Object.entries(VALLEY_IMAGES).forEach(([key, image]) => this.load.image(key, image))
    preloadCommon(this)
  }

  create () {
    createCommon(this)
    this.scene.start('Valley')
  }
}
