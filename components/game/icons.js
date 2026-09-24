import npcElder from '~/assets/images/rpg-world/ninja/portraits/npc_elder.png'
import npcInnkeeper from '~/assets/images/rpg-world/ninja/portraits/npc_innkeeper.png'
import npcMerchant from '~/assets/images/rpg-world/ninja/portraits/npc_merchant.png'
import npcHealer from '~/assets/images/rpg-world/ninja/portraits/npc_healer.png'
import npcVillager from '~/assets/images/rpg-world/ninja/portraits/npc_villager.png'
import classWarrior from '~/assets/images/rpg-world/ninja/portraits/class_warrior.png'
import classRogue from '~/assets/images/rpg-world/ninja/portraits/class_rogue.png'
import classMage from '~/assets/images/rpg-world/ninja/portraits/class_mage.png'
import classCleric from '~/assets/images/rpg-world/ninja/portraits/class_cleric.png'
import enemyGoblinScout from '~/assets/images/rpg-world/ninja/portraits/enemy_goblin_scout.png'
import enemyForestBandit from '~/assets/images/rpg-world/ninja/portraits/enemy_forest_bandit.png'
import enemyShadowWolf from '~/assets/images/rpg-world/ninja/portraits/enemy_shadow_wolf.png'
import enemyFeralWolf from '~/assets/images/rpg-world/ninja/portraits/enemy_feral_wolf.png'
import enemyCaveImp from '~/assets/images/rpg-world/ninja/portraits/enemy_cave_imp.png'
import enemyOrcRaider from '~/assets/images/rpg-world/ninja/portraits/enemy_orc_raider.png'
import enemySkeletonGuard from '~/assets/images/rpg-world/ninja/portraits/enemy_skeleton_guard.png'
import enemyDragonAncient from '~/assets/images/rpg-world/dungeon/dragon_ancient.png'
import potionLife from '~/assets/images/rpg-world/ninja/items/potion_life.png'
import potionWater from '~/assets/images/rpg-world/ninja/items/potion_water.png'
import medipack from '~/assets/images/rpg-world/ninja/items/medipack.png'
import dice20 from '~/assets/images/rpg-world/ninja/items/dice20.png'
import skull from '~/assets/images/rpg-world/props/skull.png'
import itemSword from '~/assets/images/rpg-world/props/item_sword.png'
import itemArmor from '~/assets/images/rpg-world/props/item_armor.png'
import coin from '~/assets/images/rpg-world/props/coin.png'
import chestClosed from '~/assets/images/rpg-world/props/chest_closed.png'
import goblin from '~/assets/images/rpg-world/enemies/goblin.png'
import maskedOrc from '~/assets/images/rpg-world/enemies/masked_orc.png'
import imp from '~/assets/images/rpg-world/enemies/imp.png'
import orcWarrior from '~/assets/images/rpg-world/enemies/orc_warrior.png'
import skelet from '~/assets/images/rpg-world/enemies/skelet.png'
import wolf from '~/assets/images/rpg-world/wolf.png'

const PORTRAITS = {
  elder: npcElder,
  npc_elder: npcElder,
  innkeeper: npcInnkeeper,
  npc_innkeeper: npcInnkeeper,
  merchant: npcMerchant,
  npc_merchant: npcMerchant,
  healer: npcHealer,
  npc_healer: npcHealer,
  villager: npcVillager,
  npc_villager: npcVillager
}

const CLASS_PORTRAITS = { warrior: classWarrior, rogue: classRogue, mage: classMage, cleric: classCleric }

const ITEM_ICONS = {
  sword: itemSword,
  armor: itemArmor,
  potion_red: potionLife,
  potion_blue: potionWater,
  medipack,
  skull,
  coin,
  chest: chestClosed
}

const ENEMY_PORTRAITS = { goblin, masked_orc: maskedOrc, imp, orc_warrior: orcWarrior, skelet, wolf }

const ENEMY_FACES = {
  goblin_scout: enemyGoblinScout,
  forest_bandit: enemyForestBandit,
  shadow_wolf: enemyShadowWolf,
  feral_wolf: enemyFeralWolf,
  cave_imp: enemyCaveImp,
  orc_raider: enemyOrcRaider,
  skeleton_guard: enemySkeletonGuard,
  dragon_ancient: enemyDragonAncient
}

export function portraitFor (key) {
  return PORTRAITS[key] || null
}

export function classPortrait (classId) {
  return CLASS_PORTRAITS[classId] || null
}

export function itemIcon (key) {
  return ITEM_ICONS[key] || skull
}

export function enemyPortrait (key, enemyId) {
  return ENEMY_FACES[enemyId] || ENEMY_PORTRAITS[key] || PORTRAITS[key] || skull
}

export const COIN_ICON = coin
export const DICE_ICON = dice20
