<template>
  <transition name="wh-fade">
    <div v-if="ui.panel === 'menu'" class="wh-overlay" @click.self="close">
      <div class="wh-panel wh-menu-box">
        <div class="wh-menu-tabs">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            class="wh-tab"
            :class="{ active: ui.panelTab === t.id }"
            @click="ui.panelTab = t.id"
          >
            <i :class="t.icon" /> {{ t.label }}
          </button>
          <button type="button" class="wh-x" title="ปิด (Esc)" @click="close">
            <i class="fas fa-xmark" />
          </button>
        </div>

        <div v-if="ui.panelTab === 'quests'" class="wh-menu-body">
          <h3 class="wh-h">
            ภารกิจที่กำลังทำ
          </h3>
          <p v-if="!active.length" class="wh-empty">
            ยังไม่มีภารกิจ ลองไปคุยกับผู้เฒ่าที่อนุสาวรีย์ หรืออ่านป้ายประกาศกลางหมู่บ้าน
          </p>
          <div v-for="q in active" :key="q.id" class="wh-quest">
            <div class="wh-quest-title">
              {{ q.title }} <span class="wh-quest-status">{{ statusText(q) }}</span>
            </div>
            <p class="wh-quest-desc">
              {{ q.description }}
            </p>
            <ul class="wh-objectives">
              <li v-for="o in q.objectives" :key="o.id" :class="{ done: o.done }">
                <i :class="o.done ? 'fas fa-square-check' : 'far fa-square'" /> {{ o.text }}
              </li>
            </ul>
            <div v-if="nextHint(q)" class="wh-hint">
              <i class="fas fa-lightbulb" /> {{ nextHint(q) }}
            </div>
            <div class="wh-quest-reward">
              รางวัล: {{ rewardText(q) }}
            </div>
          </div>
          <template v-if="finished.length">
            <h3 class="wh-h">
              จบแล้ว
            </h3>
            <div v-for="q in finished" :key="q.id" class="wh-quest done">
              <div class="wh-quest-title">
                {{ q.title }} <span class="wh-quest-status" :class="q.status === 'QUEST_FAILED' ? 'bad' : 'good'">{{ q.status === 'QUEST_FAILED' ? 'ล้มเหลว' : 'สำเร็จ' }}</span>
              </div>
            </div>
          </template>
        </div>

        <div v-else-if="ui.panelTab === 'bag'" class="wh-menu-body">
          <div class="wh-sheet">
            <div class="wh-sheet-row">
              <span>เลเวล</span><b>{{ state.level }}</b>
            </div>
            <div class="wh-sheet-row">
              <span>EXP</span><b>{{ exp.current }}/{{ exp.needed }}</b>
            </div>
            <div class="wh-sheet-row">
              <span>HP</span><b>{{ state.hp }}/{{ state.maxHp }}</b>
            </div>
            <div class="wh-sheet-row">
              <span>เหรียญ</span><b>{{ state.gold }}</b>
            </div>
            <div class="wh-sheet-row">
              <span>โจมตีเพิ่ม</span><b>+{{ gear.atk }}</b>
            </div>
            <div class="wh-sheet-row">
              <span>AC เพิ่ม</span><b>+{{ gear.ac }}</b>
            </div>
          </div>
          <h3 class="wh-h">
            ถุงของ
          </h3>
          <p v-if="!state.inventory.length" class="wh-empty">
            ถุงว่างเปล่า
          </p>
          <ul class="wh-items">
            <li v-for="item in state.inventory" :key="item.id" class="wh-item">
              <img :src="iconFor(item)" class="wh-icon" alt="">
              <div class="wh-item-main">
                <div class="wh-item-name">
                  {{ item.name }} <small>x{{ item.qty }}</small><span v-if="isEquipped(item)" class="wh-equipped">สวมอยู่</span>
                </div>
                <div class="wh-item-desc">
                  {{ describe(item) }}
                </div>
              </div>
              <button v-if="isConsumable(item)" type="button" class="wh-btn small" @click="controller.useItem(item.id)">
                ใช้
              </button>
              <button v-if="isGear(item)" type="button" class="wh-btn small" @click="controller.toggleEquip(item.id)">
                {{ isEquipped(item) ? 'ถอด' : 'สวม' }}
              </button>
            </li>
          </ul>
        </div>

        <div v-else class="wh-menu-body">
          <h3 class="wh-h">
            บันทึกของ DM
          </h3>
          <label class="wh-check">
            <input v-model="dmOnly" type="checkbox"> แสดงเฉพาะคำบรรยายของ DM
          </label>
          <p v-if="!logs.length" class="wh-empty">
            ยังไม่มีบันทึก
          </p>
          <div ref="logList" class="wh-log-list">
            <div v-for="l in logs" :key="l.id" class="wh-log-entry" :class="l.mode">
              <span class="wh-tag" :class="l.mode === 'dm' ? 'dm' : 'npc'">{{ l.speaker }}</span>
              <span class="wh-log-text">{{ l.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ui, closePanel } from '~/game/systems/ui'
import { state, expIntoLevel, gearBonus } from '~/game/systems/gameState'
import { activeQuests, finishedQuests, nextObjective } from '~/game/systems/quests'
import { itemById, describeItem } from '~/game/data/items'
import { itemIcon } from '~/components/game/icons'

export default {
  name: 'HudMenu',
  props: {
    controller: { type: Object, required: true }
  },
  data () {
    return {
      ui,
      state,
      dmOnly: false,
      tabs: [
        { id: 'quests', label: 'ภารกิจ', icon: 'fas fa-scroll' },
        { id: 'bag', label: 'ตัวละคร', icon: 'fas fa-bag-shopping' },
        { id: 'log', label: 'บันทึก DM', icon: 'fas fa-book-open' }
      ]
    }
  },
  computed: {
    active () {
      return activeQuests()
    },
    finished () {
      return finishedQuests()
    },
    exp () {
      return expIntoLevel(state.exp)
    },
    gear () {
      return gearBonus()
    },
    logs () {
      const list = this.dmOnly ? state.log.filter(l => l.mode === 'dm') : state.log
      return list.slice(-60)
    }
  },
  watch: {
    'ui.panelTab' () { this.scrollLog() },
    'ui.panel' () { this.scrollLog() }
  },
  mounted () {
    window.addEventListener('keydown', this.onKey)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    close () {
      closePanel()
    },
    scrollLog () {
      this.$nextTick(() => {
        const el = this.$refs.logList
        if (el) { el.scrollTop = el.scrollHeight }
      })
    },
    statusText (q) {
      return q.ready ? 'พร้อมรายงานผล' : 'กำลังดำเนินการ'
    },
    nextHint (q) {
      const o = nextObjective(q.id)
      return o ? o.hint : ''
    },
    rewardText (q) {
      const r = q.rewards || {}
      const parts = []
      if (r.gold) { parts.push(r.gold + ' เหรียญ') }
      if (r.exp) { parts.push(r.exp + ' EXP') }
      ;(r.items || []).forEach((i) => { const item = itemById(i.id); parts.push((item ? item.name : i.id) + (i.qty > 1 ? ' x' + i.qty : '')) })
      return parts.join(' · ')
    },
    iconFor (item) {
      const known = itemById(item.id)
      return itemIcon(known ? known.icon : 'skull')
    },
    describe (item) {
      return describeItem(item.id.startsWith('trophy:') ? item.id.slice(7) : item.id).desc
    },
    isConsumable (item) {
      const known = itemById(item.id)
      return !!known && known.type === 'consumable'
    },
    isGear (item) {
      const known = itemById(item.id)
      return !!known && !!known.slot
    },
    isEquipped (item) {
      const known = itemById(item.id)
      return !!known && !!known.slot && state.equipment[known.slot] === item.id
    },
    onKey (event) {
      if (event.repeat) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      if (event.key === 'Escape' && ui.panel === 'menu') { this.close() }
    }
  }
}
</script>
