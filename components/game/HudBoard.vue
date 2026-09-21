<template>
  <transition name="wh-fade">
    <div v-if="ui.panel === 'board'" class="wh-overlay" @click.self="close">
      <div class="wh-panel wh-menu-box">
        <div class="wh-menu-tabs">
          <span class="wh-tab active"><i class="fas fa-thumbtack" /> กระดานภารกิจหมู่บ้าน</span>
          <button type="button" class="wh-x" title="ปิด (Esc)" @click="close">
            <i class="fas fa-xmark" />
          </button>
        </div>
        <div class="wh-menu-body">
          <p class="wh-empty left">
            กระดาษหลายแผ่นถูกตอกติดกับกระดานไม้ ลายมือเก่าๆ ระบุงานเล็กงานน้อยที่ชาวบ้านอยากได้คนช่วย
          </p>
          <div v-for="q in quests" :key="q.id" class="wh-quest">
            <div class="wh-quest-title">
              {{ q.title }}
              <span class="wh-quest-status" :class="tone(q)">{{ label(q) }}</span>
            </div>
            <p class="wh-quest-desc">
              {{ q.description }}
            </p>
            <ul class="wh-objectives">
              <li v-for="o in q.objectives" :key="o.id" :class="{ done: o.done }">
                <i :class="o.done ? 'fas fa-square-check' : 'far fa-square'" /> {{ o.text }}
              </li>
            </ul>
            <div class="wh-quest-reward">
              รางวัล: {{ rewardText(q) }}
            </div>
            <button v-if="q.status === 'QUEST_NOT_STARTED'" type="button" class="wh-btn small" @click="accept(q)">
              รับภารกิจ
            </button>
            <button v-else-if="q.ready" type="button" class="wh-btn small" @click="turnIn(q)">
              รับรางวัล
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ui, closePanel, pushToast, setLoot } from '~/game/systems/ui'
import { BOARD_QUEST_IDS } from '~/game/data/quests'
import { questView, startQuest, completeQuest } from '~/game/systems/quests'
import { itemById } from '~/game/data/items'

export default {
  name: 'HudBoard',
  data () {
    return { ui }
  },
  computed: {
    quests () {
      return BOARD_QUEST_IDS.map(questView)
    }
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
    label (q) {
      if (q.status === 'QUEST_COMPLETED') { return 'สำเร็จแล้ว' }
      if (q.status === 'QUEST_FAILED') { return 'ล้มเหลว' }
      if (q.ready) { return 'พร้อมรับรางวัล' }
      if (q.status === 'QUEST_NOT_STARTED') { return 'ว่างอยู่' }
      return 'กำลังทำ'
    },
    tone (q) {
      if (q.status === 'QUEST_COMPLETED' || q.ready) { return 'good' }
      if (q.status === 'QUEST_FAILED') { return 'bad' }
      return ''
    },
    rewardText (q) {
      const r = q.rewards || {}
      const parts = []
      if (r.gold) { parts.push(r.gold + ' เหรียญ') }
      if (r.exp) { parts.push(r.exp + ' EXP') }
      ;(r.items || []).forEach((i) => { const item = itemById(i.id); parts.push((item ? item.name : i.id) + (i.qty > 1 ? ' x' + i.qty : '')) })
      return parts.join(' · ')
    },
    accept (q) {
      if (startQuest(q.id)) { pushToast('รับภารกิจ: ' + q.title, 'quest') }
    },
    turnIn (q) {
      const rewards = completeQuest(q.id)
      if (!rewards) { return }
      closePanel()
      setLoot({
        title: 'ภารกิจสำเร็จ: ' + q.title,
        text: 'ชาวบ้านขอบคุณที่คุณช่วยเหลือ',
        gold: rewards.gold || 0,
        exp: rewards.exp || 0,
        items: (rewards.items || []).map((i) => { const item = itemById(i.id); return { id: i.id, name: item ? item.name : i.id, qty: i.qty || 1 } }),
        applied: true
      })
    },
    onKey (event) {
      if (event.repeat) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      if (event.key === 'Escape' && ui.panel === 'board') { this.close() }
    }
  }
}
</script>
