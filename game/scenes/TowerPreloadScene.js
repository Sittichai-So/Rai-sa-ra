// eslint-disable-next-line import/default
import Phaser from 'phaser'
import { preloadCommon, createCommon } from '../systems/assets'
import dungeonTileset from '~/assets/images/rpg-world/dungeon/dungeon-tileset-openrtp.png'
import skullSprite from '~/assets/images/rpg-world/dungeon/skull.png'
import ladderSprite from '~/assets/images/rpg-world/dungeon/floor_ladder.png'
import bannerSprite from '~/assets/images/rpg-world/dungeon/wall_banner_red.png'
import torchSprite from '~/assets/images/rpg-world/village-openrtp/torch.png'
import crateSprite from '~/assets/images/rpg-world/props/crate.png'

export default class TowerPreloadScene extends Phaser.Scene {
  constructor () {
    super('TowerPreload')
  }

  preload () {
    this.load.image('dungeon-tileset', dungeonTileset)
    this.load.image('skull', skullSprite)
    this.load.image('floor_ladder', ladderSprite)
    this.load.image('banner', bannerSprite)
    this.load.image('torch', torchSprite)
    this.load.image('crate', crateSprite)
    preloadCommon(this)
  }

  create () {
    createCommon(this, 0.4)

    if (!this.textures.exists('torch-glow')) {
      const glow = this.textures.createCanvas('torch-glow', 64, 64)
      const ctx = glow.getContext()
      const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32)
      gradient.addColorStop(0, 'rgba(190, 120, 255, 0.85)')
      gradient.addColorStop(1, 'rgba(120, 40, 200, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 64, 64)
      glow.refresh()
    }

    if (!this.textures.exists('soul-particle')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(0xFFFFFF, 1)
      g.fillCircle(2, 2, 2)
      g.generateTexture('soul-particle', 4, 4)
      g.destroy()
    }

    this.scene.start('Tower')
  }
}
