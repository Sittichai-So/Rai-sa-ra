import Vue from 'vue'
import { describeItem, itemById } from '../data/items'
import { emit, EV } from './worldEvents'

const SAVE_VERSION = 1
const SAVE_PREFIX = 'raisaraRpgSave:'
const MAX_LEVEL = 10
const EXP_PER_LEVEL = 60
const LOG_LIMIT = 80

const freshState = () => ({
  version: SAVE_VERSION,
  level: 1,
  exp: 0,
  gold: 40,
  hp: 0,
  maxHp: 0,
  inventory: [],
  equipment: { weapon: null, armor: null },
  quests: {},
  worldFlags: {},
  npcStates: {},
  storyProgress: 'prologue',
  currentMap: 'village',
  log: []
})

export const state = Vue.observable(freshState())

let storageKey = null
let saveTimer = null
let unloadBound = false

export function levelFromExp (exp) {
  return Math.min(MAX_LEVEL, 1 + Math.floor(exp / EXP_PER_LEVEL))
}

export function expIntoLevel (exp) {
  const level = levelFromExp(exp)
  if (level >= MAX_LEVEL) { return { current: 1, needed: 1 } }
  return { current: exp - (level - 1) * EXP_PER_LEVEL, needed: EXP_PER_LEVEL }
}

function writeSave () {
  if (!storageKey) { return }
  try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch (e) {}
}

export function save () {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(writeSave, 250)
}

export function flushSave () {
  clearTimeout(saveTimer)
  writeSave()
}

export function initState (userId) {
  storageKey = SAVE_PREFIX + (userId || 'guest')
  if (!unloadBound && typeof window !== 'undefined') {
    unloadBound = true
    window.addEventListener('pagehide', flushSave)
    window.addEventListener('beforeunload', flushSave)
  }
  let loaded = null
  try { loaded = JSON.parse(localStorage.getItem(storageKey)) } catch (e) {}
  const base = freshState()
  const merged = loaded && loaded.version === SAVE_VERSION ? { ...base, ...loaded, equipment: { ...base.equipment, ...(loaded.equipment || {}) } } : base
  Object.keys(base).forEach((key) => { state[key] = merged[key] })
  state.level = levelFromExp(state.exp)
  return state
}

export function resetState () {
  const base = freshState()
  Object.keys(base).forEach((key) => { state[key] = base[key] })
  flushSave()
}

export function getFlag (name) {
  return !!state.worldFlags[name]
}

export function setFlag (name, value = true) {
  Vue.set(state.worldFlags, name, value)
  save()
}

export function npcState (id) {
  if (!state.npcStates[id]) { Vue.set(state.npcStates, id, { met: false, talks: 0 }) }
  return state.npcStates[id]
}

export function patchNpc (id, patch) {
  const current = npcState(id)
  Object.keys(patch).forEach(key => Vue.set(current, key, patch[key]))
  save()
}

export function setHp (hp, maxHp) {
  state.hp = hp
  state.maxHp = maxHp
  save()
}

export function setMap (map) {
  state.currentMap = map
  save()
}

export function setStory (chapter) {
  state.storyProgress = chapter
  save()
}

export function addGold (amount) {
  state.gold = Math.max(0, state.gold + amount)
  save()
}

export function spendGold (amount) {
  if (state.gold < amount) { return false }
  state.gold -= amount
  save()
  return true
}

export function addExp (amount) {
  if (!amount) { return }
  const before = state.level
  state.exp += amount
  state.level = levelFromExp(state.exp)
  save()
  if (state.level > before) { emit(EV.LEVEL_UP, { level: state.level }) }
}

export function countItem (id) {
  const entry = state.inventory.find(i => i.id === id)
  return entry ? entry.qty : 0
}

export function addItem (idOrName, qty = 1) {
  const item = describeItem(idOrName)
  const entry = state.inventory.find(i => i.id === item.id)
  if (entry) {
    entry.qty += qty
  } else {
    state.inventory.push({ id: item.id, name: item.name, type: item.type, qty })
  }
  save()
  emit(EV.ITEM_GAINED, { id: item.id, name: item.name, qty })
  return item
}

export function removeItem (id, qty = 1) {
  const index = state.inventory.findIndex(i => i.id === id)
  if (index < 0 || state.inventory[index].qty < qty) { return false }
  state.inventory[index].qty -= qty
  if (state.inventory[index].qty <= 0) { state.inventory.splice(index, 1) }
  save()
  return true
}

export function gearBonus () {
  const weapon = state.equipment.weapon ? itemById(state.equipment.weapon) : null
  const armor = state.equipment.armor ? itemById(state.equipment.armor) : null
  return { atk: weapon ? weapon.atk || 0 : 0, ac: armor ? armor.ac || 0 : 0 }
}

export function equip (id) {
  const item = itemById(id)
  if (!item || !item.slot || countItem(id) < 1) { return false }
  state.equipment[item.slot] = id
  save()
  return true
}

export function unequip (slot) {
  if (!state.equipment[slot]) { return false }
  state.equipment[slot] = null
  save()
  return true
}

export function appendLog (entry) {
  const last = state.log[state.log.length - 1]
  if (last && last.text === entry.text && last.speaker === entry.speaker) { return }
  state.log.push({ id: Date.now() + Math.random(), at: Date.now(), ...entry })
  if (state.log.length > LOG_LIMIT) { state.log.splice(0, state.log.length - LOG_LIMIT) }
  save()
}
