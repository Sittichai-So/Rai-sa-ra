<template>
  <div v-show="!blocked" class="wh-touch">
    <div
      ref="base"
      class="wh-stick"
      @pointerdown.prevent="start"
      @pointermove.prevent="move"
      @pointerup.prevent="end"
      @pointercancel.prevent="end"
      @lostpointercapture="end"
    >
      <div class="wh-stick-knob" :style="knobStyle" />
    </div>
    <button type="button" class="wh-touch-act" @pointerdown.prevent="game.events.emit('interactPress')">
      E
    </button>
  </div>
</template>

<script>
const RADIUS = 44

export default {
  name: 'TouchControls',
  props: {
    game: { type: Object, required: true },
    blocked: { type: Boolean, default: false }
  },
  data () {
    return { dx: 0, dy: 0, pointerId: null }
  },
  computed: {
    knobStyle () {
      return { transform: 'translate(' + this.dx + 'px, ' + this.dy + 'px)' }
    }
  },
  watch: {
    blocked (value) {
      if (value) { this.release() }
    }
  },
  beforeDestroy () {
    this.release()
  },
  methods: {
    start (event) {
      this.pointerId = event.pointerId
      if (this.$refs.base.setPointerCapture) { this.$refs.base.setPointerCapture(event.pointerId) }
      this.move(event)
    },
    move (event) {
      if (this.pointerId !== event.pointerId) { return }
      const rect = this.$refs.base.getBoundingClientRect()
      let x = event.clientX - (rect.left + rect.width / 2)
      let y = event.clientY - (rect.top + rect.height / 2)
      const length = Math.hypot(x, y)
      if (length > RADIUS) {
        x = (x / length) * RADIUS
        y = (y / length) * RADIUS
      }
      this.dx = x
      this.dy = y
      this.game.events.emit('touchMove', { x: x / RADIUS, y: y / RADIUS })
    },
    end (event) {
      if (event && event.pointerId !== undefined && this.pointerId !== event.pointerId) { return }
      this.release()
    },
    release () {
      this.pointerId = null
      this.dx = 0
      this.dy = 0
      if (this.game && this.game.events) { this.game.events.emit('touchMove', { x: 0, y: 0 }) }
    }
  }
}
</script>

<style>
.wh-touch { position: absolute; inset: 0; z-index: 14; pointer-events: none; }
.wh-stick { position: absolute; left: 18px; bottom: 22px; width: 124px; height: 124px; border-radius: 50%; background: rgba(15, 10, 22, 0.45); box-shadow: 0 0 0 2px rgba(232, 179, 74, 0.55), inset 0 0 0 2px rgba(10, 7, 16, 0.6); touch-action: none; pointer-events: auto; display: flex; align-items: center; justify-content: center; }
.wh-stick-knob { width: 54px; height: 54px; border-radius: 50%; background: rgba(232, 179, 74, 0.8); box-shadow: 0 0 0 2px #0a0710; }
.wh-touch-act { position: absolute; right: 22px; bottom: 34px; width: 68px; height: 68px; border-radius: 50%; border: 0; font-family: inherit; font-size: 24px; font-weight: 700; color: #241a0d; background: rgba(232, 179, 74, 0.9); box-shadow: 0 0 0 3px #0a0710; touch-action: none; pointer-events: auto; }
.wh-touch-act:active { background: #f4c862; }
</style>
