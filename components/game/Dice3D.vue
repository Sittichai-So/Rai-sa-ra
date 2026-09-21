<template>
  <div class="dice-stage" :class="'tone-' + tone" :style="{ width: stage + 'px', height: stage + 'px' }">
    <div ref="shadow" class="dice-shadow" />
    <div ref="body" class="dice-body">
      <div
        v-for="(f, i) in die.faces"
        :key="i"
        ref="faces"
        class="dice-face"
        :style="{ width: f.size + 'px', height: f.size + 'px', left: -f.size / 2 + 'px', top: -f.size / 2 + 'px', transform: faceCss(f) }"
      >
        <svg :width="f.size" :height="f.size" :viewBox="'0 0 ' + f.size + ' ' + f.size">
          <polygon :points="polygon(f)" class="dice-poly" />
          <text :x="f.size / 2" :y="f.size / 2" class="dice-num" :font-size="fontSize(f)">{{ f.label }}</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { buildDie, faceCss, faceQuaternion, qMul, qInv, qAxisAngle, qToAxisAngle, qToMatrix3d, qNormalize, rotateVector } from './dice3d'

const LIGHT = [-0.4, -0.7, 0.6]
const RADIUS = 42
const LAND_MS = 1500

export default {
  name: 'Dice3D',
  props: {
    sides: { type: Number, default: 20 },
    phase: { type: String, default: 'ready' },
    value: { type: Number, default: null },
    tone: { type: String, default: 'normal' }
  },
  data () {
    return { stage: Math.round(RADIUS * 2.9) }
  },
  computed: {
    die () {
      return buildDie(this.sides, RADIUS)
    }
  },
  watch: {
    phase (next) {
      if (next === 'rolling') { this.startRolling() }
    },
    value (next) {
      if (next !== null && next !== undefined) { this.startLanding(next) }
    },
    sides () {
      this.$nextTick(() => this.apply())
    }
  },
  mounted () {
    this.q = qNormalize(qAxisAngle([0.6, 1, 0.3], 0.4))
    this.offset = { x: 0, y: 0 }
    this.mode = 'idle'
    this.last = performance.now()
    this.spinAxis = [1, 0.4, 0.2]
    this.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    this.apply()
    this.raf = requestAnimationFrame(this.tick)
    if (this.phase === 'rolling') { this.startRolling() }
    if (this.value !== null && this.value !== undefined) { this.startLanding(this.value) }
  },
  beforeDestroy () {
    cancelAnimationFrame(this.raf)
  },
  methods: {
    faceCss,
    polygon (f) {
      return f.points.map(p => (p[0] + f.size / 2).toFixed(2) + ',' + (p[1] + f.size / 2).toFixed(2)).join(' ')
    },
    fontSize (f) {
      const base = this.sides === 20 ? 0.34 : this.sides === 4 ? 0.3 : 0.4
      return Math.round(f.size * base)
    },
    startRolling () {
      if (this.mode === 'landing' || this.mode === 'landed') { return }
      this.mode = 'rolling'
      this.rollStart = performance.now()
      this.spinAxis = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]
    },
    startLanding (value) {
      const face = this.die.faces.find(f => f.label === value) || this.die.faces[0]
      const target = faceQuaternion(face)
      if (this.reduced) {
        this.q = target
        this.offset = { x: 0, y: 0 }
        this.mode = 'landed'
        this.apply()
        this.$emit('landed')
        return
      }
      const delta = qMul(target, qInv(this.q))
      const { axis, angle } = qToAxisAngle(delta)
      this.landing = { start: this.q, axis, total: angle + Math.PI * 4, target, begin: performance.now() }
      this.mode = 'landing'
    },
    tick (now) {
      const dt = Math.min(0.05, (now - this.last) / 1000)
      this.last = now
      if (this.mode === 'idle') {
        this.q = qNormalize(qMul(qAxisAngle([0.2, 1, 0.1], dt * 0.7), this.q))
        this.offset = { x: 0, y: Math.sin(now / 700) * 2 }
      } else if (this.mode === 'rolling') {
        const t = (now - this.rollStart) / 1000
        this.spinAxis = [this.spinAxis[0] + Math.sin(t * 3) * dt, this.spinAxis[1] + Math.cos(t * 2.3) * dt, this.spinAxis[2] + Math.sin(t * 1.7) * dt]
        this.q = qNormalize(qMul(qAxisAngle(this.spinAxis, dt * 11), this.q))
        this.offset = { x: Math.sin(t * 5) * 6, y: -Math.abs(Math.sin(t * 9)) * 26 }
      } else if (this.mode === 'landing') {
        const l = this.landing
        const t = Math.min(1, (now - l.begin) / LAND_MS)
        const e = 1 - Math.pow(1 - t, 3)
        this.q = qNormalize(qMul(qAxisAngle(l.axis, l.total * e), l.start))
        this.offset = { x: Math.sin(t * Math.PI * 4) * 8 * (1 - t), y: -Math.abs(Math.sin(t * Math.PI * 3.4)) * 30 * Math.pow(1 - t, 1.4) }
        if (t >= 1) {
          this.q = l.target
          this.offset = { x: 0, y: 0 }
          this.mode = 'landed'
          this.apply()
          this.$emit('landed')
        }
      }
      if (this.mode !== 'landed') { this.apply() }
      this.raf = requestAnimationFrame(this.tick)
    },
    apply () {
      if (!this.$refs.body) { return }
      this.$refs.body.style.transform = 'translate3d(' + this.offset.x.toFixed(2) + 'px,' + this.offset.y.toFixed(2) + 'px,0) ' + qToMatrix3d(this.q)
      const shadow = this.$refs.shadow
      if (shadow) {
        const lift = Math.min(1, Math.abs(this.offset.y) / 40)
        shadow.style.transform = 'translate(-50%, 0) scale(' + (1 - lift * 0.35).toFixed(3) + ')'
        shadow.style.opacity = (0.55 - lift * 0.3).toFixed(3)
      }
      const faces = this.$refs.faces
      if (!faces) { return }
      this.die.faces.forEach((f, i) => {
        const n = rotateVector(this.q, f.normal)
        const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2])
        if (faces[i]) { faces[i].style.setProperty('--lit', (0.62 + lit * 0.62).toFixed(3)) }
      })
    }
  }
}
</script>

<style scoped>
.dice-stage {
  position: relative;
  perspective: 620px;
  margin: 0 auto;
  --die-face: #8a2233;
  --die-edge: #1a0d12;
  --die-ink: #f6dc8a;
}
.dice-stage.tone-crit { --die-face: #b8881f; --die-ink: #fff4c2; }
.dice-stage.tone-fumble { --die-face: #3d2f38; --die-ink: #ffb3b3; }
.dice-shadow {
  position: absolute;
  left: 50%;
  bottom: 14px;
  width: 92px;
  height: 16px;
  border-radius: 50%;
  background: #000;
  opacity: 0.5;
}
.dice-body {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
}
.dice-face {
  position: absolute;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.dice-face svg {
  display: block;
  filter: brightness(var(--lit, 1));
}
.dice-poly {
  fill: var(--die-face);
  stroke: var(--die-edge);
  stroke-width: 2.4;
  stroke-linejoin: round;
}
.dice-num {
  fill: var(--die-ink);
  font-family: 'Cinzel', serif;
  font-weight: 900;
  text-anchor: middle;
  dominant-baseline: central;
}
</style>
