// eslint-disable-next-line import/default
import Phaser from 'phaser'
import { preloadCommon, createCommon } from '../systems/assets'
import dungeonTileset from '~/assets/images/rpg-world/dungeon/dungeon-tileset-openrtp.png'
import skullSprite from '~/assets/images/rpg-world/dungeon/skull.png'
import ladderSprite from '~/assets/images/rpg-world/dungeon/floor_ladder.png'
import torchSprite from '~/assets/images/rpg-world/village-openrtp/torch.png'
import doorSprite from '~/assets/images/rpg-world/dungeon/doors_leaf_closed.png'
import dragonAncient from '~/assets/images/rpg-world/dungeon/dragon_ancient.png'

export default class DragonLairPreloadScene extends Phaser.Scene {
  constructor () {
    super('DragonLairPreload')
  }

  preload () {
    this.load.image('dungeon-tileset', dungeonTileset)
    this.load.image('skull', skullSprite)
    this.load.image('floor_ladder', ladderSprite)
    this.load.image('torch', torchSprite)
    this.load.image('door', doorSprite)
    this.load.image('dragon_ancient', dragonAncient)
    preloadCommon(this)
  }

  create () {
    createCommon(this, 0.4)

    if (!this.textures.exists('torch-glow')) {
      const glow = this.textures.createCanvas('torch-glow', 64, 64)
      const ctx = glow.getContext()
      const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32)
      gradient.addColorStop(0, 'rgba(255, 190, 90, 0.85)')
      gradient.addColorStop(1, 'rgba(255, 120, 30, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 64, 64)
      glow.refresh()
    }

    if (!this.textures.exists('lava-glow')) {
      const glow = this.textures.createCanvas('lava-glow', 48, 48)
      const ctx = glow.getContext()
      const gradient = ctx.createRadialGradient(24, 24, 2, 24, 24, 24)
      gradient.addColorStop(0, 'rgba(255, 90, 30, 0.8)')
      gradient.addColorStop(1, 'rgba(200, 30, 10, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 48, 48)
      glow.refresh()
    }

    this.scene.start('DragonLair')
  }
}
