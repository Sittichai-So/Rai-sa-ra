import { NPCS, NPC_LINES } from '../data/npcs'
import { itemById } from '../data/items'
import { check } from './conditions'
import { npcState, patchNpc, setFlag, addItem } from './gameState'
import { startQuest, completeQuest, nextObjective, questDef } from './quests'
import { openDialogue, openPanel, pushToast, showBanner, setLoot, ui } from './ui'
import { emit, EV } from './worldEvents'

const hooks = { innRest: null, travel: null }

export function setDialogueHooks (next) {
  Object.assign(hooks, next)
}

function contextFor () {
  return {
    hint (questId) {
      const objective = nextObjective(questId)
      return objective ? objective.hint : 'ตอนนี้ไม่มีอะไรต้องทำเพิ่มเติมแล้ว'
    },
    pick (key) {
      const lines = NPC_LINES[key] || []
      const hit = lines.find(line => check(line.when))
      return hit ? hit.text : '...'
    }
  }
}

function rewardSummary (questId, rewards) {
  const def = questDef(questId)
  return {
    title: 'ภารกิจสำเร็จ: ' + def.title,
    text: 'คุณได้รับรางวัลตามที่ตกลงกันไว้',
    gold: rewards.gold || 0,
    exp: rewards.exp || 0,
    items: (rewards.items || []).map((i) => {
      const item = itemById(i.id)
      return { id: i.id, name: item ? item.name : i.id, qty: i.qty || 1 }
    }),
    applied: true,
    questId
  }
}

function runActions (actions, npc, session) {
  ;(actions || []).forEach((action) => {
    if (action.startQuest) {
      if (startQuest(action.startQuest)) { pushToast('รับภารกิจ: ' + questDef(action.startQuest).title, 'quest') }
    }
    if (action.completeQuest) {
      const rewards = completeQuest(action.completeQuest)
      if (rewards) { session.reward = rewardSummary(action.completeQuest, rewards) }
    }
    if (action.setFlag) { setFlag(action.setFlag) }
    if (action.npc) { patchNpc(npc.id, action.npc) }
    if (action.giveItem) { addItem(action.giveItem.id, action.giveItem.qty || 1) }
    if (action.narrate) { showBanner(action.narrate, 'dm') }
    if (action.openShop) { session.panel = 'shop' }
    if (action.openBoard) { session.panel = 'board' }
    if (action.innRest !== undefined && hooks.innRest) { session.after = () => hooks.innRest(action.innRest) }
    if (action.travel && hooks.travel) { session.after = () => hooks.travel(action.travel) }
  })
}

function finish (session) {
  if (session.done) { return }
  session.done = true
  if (session.reward) { setLoot(session.reward) }
  if (session.panel) { openPanel(session.panel, session.panel === 'shop' ? 'buy' : undefined) }
  if (session.after) { session.after() }
}

function openNode (npc, nodeId, session) {
  const node = npc.nodes[nodeId]
  if (!node) { finish(session); return }
  const ctx = contextFor()
  const rawPages = typeof node.pages === 'function' ? node.pages(ctx) : node.pages
  const pages = rawPages.map(p => ({
    mode: p.mode || 'npc',
    speaker: p.mode === 'dm' ? 'DM' : npc.name,
    portrait: npc.sprite,
    text: p.text
  }))
  const choices = (node.choices || []).filter(c => check(c.when)).map(c => ({
    label: c.label,
    onSelect: () => {
      runActions(c.do, npc, session)
      if (c.next) { openNode(npc, c.next, session) } else { finish(session) }
    }
  }))
  openDialogue({ pages, choices, npcId: npc.id, onClose: () => finish(session) })
}

export function talkToNpc (npcId) {
  const npc = NPCS[npcId]
  if (!npc) { return false }
  const current = npcState(npcId)
  patchNpc(npcId, { talks: (current.talks || 0) + 1 })
  emit(EV.INTERACT_NPC, { npcId })
  const rule = npc.rules.find(r => check(r.when, { zone: ui.zone }))
  openNode(npc, rule.start, { done: false, reward: null, panel: null, after: null })
  return true
}
