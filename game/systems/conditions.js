import { state, getFlag, npcState, countItem } from './gameState'
import { statusOf, isReady, isActive, isAvailable } from './quests'

function compare (value, spec) {
  if (typeof spec !== 'object') { return value === spec }
  if (spec.gte !== undefined && !(value >= spec.gte)) { return false }
  if (spec.lte !== undefined && !(value <= spec.lte)) { return false }
  if (spec.equals !== undefined && value !== spec.equals) { return false }
  return true
}

export function check (cond, ctx = {}) {
  if (!cond) { return true }
  if (typeof cond === 'function') { return !!cond(ctx) }
  if (cond.all) { return cond.all.every(c => check(c, ctx)) }
  if (cond.any) { return cond.any.some(c => check(c, ctx)) }
  if (cond.not) { return !check(cond.not, ctx) }
  if (cond.flag !== undefined && !getFlag(cond.flag)) { return false }
  if (cond.notFlag !== undefined && getFlag(cond.notFlag)) { return false }
  if (cond.quest !== undefined) {
    if (cond.status !== undefined) {
      const wanted = Array.isArray(cond.status) ? cond.status : [cond.status]
      if (!wanted.includes(statusOf(cond.quest))) { return false }
    }
    if (cond.ready !== undefined && isReady(cond.quest) !== cond.ready) { return false }
    if (cond.active !== undefined && isActive(cond.quest) !== cond.active) { return false }
    if (cond.available !== undefined && isAvailable(cond.quest) !== cond.available) { return false }
  }
  if (cond.npc !== undefined) {
    const npc = npcState(cond.npc)
    if (cond.key !== undefined && !compare(npc[cond.key], cond.equals !== undefined ? cond.equals : true)) { return false }
  }
  if (cond.level !== undefined && !compare(state.level, cond.level)) { return false }
  if (cond.gold !== undefined && !compare(state.gold, cond.gold)) { return false }
  if (cond.zone !== undefined && ctx.zone !== cond.zone) { return false }
  if (cond.story !== undefined) {
    const wanted = Array.isArray(cond.story) ? cond.story : [cond.story]
    if (!wanted.includes(state.storyProgress)) { return false }
  }
  if (cond.item !== undefined && countItem(cond.item) < (cond.qty || 1)) { return false }
  return true
}
