<template>
  <div class="wh-status-wrap">
    <div v-if="state.maxHp > 0" class="wh-panel wh-status">
      <div class="wh-status-icon">
        <img v-if="face" :src="face" class="wh-status-face" alt="">
        <i v-else :class="'fas ' + cls.icon" />
      </div>
      <div class="wh-status-body">
        <div class="wh-status-name">
          {{ cls.name }} <small>เลเวล {{ state.level }}</small>
        </div>
        <div class="wh-bar">
          <div class="wh-bar-ghost" :style="{ width: ghostPct + '%' }" />
          <div class="wh-bar-fill" :class="{ low: hpPct < 30 }" :style="{ width: hpPct + '%' }" />
        </div>
        <div class="wh-status-line">
          <span>{{ state.hp }}/{{ state.maxHp }} HP</span>
          <span class="wh-gold"><img :src="coin" class="wh-icon tiny" alt=""> {{ state.gold }}</span>
        </div>
        <div class="wh-bar thin">
          <div class="wh-bar-fill exp" :style="{ width: expPct + '%' }" />
        </div>
      </div>
      <transition-group name="wh-float" tag="div" class="wh-float-layer">
        <span v-for="f in floating" :key="f.id" class="wh-float" :class="f.cls">{{ f.text }}</span>
      </transition-group>
    </div>

    <div v-if="tracked" class="wh-tracker" @click="$emit('open', 'quests')">
      <div class="wh-tracker-title">
        <i class="fas fa-scroll" /> {{ tracked.title }}
      </div>
      <div class="wh-tracker-obj">
        {{ trackedText }}
      </div>
    </div>
  </div>
</template>

<script>
import { state, expIntoLevel } from '~/game/systems/gameState'
import { trackedQuest, nextObjective } from '~/game/systems/quests'
import { rpgClassById } from '~/utils/rpgClasses'
import { COIN_ICON, classPortrait } from '~/components/game/icons'

export default {
  name: 'HudStatus',
  props: {
    classId: { type: String, default: null }
  },
  data () {
    return { state, ghostPct: 0, floating: [], lastHp: null }
  },
  computed: {
    cls () {
      return rpgClassById(this.classId) || { name: 'อัศวิน', icon: 'fa-shield-halved' }
    },
    face () {
      return classPortrait(this.classId)
    },
    coin () {
      return COIN_ICON
    },
    hpPct () {
      if (!state.maxHp) { return 0 }
      return Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100))
    },
    expPct () {
      const e = expIntoLevel(state.exp)
      return Math.max(0, Math.min(100, (e.current / e.needed) * 100))
    },
    tracked () {
      return trackedQuest()
    },
    trackedText () {
      const o = this.tracked ? nextObjective(this.tracked.id) : null
      return o ? o.text : 'พร้อมรายงานผลภารกิจ'
    }
  },
  watch: {
    'state.hp' (hp) {
      const prev = this.lastHp
      this.lastHp = hp
      if (prev === null) {
        this.ghostPct = this.hpPct
        return
      }
      const delta = hp - prev
      if (delta === 0) { return }
      this.spawn(delta)
      if (delta < 0) {
        this.$emit('shake')
        clearTimeout(this.ghostTimer)
        this.ghostTimer = setTimeout(() => { this.ghostPct = this.hpPct }, 420)
      } else {
        this.ghostPct = this.hpPct
      }
    }
  },
  mounted () {
    this.lastHp = state.hp
    this.ghostPct = this.hpPct
  },
  beforeDestroy () {
    clearTimeout(this.ghostTimer)
  },
  methods: {
    spawn (delta) {
      this.seq = (this.seq || 0) + 1
      const id = this.seq
      this.floating.push({ id, text: (delta > 0 ? '+' : '') + delta, cls: delta > 0 ? 'good' : 'bad' })
      setTimeout(() => { this.floating = this.floating.filter(f => f.id !== id) }, 1000)
    }
  }
}
</script>
