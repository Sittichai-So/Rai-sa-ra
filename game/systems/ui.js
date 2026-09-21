import Vue from 'vue'
import { appendLog } from './gameState'

export const ui = Vue.observable({
  dialogue: null,
  banner: null,
  dice: null,
  combat: null,
  loot: null,
  panel: null,
  panelTab: 'quests',
  shopMode: 'buy',
  prompt: null,
  toasts: [],
  debug: false,
  zone: 'village',
  dialogueAt: 0,
  lastRoll: null,
  victory: null,
  random: null,
  encounters: []
})

const queue = []
let bannerTimer = null
let toastId = 0

export function isBlocking () {
  return !!(ui.dialogue || ui.dice || ui.combat || ui.loot || ui.panel)
}

function logPages (pages, zone) {
  pages.forEach((page) => {
    if (!page.text || page.silent) { return }
    appendLog({ speaker: page.mode === 'dm' ? 'DM' : (page.speaker || 'NPC'), mode: page.mode, text: page.text, zone: zone || ui.zone })
  })
}

export function openDialogue (spec) {
  if (ui.dialogue || ui.combat || ui.dice || ui.loot) {
    queue.push(spec)
    return false
  }
  const pages = spec.pages.filter(p => p && p.text)
  if (!pages.length && !(spec.choices && spec.choices.length)) { return false }
  logPages(pages, spec.zone)
  ui.dialogue = { ...spec, pages, index: 0, choices: spec.choices || [] }
  ui.dialogueAt = Date.now()
  return true
}

export function setLoot (loot) {
  ui.loot = { ...loot, createdAt: Date.now() }
}

export function closeDialogue () {
  const current = ui.dialogue
  ui.dialogue = null
  if (current && current.onClose) { current.onClose() }
  flushQueue()
}

export function advanceDialogue () {
  const d = ui.dialogue
  if (!d) { return }
  if (d.index < d.pages.length - 1) {
    d.index += 1
    return
  }
  if (!d.choices.length) { closeDialogue() }
}

export function chooseDialogue (index) {
  const d = ui.dialogue
  if (!d || d.index < d.pages.length - 1) { return }
  const choice = d.choices[index]
  if (!choice) { return }
  ui.dialogue = null
  if (choice.onSelect) { choice.onSelect() } else if (d.onClose) { d.onClose() }
  if (!ui.dialogue && !ui.dice && !ui.combat && !ui.loot && !ui.panel) { flushQueue() }
}

export function flushQueue () {
  if (ui.dialogue || ui.combat || ui.dice || ui.loot || !queue.length) { return }
  const next = queue.shift()
  openDialogue(next)
}

export function clearQueue () {
  queue.length = 0
}

export function showBanner (text, kind = 'dm', duration = 5200) {
  if (!text) { return }
  ui.banner = { id: Date.now() + Math.random(), text, kind }
  appendLog({ speaker: kind === 'dm' ? 'DM' : 'ระบบ', mode: kind, text, zone: ui.zone })
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => { ui.banner = null }, duration)
}

export function pushToast (text, tone = 'info') {
  toastId += 1
  const id = toastId
  ui.toasts.push({ id, text, tone })
  setTimeout(() => {
    const index = ui.toasts.findIndex(t => t.id === id)
    if (index >= 0) { ui.toasts.splice(index, 1) }
  }, 3600)
}

export function openPanel (name, tab) {
  ui.panel = name
  if (tab) { ui.panelTab = tab }
}

export function closePanel () {
  ui.panel = null
  flushQueue()
}

export function resetUi () {
  ui.dialogue = null
  ui.banner = null
  ui.dice = null
  ui.combat = null
  ui.loot = null
  ui.panel = null
  ui.prompt = null
  ui.toasts = []
  ui.victory = null
  queue.length = 0
  clearTimeout(bannerTimer)
}
