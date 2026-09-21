export const EV = {
  ENTER_AREA: 'PLAYER_ENTER_AREA',
  ENTER_GAME: 'PLAYER_ENTER_GAME',
  ENTER_DUNGEON: 'PLAYER_ENTER_DUNGEON',
  INTERACT_NPC: 'PLAYER_INTERACT_NPC',
  FIND_TREASURE: 'PLAYER_FIND_TREASURE',
  TRIGGER_TRAP: 'PLAYER_TRIGGER_TRAP',
  ENCOUNTER_ENEMY: 'PLAYER_ENCOUNTER_ENEMY',
  COMPLETE_OBJECTIVE: 'PLAYER_COMPLETE_OBJECTIVE',
  RETURN_TO_VILLAGE: 'PLAYER_RETURN_TO_VILLAGE',
  EVENT_RESOLVED: 'PLAYER_EVENT_RESOLVED',
  ENEMY_DEFEATED: 'PLAYER_ENEMY_DEFEATED',
  REST: 'PLAYER_REST',
  LEVEL_UP: 'PLAYER_LEVEL_UP',
  ITEM_GAINED: 'PLAYER_ITEM_GAINED',
  QUEST_ACCEPTED: 'QUEST_ACCEPTED',
  QUEST_COMPLETED: 'QUEST_COMPLETED',
  QUEST_FAILED: 'QUEST_FAILED',
  DISCOVER: 'PLAYER_DISCOVER',
  INTERACT_ENCOUNTER: 'PLAYER_INTERACT_ENCOUNTER'
}

const RECENT_LIMIT = 14
const listeners = new Map()
export const recentEvents = []

export function on (type, fn) {
  if (!listeners.has(type)) { listeners.set(type, new Set()) }
  listeners.get(type).add(fn)
  return () => listeners.get(type).delete(fn)
}

export function emit (type, payload = {}) {
  recentEvents.unshift({ type, payload, at: Date.now() })
  if (recentEvents.length > RECENT_LIMIT) { recentEvents.pop() }
  const set = listeners.get(type)
  if (set) { [...set].forEach(fn => fn(payload)) }
  const any = listeners.get('*')
  if (any) { [...any].forEach(fn => fn({ type, payload })) }
}

export function reset () {
  listeners.clear()
  recentEvents.length = 0
}
