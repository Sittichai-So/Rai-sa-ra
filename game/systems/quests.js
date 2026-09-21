import Vue from 'vue'
import { QUESTS } from '../data/quests'
import { state, setFlag, getFlag, addGold, addExp, addItem, setStory, save } from './gameState'
import { emit, on, EV } from './worldEvents'

export const QuestStatus = {
  NOT_STARTED: 'QUEST_NOT_STARTED',
  ACCEPTED: 'QUEST_ACCEPTED',
  IN_PROGRESS: 'QUEST_IN_PROGRESS',
  COMPLETED: 'QUEST_COMPLETED',
  FAILED: 'QUEST_FAILED'
}

const ACTIVE = [QuestStatus.ACCEPTED, QuestStatus.IN_PROGRESS]

export function questDef (id) {
  return QUESTS[id] || null
}

export function statusOf (id) {
  return state.quests[id] ? state.quests[id].status : QuestStatus.NOT_STARTED
}

export function isActive (id) {
  return ACTIVE.includes(statusOf(id))
}

export function objectiveDone (questId, objectiveId) {
  const q = state.quests[questId]
  return !!(q && q.objectives[objectiveId])
}

export function isReady (questId) {
  const def = questDef(questId)
  if (!def || !isActive(questId)) { return false }
  return def.objectives.filter(o => !o.final).every(o => objectiveDone(questId, o.id))
}

export function nextObjective (questId) {
  const def = questDef(questId)
  if (!def) { return null }
  return def.objectives.find(o => !objectiveDone(questId, o.id)) || null
}

export function isAvailable (questId) {
  const def = questDef(questId)
  if (!def || statusOf(questId) !== QuestStatus.NOT_STARTED) { return false }
  if (def.requires && statusOf(def.requires.quest) !== def.requires.status) { return false }
  return true
}

export function questView (questId) {
  const def = questDef(questId)
  if (!def) { return null }
  return {
    ...def,
    status: statusOf(questId),
    ready: isReady(questId),
    objectives: def.objectives.map(o => ({ ...o, done: objectiveDone(questId, o.id) }))
  }
}

export function activeQuests () {
  return Object.keys(QUESTS).filter(id => isActive(id)).map(questView)
}

export function finishedQuests () {
  return Object.keys(QUESTS).filter(id => [QuestStatus.COMPLETED, QuestStatus.FAILED].includes(statusOf(id))).map(questView)
}

export function trackedQuest () {
  const list = activeQuests()
  const forest = list.find(q => q.giver !== 'board')
  return forest || list[0] || null
}

function ensureRecord (id) {
  if (!state.quests[id]) {
    Vue.set(state.quests, id, { status: QuestStatus.NOT_STARTED, objectives: {}, acceptedAt: null, completedAt: null })
  }
  return state.quests[id]
}

export function completeObjective (questId, objectiveId) {
  const def = questDef(questId)
  if (!def || !isActive(questId) || objectiveDone(questId, objectiveId)) { return false }
  const record = ensureRecord(questId)
  Vue.set(record.objectives, objectiveId, true)
  record.status = QuestStatus.IN_PROGRESS
  save()
  emit(EV.COMPLETE_OBJECTIVE, { questId, objectiveId, ready: isReady(questId) })
  return true
}

function matches (on, evt) {
  if (!on || on.type !== evt.type) { return false }
  return Object.keys(on).every(key => key === 'type' || (evt.payload || {})[key] === on[key])
}

function satisfiedNow (objective) {
  return !!(objective.satisfiedBy && objective.satisfiedBy.flag && getFlag(objective.satisfiedBy.flag))
}

export function startQuest (questId) {
  if (!isAvailable(questId)) { return false }
  const def = questDef(questId)
  const record = ensureRecord(questId)
  record.status = QuestStatus.ACCEPTED
  record.acceptedAt = Date.now()
  record.objectives = {}
  ;(def.onAcceptFlags || []).forEach(flag => setFlag(flag))
  save()
  emit(EV.QUEST_ACCEPTED, { questId })
  def.objectives.forEach((o) => { if (satisfiedNow(o)) { completeObjective(questId, o.id) } })
  return true
}

export function failQuest (questId) {
  if (!isActive(questId)) { return false }
  ensureRecord(questId).status = QuestStatus.FAILED
  save()
  emit(EV.QUEST_FAILED, { questId })
  return true
}

export function completeQuest (questId) {
  const def = questDef(questId)
  if (!def || !isReady(questId)) { return null }
  const record = ensureRecord(questId)
  const final = def.objectives.find(o => o.final)
  if (final) { Vue.set(record.objectives, final.id, true) }
  record.status = QuestStatus.COMPLETED
  record.completedAt = Date.now()
  const rewards = def.rewards || {}
  if (rewards.gold) { addGold(rewards.gold) }
  if (rewards.exp) { addExp(rewards.exp) }
  ;(rewards.items || []).forEach(item => addItem(item.id, item.qty || 1))
  ;(rewards.flags || []).forEach(flag => setFlag(flag))
  if (rewards.story) { setStory(rewards.story) }
  save()
  emit(EV.QUEST_COMPLETED, { questId, rewards })
  return rewards
}

function handleEvent (type) {
  return (payload) => {
    const evt = { type, payload }
    Object.keys(QUESTS).forEach((questId) => {
      if (!isActive(questId)) { return }
      const def = questDef(questId)
      if (def.failOn && matches(def.failOn, evt)) {
        failQuest(questId)
        return
      }
      def.objectives.forEach((o) => {
        if (o.on && matches(o.on, evt)) { completeObjective(questId, o.id) }
      })
    })
  }
}

let bound = []

export function bindQuestEvents () {
  unbindQuestEvents()
  const types = new Set()
  Object.values(QUESTS).forEach((q) => {
    if (q.failOn) { types.add(q.failOn.type) }
    q.objectives.forEach((o) => { if (o.on) { types.add(o.on.type) } })
  })
  bound = [...types].map(type => on(type, handleEvent(type)))
}

export function unbindQuestEvents () {
  bound.forEach(off => off())
  bound = []
}
