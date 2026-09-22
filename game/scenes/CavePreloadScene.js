// eslint-disable-next-line import/default
import Phaser from 'phaser'
import { preloadCommon, createCommon } from '../systems/assets'
import dungeonTileset from '~/assets/images/rpg-world/dungeon/dungeon-tileset-openrtp.png'
import skullSprite from '~/assets/images/rpg-world/dungeon/skull.png'
import ladderSprite from '~/assets/images/rpg-world/dungeon/floor_ladder.png'
import torchSprite from '~/assets/images/rpg-world/village-openrtp/torch.png'

export default class CavePreloadScene extends Phaser.Scene {
  constructor () {
    super('CavePreload')
  }

  preload () {
    this.load.image('dungeon-tileset', dungeonTileset)
    this.load.image('skull', skullSprite)
    this.load.image('floor_ladder', ladderSprite)
    this.load.image('torch', torchSprite)
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

    this.scene.start('Cave')
  }
}
