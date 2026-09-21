<template>
  <transition name="wh-rise">
    <div v-if="d" class="wh-dialogue" :class="'is-' + mode" @click="next">
      <div class="wh-panel wh-dialogue-box" :class="mode">
        <div class="wh-dlg-side">
          <template v-if="mode === 'npc' && portrait">
            <img :src="portrait" class="wh-portrait" alt="">
          </template>
          <template v-else>
            <div class="wh-dm-seal">
              <img :src="diceIcon" class="wh-dm-die" alt="">
            </div>
          </template>
        </div>
        <div class="wh-dlg-main">
          <div class="wh-dlg-head">
            <span class="wh-tag" :class="mode">{{ mode === 'dm' ? 'DM' : speaker }}</span>
            <span v-if="page.title" class="wh-dlg-title">{{ page.title }}</span>
            <span v-if="d.pages.length > 1" class="wh-dlg-count">{{ d.index + 1 }}/{{ d.pages.length }}</span>
          </div>
          <p class="wh-dlg-text">
            {{ visibleText }}<span v-if="!typedDone" class="wh-caret" />
          </p>
          <div v-if="typedDone && isLast && page.effects && page.effects.length" class="wh-effects">
            <span v-for="(fx, i) in page.effects" :key="i" class="wh-fx" :class="'tone-' + fx.tone">{{ fx.text }}</span>
          </div>
          <div v-if="typedDone && isLast && d.choices.length" class="wh-choices">
            <button
              v-for="(c, i) in d.choices"
              :key="i"
              type="button"
              class="wh-btn wh-choice"
              @click.stop="choose(i)"
            >
              <span class="wh-choice-key">{{ i + 1 }}</span>{{ c.label }}
            </button>
          </div>
          <div v-else-if="typedDone" class="wh-dlg-hint">
            <span class="wh-key">E</span> {{ isLast ? 'ปิด' : 'ต่อไป' }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ui, advanceDialogue, chooseDialogue } from '~/game/systems/ui'
import { portraitFor, DICE_ICON } from '~/components/game/icons'

const CHAR_MS = 16

export default {
  name: 'HudDialogue',
  data () {
    return { typed: 0 }
  },
  computed: {
    d () {
      return ui.dialogue
    },
    page () {
      return this.d ? this.d.pages[this.d.index] || { text: '' } : { text: '' }
    },
    isLast () {
      return !!this.d && this.d.index >= this.d.pages.length - 1
    },
    mode () {
      return this.page.mode === 'dm' ? 'dm' : 'npc'
    },
    speaker () {
      return this.page.speaker || 'NPC'
    },
    portrait () {
      return this.page.portrait ? portraitFor(this.page.portrait) : null
    },
    diceIcon () {
      return DICE_ICON
    },
    visibleText () {
      return (this.page.text || '').slice(0, this.typed)
    },
    typedDone () {
      return this.typed >= (this.page.text || '').length
    }
  },
  watch: {
    'page.text': {
      immediate: true,
      handler () { this.startTyping() }
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKey)
  },
  beforeDestroy () {
    clearInterval(this.timer)
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    startTyping () {
      clearInterval(this.timer)
      this.typed = 0
      const total = (this.page.text || '').length
      if (!total) { return }
      this.timer = setInterval(() => {
        this.typed += 2
        if (this.typed >= total) {
          this.typed = total
          clearInterval(this.timer)
        }
      }, CHAR_MS)
    },
    next () {
      if (!this.d) { return }
      if (!this.typedDone) {
        clearInterval(this.timer)
        this.typed = (this.page.text || '').length
        return
      }
      if (this.isLast && this.d.choices.length) { return }
      advanceDialogue()
    },
    choose (index) {
      chooseDialogue(index)
    },
    onKey (event) {
      if (!this.d || event.repeat) { return }
      const tag = event.target && event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') { return }
      if (Date.now() - ui.dialogueAt < 220) { return }
      const key = event.key
      if (key === 'e' || key === 'E' || key === 'Enter' || key === ' ') {
        event.preventDefault()
        this.next()
        return
      }
      if (this.isLast && this.typedDone && /^[1-9]$/.test(key)) {
        const index = Number(key) - 1
        if (this.d.choices[index]) { this.choose(index) }
      }
    }
  }
}
</script>
