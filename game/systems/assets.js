import { preloadCharacters, createCharacterAnims } from './characters'
import chestClosed from '~/assets/images/rpg-world/props/chest_closed.png'
import chestOpen from '~/assets/images/rpg-world/props/chest_open.png'
import spikesSheet from '~/assets/images/rpg-world/props/spikes.png'
import footprints from '~/assets/images/rpg-world/props/footprints.png'
import campfire from '~/assets/images/rpg-world/village-openrtp/campfire.png'
import treeDead from '~/assets/images/rpg-world/village-openrtp/tree_dead.png'

const IMAGES = {
  chest_closed: chestClosed,
  chest_open: chestOpen,
  footprints,
  campfire,
  tree_dead: treeDead
}

export function preloadCommon (scene) {
  Object.entries(IMAGES).forEach(([key, src]) => scene.load.image(key, src))
  preloadCharacters(scene)
  scene.load.spritesheet('spikes', spikesSheet, { frameWidth: 16, frameHeight: 16 })
}

export function createCommon (scene, shadowAlpha = 0.35) {
  const shadow = scene.make.graphics({ x: 0, y: 0, add: false })
  shadow.fillStyle(0x000000, shadowAlpha)
  shadow.fillEllipse(8, 6, 14, 6)
  shadow.generateTexture('marker-shadow', 16, 12)
  shadow.destroy()

  createCharacterAnims(scene)
  scene.anims.create({ key: 'spikes-fire', frames: scene.anims.generateFrameNumbers('spikes', { start: 0, end: 3 }), frameRate: 12, repeat: 0 })
}
