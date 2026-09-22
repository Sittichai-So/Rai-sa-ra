<template>
  <div class="game-canvas-wrap" :class="{ 'is-shaking': shaking, 'is-full': fullscreen }" :style="wrapStyle">
    <div ref="mount" class="game-mount" />
    <div v-if="showDayNight" class="game-daynight" :style="dayNightStyle" />
    <div class="game-vignette" />
    <WorldHud
      v-if="ready"
      :controller="controller"
      :game="game"
      :class-id="hudClassId"
      :compact="height < 400"
      @shake="shake"
      @fullscreen="toggleFull"
    />
  </div>
</template>

<script>
// eslint-disable-next-line import/default
import Phaser from 'phaser'
import WorldNetwork from '~/game/net/WorldNetwork'
import WorldController from '~/game/systems/worldController'
import WorldHud from '~/components/game/WorldHud.vue'
import { loadGameState } from '~/game/systems/gameState'
import { detectTouch } from '~/components/game/touch'
import { dayNightState } from '~/game/systems/dayNight'

function waitForFont () {
  if (typeof document === 'undefined' || !document.fonts || !document.fonts.load) { return Promise.resolve() }
  const timeout = new Promise(resolve => setTimeout(resolve, 1500))
  return Promise.race([document.fonts.load("600 15px 'Kanit'", 'กขค'), timeout]).catch(() => {})
}

export default {
  name: 'ZoneCanvas',
  components: { WorldHud },
  props: {
    zone: { type: String, required: true },
    scenes: { type: Array, required: true },
    roomId: { type: String, required: true },
    classId: { type: String, default: null },
    fixedClass: { type: String, default: null },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 480 },
    background: { type: String, default: '#140f1e' },
    filter: { type: String, default: '' }
  },
  data () {
    return { ready: false, shaking: false, fullscreen: false, dayNight: dayNightState() }
  },
  computed: {
    hudClassId () {
      return this.fixedClass || this.classId
    },
    wrapStyle () {
      return this.filter ? { '--zone-filter': this.filter } : {}
    },
    showDayNight () {
      return this.zone !== 'dungeon' && this.zone !== 'cave'
    },
    dayNightStyle () {
      const { nightAlpha, goldenAlpha } = this.dayNight
      return {
        background: `radial-gradient(ellipse at center, rgba(255,150,60,${goldenAlpha}) 0%, rgba(255,150,60,${goldenAlpha * 0.4}) 40%, transparent 70%), rgba(15,15,50,${nightAlpha})`
      }
    }
  },
  created () {
    this.game = null
    this.network = null
    this.controller = null
  },
  async mounted () {
    await waitForFont()
    if (this.destroyed) { return }
    let user = null
    try { user = JSON.parse(localStorage.getItem('userData')) } catch (e) {}
    await loadGameState(user && user._id)
    if (this.destroyed) { return }
    const classId = this.hudClassId

    this.network = new WorldNetwork(this.$socket, this.roomId, this.zone, user || { username: 'Guest' }, classId)
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.$refs.mount,
      width: this.width,
      height: this.height,
      pixelArt: true,
      backgroundColor: this.background,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: this.scenes
    })
    this.game.registry.set('network', this.network)
    this.game.registry.set('classId', classId)

    const dash = this.roomId.indexOf('-')
    const partyCode = dash >= 0 ? this.roomId.slice(dash + 1) : ''
    this.controller = new WorldController({
      game: this.game,
      network: this.network,
      zone: this.zone,
      routerPush: loc => this.$router.push(loc),
      partyCode
    })
    this.controller.start()
    this.ready = true
    if (detectTouch() && window.innerHeight < 700) { this.fullscreen = true }
    this.dayNightTimer = setInterval(() => { this.dayNight = dayNightState() }, 4000)
  },
  beforeDestroy () {
    this.destroyed = true
    this.ready = false
    clearInterval(this.dayNightTimer)
    if (this.controller) {
      this.controller.destroy()
      this.controller = null
    }
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
    if (this.network) {
      this.network.destroy()
      this.network = null
    }
  },
  methods: {
    toggleFull () {
      this.fullscreen = !this.fullscreen
      const el = this.$el
      try {
        if (this.fullscreen && el.requestFullscreen) { el.requestFullscreen().catch(() => {}) } else if (!this.fullscreen && document.fullscreenElement) { document.exitFullscreen() }
      } catch (e) {}
    },
    shake () {
      this.shaking = true
      clearTimeout(this.shakeTimer)
      this.shakeTimer = setTimeout(() => { this.shaking = false }, 300)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap');

.game-canvas-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
}
.game-canvas-wrap.is-shaking { animation: screen-shake 0.3s ease; }
.game-canvas-wrap.is-full { position: fixed; inset: 0; z-index: 3000; max-width: none; display: flex; align-items: center; justify-content: center; background: #000; }
.game-canvas-wrap.is-full .game-mount { border: 0; border-radius: 0; }
.game-canvas-wrap.is-full .game-mount >>> canvas { max-width: 100vw; max-height: 100vh; }
@keyframes screen-shake {
  10% { transform: translate(-3px, 2px); }
  30% { transform: translate(3px, -2px); }
  50% { transform: translate(-2px, -1px); }
  70% { transform: translate(2px, 1px); }
  90% { transform: translate(-1px, 1px); }
  100% { transform: translate(0, 0); }
}
.game-mount {
  line-height: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(232, 179, 74, 0.25);
}
.game-mount >>> canvas {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  height: auto;
  filter: var(--zone-filter, none);
}
.game-vignette {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  border-radius: 12px;
  box-shadow: inset 0 0 70px 18px rgba(0, 0, 0, 0.55);
  background: radial-gradient(ellipse at center, transparent 55%, rgba(10, 7, 15, 0.35) 100%);
}
.game-daynight {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  border-radius: 12px;
  mix-blend-mode: multiply;
}
@media (prefers-reduced-motion: reduce) {
  .game-canvas-wrap.is-shaking { animation: none; }
}
</style>
