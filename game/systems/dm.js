import { DM_SCRIPTS } from '../data/dm'
import { check } from './conditions'
import { getFlag, setFlag } from './gameState'
import { startQuest, trackedQuest, nextObjective } from './quests'
import { on } from './worldEvents'
import { openDialogue, showBanner, pushToast, ui } from './ui'

const hooks = { serverInteract: null, travel: null }
let unbind = null
let timers = []

export function setDmHooks (next) {
  Object.assign(hooks, next)
}

function matches (script, evt) {
  const spec = script.on
  if (!spec || spec.type !== evt.type) { return false }
  return Object.keys(spec).every(key => key === 'type' || (evt.payload || {})[key] === spec[key])
}

function runActions (actions) {
  ;(actions || []).forEach((action) => {
    if (action.setFlag) { setFlag(action.setFlag) }
    if (action.narrate) { showBanner(action.narrate, 'dm') }
    if (action.startQuest && startQuest(action.startQuest)) { pushToast('รับภารกิจใหม่', 'quest') }
    if (action.serverInteract && hooks.serverInteract) { hooks.serverInteract(action.serverInteract) }
    if (action.travel && hooks.travel) { hooks.travel(action.travel) }
    if (action.toast) { pushToast(action.toast) }
  })
}

export function narrateScene (pages, choices = [], onClose) {
  return openDialogue({
    pages: pages.map(text => ({ mode: 'dm', speaker: 'DM', text })),
    choices: choices.map(c => ({ label: c.label, onSelect: () => { runActions(c.do); if (onClose) { onClose() } } })),
    onClose
  })
}

function recapText () {
  const quest = trackedQuest()
  if (!quest) { return null }
  const objective = nextObjective(quest.id)
  return 'ภารกิจตอนนี้: ' + quest.title + ' — ' + (objective ? objective.text : 'พร้อมรายงานผลภารกิจแล้ว')
}

function play (script) {
  if (script.once) { setFlag('dm:' + script.id) }
  if (script.mode === 'banner') {
    showBanner(script.text, 'dm')
    return
  }
  const pages = script.pages.map(p => p.text)
  if (script.recap) {
    const recap = recapText()
    if (recap) { pages.push(recap) }
  }
  narrateScene(pages, script.choices || [])
}

function dispatch (evt) {
  DM_SCRIPTS.forEach((script) => {
    if (!matches(script, evt)) { return }
    if (script.once && getFlag('dm:' + script.id)) { return }
    if (!check(script.if, { zone: ui.zone })) { return }
    if (script.delay) {
      timers.push(setTimeout(() => {
        if (check(script.if, { zone: ui.zone })) { play(script) }
      }, script.delay))
    } else {
      play(script)
    }
  })
}

export function hasScriptFor (evt) {
  return DM_SCRIPTS.some(s => matches(s, evt) && check(s.if, { zone: ui.zone }))
}

export function bindDm () {
  unbindDm()
  const offAll = on('*', dispatch)
  unbind = offAll
}

export function unbindDm () {
  if (unbind) { unbind() }
  unbind = null
  timers.forEach(clearTimeout)
  timers = []
}
