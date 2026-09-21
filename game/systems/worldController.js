import Vue from 'vue'
import { describeItem, itemById } from '../data/items'
import {
  state,
  initState,
  flushSave,
  setFlag,
  setHp,
  setMap,
  addGold,
  spendGold,
  addExp,
  addItem,
  removeItem,
  countItem,
  equip,
  unequip,
  gearBonus
} from './gameState'
import * as questApi from './quests'
import { bindQuestEvents, unbindQuestEvents, questDef } from './quests'
import { bindDm, unbindDm, setDmHooks, hasScriptFor, narrateScene } from './dm'
import { talkToNpc, setDialogueHooks } from './dialogue'
import * as worldEvents from './worldEvents'
import { emit, on, EV, reset as resetEvents } from './worldEvents'
import {
  ui,
  isBlocking,
  openDialogue,
  showBanner,
  pushToast,
  openPanel,
  closePanel,
  setLoot,
  resetUi,
  clearQueue,
  flushQueue
} from './ui'

const ROUTES = { village: '/rpg', forest: '/rpg/forest', valley: '/rpg/valley', dungeon: '/rpg/dungeon', map: '/rpg/map' }
let leftByTravel = false
const MIN_ROLL_MS = 900

const STAT_TEXT = { str: 'พลังโจมตี', agi: 'ความว่องไว', int: 'สติปัญญา' }

function effectLines (payload) {
  const lines = []
  const fx = payload.effects || {}
  if (fx.hpDelta) { lines.push({ text: (fx.hpDelta > 0 ? '+' : '') + fx.hpDelta + ' HP', tone: fx.hpDelta > 0 ? 'good' : 'bad' }) }
  if (fx.healAmount) { lines.push({ text: '+' + fx.healAmount + ' HP', tone: 'good' }) }
  if (fx.statBonus) { lines.push({ text: Object.entries(fx.statBonus).map(([k, v]) => (STAT_TEXT[k] || k) + ' +' + v).join(', '), tone: 'good' }) }
  return lines
}

function rewardLines (rewards) {
  const lines = []
  if (!rewards) { return lines }
  if (rewards.gold) { lines.push({ text: '+' + rewards.gold + ' เหรียญ', tone: 'gold' }) }
  if (rewards.exp) { lines.push({ text: '+' + rewards.exp + ' EXP', tone: 'good' }) }
  ;(rewards.items || []).forEach(name => lines.push({ text: 'ได้รับ ' + name, tone: 'good' }))
  return lines
}

export default class WorldController {
  constructor ({ game, network, zone, routerPush, partyCode }) {
    this.game = game
    this.network = network
    this.zone = zone
    this.routerPush = routerPush
    this.partyCode = partyCode
    this.scene = null
    this.pendingEvent = null
    this.pendingCombatUpdate = null
    this.pendingResolution = null
    this.rollStartedAt = 0
    this.pendingInnCost = 0
    this.vm = new Vue()
    this.offs = []
  }

  start () {
    this.freshEntry = !leftByTravel
    leftByTravel = false
    let user = null
    try { user = JSON.parse(localStorage.getItem('userData')) } catch (e) {}
    initState(user && user._id)
    resetUi()
    resetEvents()
    ui.zone = this.zone
    ui.debug = false
    this.exposeDebugHandle()
    bindQuestEvents()
    bindDm()
    setDmHooks({ serverInteract: id => this.serverInteract(id), travel: to => this.travel(to) })
    setDialogueHooks({ innRest: cost => this.innRest(cost), travel: to => this.travel(to) })

    const ge = this.game.events
    const bind = (event, fn) => {
      ge.on(event, fn)
      this.offs.push(() => ge.off(event, fn))
    }
    bind('sceneReady', scene => this.onSceneReady(scene))
    bind('interactPrompt', (prompt) => { ui.prompt = prompt })
    bind('encounterInteract', payload => this.onEncounterInteract(payload))
    bind('localInteract', payload => this.onLocalInteract(payload))
    bind('discover', payload => this.onDiscover(payload))
    bind('joined', payload => this.onJoined(payload))
    bind('encounter', event => this.onEncounter(event))
    bind('encounterResolved', payload => this.onEventResolved(payload))
    bind('rested', payload => this.onRested(payload))
    bind('hpUpdate', payload => setHp(payload.hp, payload.maxHp))
    bind('defeated', () => this.onDefeated())
    bind('victory', (payload) => { ui.victory = payload })
    bind('debugState', (enabled) => { ui.debug = enabled })

    this.network.listen({
      worldCheckRequest: payload => this.onCheckRequest(payload),
      worldCombatStart: payload => this.onCombatStart(payload),
      worldCombatUpdate: payload => this.onCombatUpdate(payload),
      worldCombatEnd: payload => this.onCombatEnd(payload),
      worldItemUsed: payload => this.onItemUsed(payload),
      worldServiceDone: payload => this.onServiceDone(payload)
    })

    this.offs.push(on(EV.LEVEL_UP, ({ level }) => {
      this.game.events.emit('sfx', 'levelup')
      pushToast('เลื่อนระดับ! ตอนนี้คุณคือเลเวล ' + level, 'level')
    }))
    this.offs.push(on(EV.COMPLETE_OBJECTIVE, payload => this.onObjective(payload)))
    this.offs.push(on(EV.QUEST_COMPLETED, ({ questId }) => {
      this.game.events.emit('sfx', 'success')
      pushToast('ภารกิจสำเร็จ: ' + questDef(questId).title, 'quest')
    }))
    this.offs.push(on(EV.QUEST_FAILED, ({ questId }) => pushToast('ภารกิจล้มเหลว: ' + questDef(questId).title, 'bad')))
  }

  exposeDebugHandle () {
    let enabled = process.env.NODE_ENV !== 'production'
    try { enabled = enabled || localStorage.getItem('rpgDebug') === '1' } catch (e) {}
    if (enabled) { window.__rpg = { state, ui, controller: this, game: this.game, quests: questApi, events: worldEvents } }
  }

  destroy () {
    if (window.__rpg && window.__rpg.controller === this) { delete window.__rpg }
    this.offs.forEach(off => off())
    this.offs = []
    this.vm.$destroy()
    unbindQuestEvents()
    unbindDm()
    clearQueue()
    flushSave()
  }

  onSceneReady (scene) {
    this.scene = scene
    this.vm.$watch(() => isBlocking(), (blocked) => { scene.setLock('ui', blocked) }, { immediate: true })
  }

  onJoined ({ self, encounters, random }) {
    ui.random = random
    ui.encounters = encounters
    if (self) { setHp(self.hp, self.maxHp) }
    const previousMap = state.currentMap
    setFlag('visited:' + this.zone)
    setMap(this.zone)
    this.network.setGear(gearBonus())
    emit(EV.ENTER_AREA, { area: this.zone })
    if (this.zone === 'dungeon') { emit(EV.ENTER_DUNGEON, { area: 'dungeon' }) }
    const fresh = this.freshEntry
    this.freshEntry = false
    if (this.zone === 'village' && previousMap !== 'village') { emit(EV.RETURN_TO_VILLAGE, { from: previousMap, fresh }) }
    if (fresh) { emit(EV.ENTER_GAME, { area: this.zone }) }
  }

  travel (to) {
    const path = ROUTES[to]
    if (!path) { return }
    this.game.events.emit('sfx', 'click')
    flushSave()
    leftByTravel = to !== 'map'
    this.routerPush({ path, query: this.partyCode ? { party: this.partyCode } : {} })
  }

  serverInteract (id) {
    this.network.interact(id)
  }

  onEncounterInteract ({ id, type }) {
    this.game.events.emit('sfx', 'click')
    const evt = { type: EV.INTERACT_ENCOUNTER, payload: { id, encounterType: type } }
    if (hasScriptFor(evt)) {
      emit(evt.type, evt.payload)
      return
    }
    this.serverInteract(id)
  }

  onLocalInteract (payload) {
    this.game.events.emit('sfx', 'click')
    if (payload.kind === 'npc') { talkToNpc(payload.npcId) } else if (payload.kind === 'gate') { emit(EV.INTERACT_ENCOUNTER, { id: 'village_gate' }) } else if (payload.kind === 'board') { openPanel('board') } else if (payload.kind === 'sign') { narrateScene([payload.text]) } else if (payload.kind === 'exit') {
      narrateScene(['คุณหันหลังให้ทางที่มา แล้วมุ่งหน้ากลับไปยังหมู่บ้านลมเย็น'], [{ label: 'กลับหมู่บ้าน', do: [{ travel: payload.to }] }, { label: 'อยู่สำรวจต่อ', do: [] }])
    }
  }

  onDiscover ({ id, text }) {
    showBanner(text, 'dm')
    emit(EV.DISCOVER, { id })
  }

  onEncounter (event) {
    this.game.events.emit('sfx', 'event')
    this.pendingEvent = event
    const pages = []
    if (event.dmIntro) { pages.push({ mode: 'dm', speaker: 'DM', text: event.dmIntro }) }
    if (event.autoCheck) {
      if (pages.length) { pages.push({ mode: 'dm', speaker: 'DM', text: event.title + ' — ' + event.text }) }
      this.pendingEventPages = pages
      return
    }
    const mode = event.npc ? 'npc' : 'dm'
    pages.push({ mode, speaker: event.npc ? event.npc.name : 'DM', title: event.title, text: event.text })
    openDialogue({
      pages,
      choices: (event.choices || []).map(c => ({ label: c.label, onSelect: () => this.chooseEvent(c) }))
    })
  }

  chooseEvent (choice) {
    this.game.events.emit('sfx', 'click')
    this.pendingChoiceLabel = choice.label
    this.network.chooseEvent(choice.id)
  }

  onCheckRequest (req) {
    this.game.events.emit('sfx', 'event')
    const event = this.pendingEvent
    let narration = ''
    if (req.context === 'event') {
      narration = event && event.autoCheck ? event.text : 'คุณเลือก: ' + (this.pendingChoiceLabel || req.label)
    } else {
      narration = req.kind === 'run' ? 'คุณตัดสินใจหันหลังหนีจากการต่อสู้' : 'คุณเตรียมโจมตีศัตรูตรงหน้า'
    }
    ui.dice = {
      context: req.context,
      kind: req.kind || null,
      title: req.context === 'event' ? (event ? event.title : req.label) : req.label,
      label: req.label,
      skillLabel: req.skillLabel,
      stat: req.stat,
      statLabel: req.statLabel || STAT_TEXT[req.stat] || '',
      modifier: req.modifier,
      dc: req.dc,
      dcLabel: req.dcLabel || 'DC',
      dice: req.dice || 'd20',
      narration,
      intro: event && event.autoCheck && this.pendingEventPages ? this.pendingEventPages.map(p => p.text) : [],
      phase: 'ready',
      result: null
    }
    if (event && event.autoCheck) { emit(EV.TRIGGER_TRAP, { encounterId: event.id, phase: 'start' }) }
  }

  roll () {
    const d = ui.dice
    if (!d || d.phase !== 'ready') { return }
    d.phase = 'rolling'
    this.rollStartedAt = Date.now()
    this.game.events.emit('sfx', 'dice')
    this.network.roll()
  }

  receiveRoll (check) {
    const d = ui.dice
    if (!d) { return }
    const wait = Math.max(0, MIN_ROLL_MS - (Date.now() - this.rollStartedAt))
    setTimeout(() => {
      if (ui.dice) {
        ui.dice.result = check
        ui.lastRoll = check
      }
    }, wait)
  }

  diceLanded () {
    if (ui.dice) { ui.dice.phase = 'landed' }
    const result = ui.dice && ui.dice.result
    if (result && result.natural20) { this.game.events.emit('sfx', 'victory') }
    if (result && result.natural1) { this.game.events.emit('sfx', 'damage') }
  }

  continueAfterRoll () {
    const d = ui.dice
    if (!d || d.phase !== 'landed') { return }
    this.game.events.emit('sfx', 'click')
    const context = d.context
    ui.dice = null
    if (context === 'event') {
      const resolution = this.pendingResolution
      this.pendingResolution = null
      if (resolution) { this.showOutcome(resolution) }
    } else {
      const update = this.pendingCombatUpdate
      this.pendingCombatUpdate = null
      if (update && update.ended) { this.finishCombat(update) } else if (update) { this.applyCombatUpdate(update) }
    }
  }

  onEventResolved (payload) {
    const check = payload.check
    const hadRoll = check && check.roll !== null && check.roll !== undefined
    if (payload.flags) { payload.flags.forEach(flag => setFlag(flag)) }
    if (!payload.loot) { this.applyRewards(payload.rewards) }
    this.pendingResolution = payload
    if (hadRoll && ui.dice) {
      this.receiveRoll(check)
      return
    }
    this.pendingResolution = null
    this.showOutcome(payload)
  }

  showOutcome (payload) {
    const lines = payload.loot ? effectLines(payload) : [...effectLines(payload), ...rewardLines(payload.rewards)]
    const event = this.pendingEvent
    const npcSpeaker = event && event.npc ? event.npc.name : null
    const kind = payload.kind
    if (payload.effects && payload.effects.hpDelta < 0) { this.game.events.emit('sfx', 'damage') } else if (!payload.loot && payload.effects && (payload.effects.itemGained || payload.rewards.gold)) { this.game.events.emit('sfx', 'treasure') }
    const close = () => {
      this.pendingEvent = null
      this.pendingEventPages = null
      emit(EV.EVENT_RESOLVED, {
        eventId: payload.eventId,
        encounterId: payload.encounterId,
        choiceId: payload.choiceId,
        success: !!(payload.check && payload.check.success),
        tier: payload.check ? payload.check.tier : 'success',
        kind
      })
      if (kind === 'trap') { emit(EV.TRIGGER_TRAP, { encounterId: payload.encounterId, phase: 'end', success: !!(payload.check && payload.check.success) }) }
      if (payload.loot) { this.openLootFromEvent(payload) }
    }
    openDialogue({
      pages: [{ mode: npcSpeaker ? 'npc' : 'dm', speaker: npcSpeaker || 'DM', text: payload.outcomeText, effects: lines }],
      choices: [],
      onClose: close
    })
  }

  openLootFromEvent (payload) {
    emit(EV.FIND_TREASURE, { encounterId: payload.encounterId })
    setLoot({
      title: 'ของที่พบในหีบ',
      text: 'คุณตรวจดูของข้างในอย่างละเอียด',
      gold: payload.rewards.gold,
      exp: payload.rewards.exp,
      items: (payload.rewards.items || []).map(name => ({ id: describeItem(name).id, name, qty: 1 })),
      applied: false,
      rewards: payload.rewards
    })
    this.game.events.emit('sfx', 'treasure')
  }

  collectLoot () {
    const loot = ui.loot
    if (!loot) { return }
    if (!loot.applied && loot.rewards) { this.applyRewards(loot.rewards) }
    this.game.events.emit('sfx', 'click')
    const after = loot.after
    ui.loot = null
    if (after) { after() }
    flushQueue()
  }

  applyRewards (rewards) {
    if (!rewards) { return }
    if (rewards.gold) { addGold(rewards.gold) }
    if (rewards.exp) { addExp(rewards.exp) }
    ;(rewards.items || []).forEach(name => addItem(name, 1))
  }

  onRested ({ healAmount }) {
    showBanner('คุณนั่งพักผิงกองไฟชั่วครู่ ความอบอุ่นค่อยๆ ซึมเข้าร่างกาย พลังชีวิตกลับคืนมา' + (healAmount ? ' (+' + healAmount + ' HP)' : ''), 'dm')
    this.game.events.emit('sfx', 'treasure')
    emit(EV.REST, { source: 'camp' })
  }

  onDefeated () {
    this.game.events.emit('sfx', 'gameover')
    narrateScene(['ความมืดกลืนกินสายตาของคุณ... เมื่อตื่นขึ้นมาอีกครั้ง คุณพบว่าตัวเองนอนอยู่ที่จุดเริ่มต้น บาดแผลหายไปแล้วแต่ความเจ็บยังตามหลอกหลอน'])
  }

  onObjective ({ questId, objectiveId, ready }) {
    const def = questDef(questId)
    const objective = def.objectives.find(o => o.id === objectiveId)
    pushToast('ภารกิจอัปเดต: ' + objective.text, 'quest')
    if (ready) { showBanner('ทุกอย่างที่ต้องตรวจสอบเสร็จสิ้นแล้ว — กลับไปรายงานผู้ที่มอบภารกิจให้', 'dm', 6500) }
  }

  onCombatStart (payload) {
    this.game.events.emit('sfx', 'event')
    emit(EV.ENCOUNTER_ENEMY, { enemyId: payload.enemy.id })
    ui.combat = {
      intro: payload.intro,
      dmIntro: payload.dmIntro || '',
      enemy: payload.enemy,
      player: payload.player,
      skill: payload.skill,
      round: payload.round,
      log: [],
      phase: 'choose',
      result: null,
      text: '',
      rewards: null,
      encounterId: payload.encounterId,
      isQuestBoss: payload.isQuestBoss
    }
  }

  combatAction (action, itemId) {
    const c = ui.combat
    if (!c || c.phase !== 'choose') { return }
    this.game.events.emit('sfx', 'click')
    if (action === 'item' && countItem(itemId) < 1) { return }
    c.phase = 'busy'
    this.network.combatAction(action, itemId)
  }

  onCombatUpdate (payload) {
    if (ui.dice && ui.dice.context === 'combat') {
      const first = payload.entries.find(e => e.actor === 'player' && e.check)
      this.pendingCombatUpdate = payload
      if (first) { this.receiveRoll(first.check) }
      return
    }
    this.applyCombatUpdate(payload)
  }

  applyCombatUpdate (payload) {
    const c = ui.combat
    if (!c) { return }
    payload.entries.forEach((entry) => {
      c.log.push(entry)
      if (entry.actor === 'enemy' && entry.hit) { this.game.events.emit('sfx', 'damage') }
      if (entry.actor === 'player' && entry.hit && entry.damage) { this.game.events.emit('sfx', 'hit') }
    })
    if (c.log.length > 30) { c.log.splice(0, c.log.length - 30) }
    if (payload.enemy) { c.enemy = payload.enemy }
    if (payload.player) { c.player = payload.player; setHp(payload.player.hp, payload.player.maxHp) }
    if (payload.skill !== undefined) { c.skill = payload.skill }
    if (payload.round) { c.round = payload.round }
    c.phase = 'choose'
  }

  onCombatEnd (payload) {
    if (ui.dice && ui.dice.context === 'combat') {
      const first = payload.entries.find(e => e.actor === 'player' && e.check)
      this.pendingCombatUpdate = { ...payload, ended: true }
      if (first) { this.receiveRoll(first.check) }
      return
    }
    this.finishCombat(payload)
  }

  finishCombat (payload) {
    const c = ui.combat
    if (!c) { return }
    payload.entries.forEach(entry => c.log.push(entry))
    if (payload.result !== 'defeat') { setHp(payload.hp, payload.maxHp) }
    c.phase = 'ended'
    c.result = payload.result
    c.text = payload.text || ''
    c.rewards = payload.rewards || null
    c.enemy = { ...c.enemy, hp: payload.result === 'victory' ? 0 : c.enemy.hp }
    if (payload.result === 'victory') { this.game.events.emit('sfx', 'victory') }
    this.finishCombatPayload = payload
  }

  closeCombat () {
    const c = ui.combat
    if (!c || c.phase !== 'ended') { return }
    this.game.events.emit('sfx', 'click')
    const payload = this.finishCombatPayload
    ui.combat = null
    this.finishCombatPayload = null
    if (!payload || payload.result !== 'victory') { flushQueue() }
    if (payload && payload.result === 'victory') {
      const rewards = payload.rewards
      setLoot({
        title: 'ชัยชนะ!',
        text: c.text || 'ศัตรูพ่ายแพ้แล้ว',
        gold: rewards.gold,
        exp: rewards.exp,
        items: (rewards.items || []).map(name => ({ id: describeItem(name).id, name, qty: 1 })),
        applied: false,
        rewards,
        after: () => emit(EV.ENEMY_DEFEATED, { enemyId: payload.enemyId, encounterId: payload.encounterId, isQuestBoss: !!payload.isQuestBoss })
      })
    }
  }

  onItemUsed ({ itemId, name, healed, hp, maxHp }) {
    removeItem(itemId, 1)
    setHp(hp, maxHp)
    pushToast('ใช้ ' + name + (healed ? ' (+' + healed + ' HP)' : ''), 'good')
    this.game.events.emit('sfx', 'treasure')
  }

  useItem (itemId) {
    const item = itemById(itemId)
    if (!item || item.type !== 'consumable' || countItem(itemId) < 1) { return }
    if (state.hp >= state.maxHp) {
      pushToast('พลังชีวิตเต็มอยู่แล้ว', 'info')
      return
    }
    this.network.useItem(itemId)
  }

  toggleEquip (itemId) {
    const item = itemById(itemId)
    if (!item || !item.slot) { return }
    if (state.equipment[item.slot] === itemId) { unequip(item.slot) } else { equip(itemId) }
    this.network.setGear(gearBonus())
    this.game.events.emit('sfx', 'click')
  }

  buy (itemId) {
    const item = itemById(itemId)
    if (!item) { return false }
    if (!spendGold(item.price)) {
      pushToast('เหรียญไม่พอ', 'bad')
      return false
    }
    addItem(itemId, 1)
    if (item.slot && !state.equipment[item.slot]) {
      equip(itemId)
      this.network.setGear(gearBonus())
    }
    this.game.events.emit('sfx', 'treasure')
    return true
  }

  sell (invId) {
    const entry = state.inventory.find(i => i.id === invId)
    if (!entry) { return false }
    const item = describeItem(invId.startsWith('trophy:') ? invId.slice(7) : invId)
    const price = item.sell || 0
    if (entry.qty === 1 && item.slot && state.equipment[item.slot] === invId) {
      unequip(item.slot)
      this.network.setGear(gearBonus())
    }
    removeItem(invId, 1)
    addGold(price)
    this.game.events.emit('sfx', 'treasure')
    return true
  }

  innRest (cost) {
    if (state.hp >= state.maxHp) {
      showBanner('ป้ามาลีมองคุณแวบหนึ่ง แล้วหัวเราะ “ดูเจ้าแข็งแรงดีอยู่แล้วนี่ ไม่ต้องเสียเหรียญหรอก”', 'dm')
      return
    }
    if (state.gold < cost) {
      showBanner('ป้ามาลีส่ายหน้าเบาๆ “ขอโทษนะ แต่เตียงคืนละ ' + cost + ' เหรียญ ไปหาเหรียญมาก่อนแล้วค่อยกลับมา”', 'dm')
      return
    }
    this.pendingInnCost = cost
    this.network.service('inn')
  }

  onServiceDone ({ id, healAmount, hp, maxHp }) {
    if (id !== 'inn') { return }
    setHp(hp, maxHp)
    spendGold(this.pendingInnCost)
    this.pendingInnCost = 0
    this.game.events.emit('sfx', 'treasure')
    emit(EV.REST, { source: 'inn' })
    narrateScene(['คุณหลับสนิทท่ามกลางเสียงฟืนแตกเบาๆ ผ้าห่มอุ่นและซุปร้อนๆ ทำให้ร่างกายที่ระบมค่อยๆ ฟื้นคืน เมื่อตื่นขึ้นมา คุณรู้สึกเหมือนได้เกิดใหม่' + (healAmount ? ' (+' + healAmount + ' HP)' : '')])
  }

  toggleDebug () {
    this.game.events.emit('debugSet', !ui.debug)
  }

  closePanels () {
    closePanel()
  }
}
