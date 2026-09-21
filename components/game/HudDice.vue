<template>
  <transition name="wh-fade">
    <div v-if="d" class="wh-overlay wh-dice-overlay">
      <div class="wh-panel wh-dice-box">
        <div class="wh-dice-head">
          <span class="wh-tag dm">{{ d.context === 'combat' ? 'การต่อสู้' : 'DM' }}</span>
          <span class="wh-dlg-title">{{ d.title }}</span>
        </div>
        <p v-for="(line, i) in d.intro" :key="i" class="wh-dice-narration dim">
          {{ line }}
        </p>
        <p class="wh-dice-narration">
          {{ d.narration }}
        </p>

        <div class="wh-check-strip">
          <span class="wh-check-name">{{ d.skillLabel }}</span>
          <span class="wh-check-mod">{{ modText }}</span>
          <span class="wh-check-dc">{{ d.dcLabel }} {{ d.dc }}</span>
        </div>

        <Dice3D :sides="sides" :phase="d.phase === 'ready' ? 'ready' : 'rolling'" :value="d.result ? d.result.roll : null" :tone="tone" @landed="controller.diceLanded()" />

        <template v-if="d.phase === 'landed' && d.result">
          <div class="wh-roll-chips">
            <div class="wh-chip">
              <small>{{ d.dice.toUpperCase() }}</small><b>{{ d.result.roll }}</b>
            </div>
            <div class="wh-chip">
              <small>ตัวปรับ</small><b>{{ modText }}</b>
            </div>
            <div class="wh-chip total">
              <small>รวม</small><b>{{ d.result.total }}</b>
            </div>
            <div class="wh-chip">
              <small>{{ d.dcLabel }}</small><b>{{ d.dc }}</b>
            </div>
          </div>
          <div class="wh-result-row">
            <div class="wh-result" :class="'tier-' + d.result.tier">
              {{ tierText }}
            </div>
            <button type="button" class="wh-btn primary" @click="controller.continueAfterRoll()">
              <span class="wh-key">E</span> ดำเนินต่อ
            </button>
          </div>
        </template>
        <template v-else>
          <button type="button" class="wh-btn primary big" :disabled="d.phase !== 'ready'" @click="controller.roll()">
            <template v-if="d.phase === 'ready'">
              <span class="wh-key">E</span> ทอย {{ d.dice.toUpperCase() }}
            </template>
            <template v-else>
              กำลังทอย...
            </template>
          </button>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { ui } from '~/game/systems/ui'
import Dice3D from '~/components/game/Dice3D.vue'

const TIER_TEXT = {
  critical_success: 'สำเร็จอย่างยอดเยี่ยม! (NATURAL 20)',
  success: 'สำเร็จ',
  failure: 'ล้มเหลว',
  critical_failure: 'ล้มเหลวอย่างยับเยิน (NATURAL 1)'
}

export default {
  name: 'HudDice',
  components: { Dice3D },
  props: {
    controller: { type: Object, required: true }
  },
  computed: {
    d () {
      return ui.dice
    },
    sides () {
      return this.d ? Number(this.d.dice.replace('d', '')) || 20 : 20
    },
    modText () {
      const m = this.d ? this.d.modifier : 0
      return (m >= 0 ? '+' : '') + m
    },
    tierText () {
      return TIER_TEXT[this.d.result.tier] || ''
    },
    tone () {
      const r = this.d && this.d.result
      if (!r || this.d.phase !== 'landed') { return 'normal' }
      return r.natural20 ? 'crit' : (r.natural1 ? 'fumble' : 'normal')
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKey)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    onKey (event) {
      if (!this.d || event.repeat) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      const key = event.key
      if (key !== 'e' && key !== 'E' && key !== 'Enter' && key !== ' ') { return }
      event.preventDefault()
      if (this.d.phase === 'ready') { this.controller.roll() } else if (this.d.phase === 'landed') { this.controller.continueAfterRoll() }
    }
  }
}
</script>
