<template>
  <transition name="wh-fade">
    <div v-if="c" class="wh-overlay wh-combat-overlay">
      <div class="wh-panel wh-combat-box">
        <div class="wh-combat-top">
          <div class="wh-enemy">
            <img :src="portrait" class="wh-enemy-img" :class="{ 'is-dead': c.phase === 'ended' && c.result === 'victory' }" alt="">
            <div class="wh-enemy-info">
              <div class="wh-enemy-name">
                {{ c.enemy.name }}
              </div>
              <div class="wh-bar">
                <div class="wh-bar-fill enemy" :style="{ width: enemyPct + '%' }" />
              </div>
              <div class="wh-enemy-stats">
                HP {{ c.enemy.hp }}/{{ c.enemy.maxHp }} · AC {{ c.enemy.ac }}
              </div>
            </div>
          </div>
          <div class="wh-round">
            รอบที่ {{ c.round }}
          </div>
        </div>

        <p v-if="c.dmIntro" class="wh-combat-intro dim">
          {{ c.dmIntro }}
        </p>
        <p class="wh-combat-intro">
          {{ c.intro }}
        </p>

        <div ref="log" class="wh-combat-log">
          <div v-for="(e, i) in recentLog" :key="i" class="wh-log-line" :class="[e.actor, { hit: e.hit, miss: !e.hit }]">
            <span class="who">{{ e.actor === 'player' ? 'คุณ' : e.name }}</span>
            <span class="txt">{{ e.text }}</span>
            <span v-if="e.check && e.check.roll" class="rollinfo">
              d20 {{ e.check.roll }}{{ e.check.modifier >= 0 ? '+' : '' }}{{ e.check.modifier }}={{ e.check.total }} vs {{ e.check.dcLabel || 'DC' }} {{ e.check.dc }}
            </span>
            <span v-if="e.damage" class="dmg">-{{ e.damage }}{{ e.crit ? ' CRIT' : '' }}</span>
            <span v-if="e.heal" class="heal">+{{ e.heal }}</span>
          </div>
        </div>

        <div class="wh-combat-player">
          <span>HP {{ c.player.hp }}/{{ c.player.maxHp }}</span>
          <div class="wh-bar">
            <div class="wh-bar-fill" :style="{ width: playerPct + '%' }" />
          </div>
          <span>AC {{ c.player.ac }}</span>
        </div>

        <template v-if="c.phase === 'ended'">
          <div class="wh-result" :class="c.result === 'victory' ? 'tier-success' : (c.result === 'fled' ? 'tier-neutral' : 'tier-failure')">
            {{ endText }}
          </div>
          <p v-if="c.text" class="wh-combat-intro">
            {{ c.text }}
          </p>
          <button type="button" class="wh-btn primary" @click="controller.closeCombat()">
            <span class="wh-key">E</span> ดำเนินต่อ
          </button>
        </template>
        <div v-else class="wh-actions">
          <button type="button" class="wh-btn act" :disabled="busy" @click="controller.combatAction('attack')">
            <span class="wh-key">1</span> โจมตี
          </button>
          <button
            v-if="c.skill"
            type="button"
            class="wh-btn act"
            :disabled="busy || c.skill.cooldown > 0"
            :title="c.skill.desc"
            @click="controller.combatAction('skill')"
          >
            <span class="wh-key">2</span> {{ c.skill.name }}<small v-if="c.skill.cooldown > 0"> ({{ c.skill.cooldown }})</small>
          </button>
          <button type="button" class="wh-btn act" :disabled="busy || !potionId" @click="controller.combatAction('item', potionId)">
            <span class="wh-key">3</span> ใช้ยา<small> ({{ potionCount }})</small>
          </button>
          <button type="button" class="wh-btn act" :disabled="busy" @click="controller.combatAction('run')">
            <span class="wh-key">4</span> หนี
          </button>
          <button v-if="canUseScale" type="button" class="wh-btn act wh-scale" :disabled="busy" @click="controller.combatAction('scale')">
            <span class="wh-key">5</span> ใช้เกล็ดมังกร
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ui } from '~/game/systems/ui'
import { countItem } from '~/game/systems/gameState'
import { enemyPortrait } from '~/components/game/icons'

const POTION_ORDER = ['potion_small', 'bandage', 'potion_large', 'elixir_vigor']

export default {
  name: 'HudCombat',
  props: {
    controller: { type: Object, required: true }
  },
  computed: {
    c () {
      return ui.combat
    },
    busy () {
      return this.c.phase !== 'choose' || !!ui.dice
    },
    portrait () {
      return enemyPortrait(this.c.enemy.portrait, this.c.enemy.id)
    },
    enemyPct () {
      return Math.max(0, Math.min(100, (this.c.enemy.hp / this.c.enemy.maxHp) * 100))
    },
    playerPct () {
      return Math.max(0, Math.min(100, (this.c.player.hp / this.c.player.maxHp) * 100))
    },
    recentLog () {
      return this.c.log.slice(-6)
    },
    potionId () {
      return POTION_ORDER.find(id => countItem(id) > 0) || null
    },
    potionCount () {
      return POTION_ORDER.reduce((sum, id) => sum + countItem(id), 0)
    },
    canUseScale () {
      return !!this.c.enemy.armored && countItem('dragon_scale') > 0
    },
    endText () {
      if (this.c.result === 'victory') { return 'ชัยชนะ!' }
      if (this.c.result === 'fled') { return 'คุณหนีรอดมาได้' }
      return 'คุณล้มลงแล้ว...'
    }
  },
  watch: {
    'c.log.length' () {
      this.$nextTick(() => {
        const el = this.$refs.log
        if (el) { el.scrollTop = el.scrollHeight }
      })
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
      if (!this.c || ui.dice || event.repeat) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      if (this.c.phase === 'ended') {
        if (event.key === 'e' || event.key === 'E' || event.key === 'Enter') { event.preventDefault(); this.controller.closeCombat() }
        return
      }
      if (this.busy) { return }
      if (event.key === '1') { this.controller.combatAction('attack') }
      if (event.key === '2' && this.c.skill && this.c.skill.cooldown === 0) { this.controller.combatAction('skill') }
      if (event.key === '3' && this.potionId) { this.controller.combatAction('item', this.potionId) }
      if (event.key === '4') { this.controller.combatAction('run') }
      if (event.key === '5' && this.canUseScale) { this.controller.combatAction('scale') }
    }
  }
}
</script>
