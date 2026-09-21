<template>
  <div v-if="ui.debug" class="wh-panel wh-debug">
    <div class="wh-debug-head">
      <b>DEBUG</b>
      <span>F3 ปิด</span>
    </div>
    <div class="wh-debug-row">
      <span>zone</span><b>{{ ui.zone }}</b>
    </div>
    <div class="wh-debug-row">
      <span>map</span><b>{{ state.currentMap }}</b>
    </div>
    <div class="wh-debug-row">
      <span>pos</span><b>{{ pos }}</b>
    </div>
    <div class="wh-debug-row">
      <span>story</span><b>{{ state.storyProgress }}</b>
    </div>
    <div class="wh-debug-row">
      <span>lv/exp/gold</span><b>{{ state.level }}/{{ state.exp }}/{{ state.gold }}</b>
    </div>
    <div class="wh-debug-title">
      quests
    </div>
    <div v-for="q in questStates" :key="q.id" class="wh-debug-row">
      <span>{{ q.id }}</span><b>{{ q.status.replace('QUEST_', '') }}{{ q.ready ? ' *READY' : '' }}</b>
    </div>
    <div class="wh-debug-title">
      objectives
    </div>
    <div v-for="o in objectives" :key="o.key" class="wh-debug-row">
      <span>{{ o.key }}</span><b>{{ o.done ? 'done' : 'todo' }}</b>
    </div>
    <div class="wh-debug-title">
      flags
    </div>
    <div class="wh-debug-flags">
      {{ flagText }}
    </div>
    <div class="wh-debug-title">
      npc
    </div>
    <div v-for="(n, id) in state.npcStates" :key="id" class="wh-debug-row">
      <span>{{ id }}</span><b>{{ JSON.stringify(n) }}</b>
    </div>
    <div class="wh-debug-title">
      last roll
    </div>
    <div class="wh-debug-flags">
      {{ rollText }}
    </div>
    <div class="wh-debug-title">
      random encounter
    </div>
    <div class="wh-debug-flags">
      {{ randomText }}
    </div>
    <div class="wh-debug-title">
      recent events
    </div>
    <div v-for="(e, i) in recent" :key="i" class="wh-debug-flags">
      {{ e.type }} {{ JSON.stringify(e.payload) }}
    </div>
    <div class="wh-debug-actions">
      <button type="button" class="wh-btn small" @click="addGold">
        +100 gold
      </button>
      <button type="button" class="wh-btn small" @click="reset">
        reset save
      </button>
    </div>
  </div>
</template>

<script>
import { ui } from '~/game/systems/ui'
import { state, addGold, resetState } from '~/game/systems/gameState'
import { QUESTS } from '~/game/data/quests'
import { statusOf, isReady, objectiveDone } from '~/game/systems/quests'
import { recentEvents } from '~/game/systems/worldEvents'

export default {
  name: 'HudDebug',
  props: {
    game: { type: Object, default: null }
  },
  data () {
    return { ui, state, pos: '-', tick: 0, recent: [] }
  },
  computed: {
    questStates () {
      return Object.keys(QUESTS).map(id => ({ id, status: statusOf(id), ready: isReady(id) }))
    },
    objectives () {
      const list = []
      Object.keys(QUESTS).forEach((id) => {
        if (statusOf(id) === 'QUEST_NOT_STARTED') { return }
        QUESTS[id].objectives.forEach(o => list.push({ key: id + '.' + o.id, done: objectiveDone(id, o.id) }))
      })
      return list
    },
    flagText () {
      const names = Object.keys(state.worldFlags).filter(k => state.worldFlags[k])
      return names.length ? names.join(', ') : '(none)'
    },
    rollText () {
      const r = ui.lastRoll
      return r && r.roll ? r.dice + ' ' + r.roll + (r.modifier >= 0 ? '+' : '') + r.modifier + '=' + r.total + ' vs ' + r.dc + ' -> ' + r.tier : '(none)'
    },
    randomText () {
      const r = ui.random
      return r ? JSON.stringify(r.table) + ' dist>=' + r.minDistance + ' cd=' + r.cooldownMs + 'ms' : '(ไม่มีในโซนนี้)'
    }
  },
  watch: {
    'ui.debug' (on) {
      clearInterval(this.timer)
      if (on) {
        this.refresh()
        this.timer = setInterval(this.refresh, 250)
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  methods: {
    refresh () {
      const scene = this.game && this.game.scene.scenes.find(s => s.player)
      this.pos = scene ? Math.round(scene.player.x) + ',' + Math.round(scene.player.y) : '-'
      this.recent = recentEvents.slice(0, 5)
    },
    addGold () {
      addGold(100)
    },
    reset () {
      resetState()
    }
  }
}
</script>
