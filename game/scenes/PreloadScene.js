// eslint-disable-next-line import/default
import Phaser from 'phaser'
import { preloadCommon, createCommon } from '../systems/assets'
import villageTileset from '~/assets/images/rpg-world/village-openrtp/village-tileset-openrtp.png'
import houseRed from '~/assets/images/rpg-world/village-serene/house_red.png'
import houseGreen from '~/assets/images/rpg-world/village-serene/house_green.png'
import houseBlue from '~/assets/images/rpg-world/village-serene/house_blue.png'
import houseBig from '~/assets/images/rpg-world/village-serene/house_big.png'
import treeBig from '~/assets/images/rpg-world/village-openrtp/tree_big.png'
import treeRound from '~/assets/images/rpg-world/village-openrtp/tree_round.png'
import bushFlower from '~/assets/images/rpg-world/village-openrtp/bush_flower.png'
import bushGreen from '~/assets/images/rpg-world/village-openrtp/bush_green.png'
import stump from '~/assets/images/rpg-world/village-openrtp/stump.png'
import fenceH from '~/assets/images/rpg-world/village-openrtp/fence_h.png'
import well from '~/assets/images/rpg-world/village-openrtp/well.png'
import torch from '~/assets/images/rpg-world/village-openrtp/torch.png'
import statue from '~/assets/images/rpg-world/village-openrtp/statue.png'
import tent from '~/assets/images/rpg-world/village-openrtp/tent.png'
import bench from '~/assets/images/rpg-world/village-openrtp/bench.png'
import flowerpot from '~/assets/images/rpg-world/village-openrtp/flowerpot.png'
import jug from '~/assets/images/rpg-world/village-openrtp/jug.png'
import monument from '~/assets/images/rpg-world/village-openrtp/monument.png'
import flowerPatch from '~/assets/images/rpg-world/village-openrtp/flower_patch.png'
import barrel from '~/assets/images/rpg-world/village-openrtp/barrel.png'
import noticeBoard from '~/assets/images/rpg-world/village-openrtp/notice_board.png'
import signInn from '~/assets/images/rpg-world/village-openrtp/sign_inn.png'

const VILLAGE_IMAGES = {
  'village-tileset': villageTileset,
  house_red: houseRed,
  house_green: houseGreen,
  house_blue: houseBlue,
  house_big: houseBig,
  tree_big: treeBig,
  tree_round: treeRound,
  bush_flower: bushFlower,
  bush_green: bushGreen,
  stump,
  fence_h: fenceH,
  well,
  torch,
  statue,
  tent,
  bench,
  flowerpot,
  jug,
  monument,
  flower_patch: flowerPatch,
  barrel,
  notice_board: noticeBoard,
  sign_inn: signInn
}

export default class PreloadScene extends Phaser.Scene {
  constructor () {
    super('Preload')
  }

  preload () {
    Object.entries(VILLAGE_IMAGES).forEach(([key, image]) => this.load.image(key, image))
    preloadCommon(this)
  }

  create () {
    createCommon(this)

    const leaf = this.make.graphics({ x: 0, y: 0, add: false })
    leaf.fillStyle(0x8FBC6A, 1)
    leaf.fillEllipse(3, 2, 6, 4)
    leaf.generateTexture('leaf-particle', 6, 4)
    leaf.destroy()

    this.scene.start('World')
  }
}
