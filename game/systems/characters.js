import warrior from '~/assets/images/rpg-world/ninja/sprites/warrior.png'
import rogue from '~/assets/images/rpg-world/ninja/sprites/rogue.png'
import mage from '~/assets/images/rpg-world/ninja/sprites/mage.png'
import cleric from '~/assets/images/rpg-world/ninja/sprites/cleric.png'
import npcElder from '~/assets/images/rpg-world/ninja/sprites/npc_elder.png'
import npcInnkeeper from '~/assets/images/rpg-world/ninja/sprites/npc_innkeeper.png'
import npcMerchant from '~/assets/images/rpg-world/ninja/sprites/npc_merchant.png'
import npcHealer from '~/assets/images/rpg-world/ninja/sprites/npc_healer.png'
import npcVillager from '~/assets/images/rpg-world/ninja/sprites/npc_villager.png'
import creatureWolf from '~/assets/images/rpg-world/ninja/sprites/creature_wolf.png'
import creaturePup from '~/assets/images/rpg-world/ninja/sprites/creature_pup.png'
import creatureGoblin from '~/assets/images/rpg-world/ninja/sprites/creature_goblin.png'
import creatureSkeleton from '~/assets/images/rpg-world/ninja/sprites/creature_skeleton.png'
import creatureTroll from '~/assets/images/rpg-world/ninja/sprites/creature_troll.png'

export const DIRECTIONS = ['down', 'up', 'left', 'right']

const WALKER = { frameWidth: 16, frameHeight: 16 }

const SPRITES = {
  warrior: { src: warrior, ...WALKER },
  rogue: { src: rogue, ...WALKER },
  mage: { src: mage, ...WALKER },
  cleric: { src: cleric, ...WALKER },
  npc_elder: { src: npcElder, ...WALKER },
  npc_innkeeper: { src: npcInnkeeper, ...WALKER },
  npc_merchant: { src: npcMerchant, ...WALKER },
  npc_healer: { src: npcHealer, ...WALKER },
  npc_villager: { src: npcVillager, ...WALKER },
  creature_goblin: { src: creatureGoblin, ...WALKER },
  creature_skeleton: { src: creatureSkeleton, ...WALKER },
  creature_troll: { src: creatureTroll, ...WALKER },
  creature_wolf: { src: creatureWolf, frameWidth: 18, frameHeight: 17, strip: true },
  creature_pup: { src: creaturePup, frameWidth: 21, frameHeight: 17, strip: true }
}

export function preloadCharacters (scene) {
  Object.entries(SPRITES).forEach(([key, def]) => {
    scene.load.spritesheet(key, def.src, { frameWidth: def.frameWidth, frameHeight: def.frameHeight })
  })
}

export function createCharacterAnims (scene) {
  Object.entries(SPRITES).forEach(([key, def]) => {
    const frames = scene.textures.get(key).frameTotal - 1
    if (def.strip) {
      scene.anims.create({ key: key + '-idle', frames: [{ key, frame: 0 }], frameRate: 1 })
      scene.anims.create({ key: key + '-run', frames: scene.anims.generateFrameNumbers(key, { start: 0, end: frames - 1 }), frameRate: 4, repeat: -1 })
      return
    }
    const rows = Math.min(4, Math.floor(frames / DIRECTIONS.length))
    DIRECTIONS.forEach((dir, col) => {
      scene.anims.create({ key: key + '-idle-' + dir, frames: [{ key, frame: col }], frameRate: 1 })
      const walk = []
      for (let row = 0; row < rows; row++) { walk.push({ key, frame: row * DIRECTIONS.length + col }) }
      scene.anims.create({ key: key + '-run-' + dir, frames: walk, frameRate: 9, repeat: -1 })
    })
  })
}

export function directionFor (dx, dy, current = 'down') {
  if (dx === 0 && dy === 0) { return current }
  if (Math.abs(dx) >= Math.abs(dy)) { return dx < 0 ? 'left' : 'right' }
  return dy < 0 ? 'up' : 'down'
}
