import { BLOOD, BLAST_COLORS } from './constants.js'

export const effectMethods = {
  burst (x, y, count, colors, opts = {}) {
    const spd = opts.speed || 140
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const v = spd * (0.3 + Math.random() * 0.7)
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0,
        maxLife: opts.life || (0.4 + Math.random() * 0.4),
        size: opts.size || (2 + Math.random() * 3),
        color: colors[(Math.random() * colors.length) | 0],
        drag: opts.drag ?? 0.86
      })
    }
  },

  bloodSplat (x, y, big = false) {
    this.burst(x, y, big ? 26 : 12, BLOOD, { speed: big ? 190 : 130, size: big ? 4 : 3 })
    const n = big ? 3 : 2
    for (let i = 0; i < n; i++) {
      this.decals.push({
        x: x + (Math.random() - 0.5) * (big ? 30 : 16),
        y: y + (Math.random() - 0.5) * (big ? 30 : 16),
        r: (big ? 14 : 8) + Math.random() * 8,
        a: 0.34 + Math.random() * 0.14
      })
    }
    if (this.decals.length > 240) { this.decals.splice(0, this.decals.length - 240) }
  },

  spark (x, y, color = '#ffec70') {
    this.burst(x, y, 8, [color, '#ffffff'], { speed: 120, life: 0.3, size: 2, drag: 0.8 })
  },

  dashPuff (x, y, angle) {
    const back = angle + Math.PI
    for (let i = 0; i < 12; i++) {
      const a = back + (Math.random() - 0.5) * 1.1
      const v = 60 + Math.random() * 110
      this.particles.push({
        x: x + Math.cos(back) * 8,
        y: y + Math.sin(back) * 8 + 6,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v * 0.5,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        size: 3 + Math.random() * 4,
        color: ['#d9dee6', '#b9c2cf', '#e8ecf2'][(Math.random() * 3) | 0],
        drag: 0.9
      })
    }
  },

  muzzle (x, y, angle) {
    const mx = x + Math.cos(angle) * 20
    const my = y + Math.sin(angle) * 20
    this.particles.push({
      x: mx,
      y: my,
      vx: Math.cos(angle) * 40,
      vy: Math.sin(angle) * 40,
      life: 0,
      maxLife: 0.09,
      size: 7,
      color: '#fff2a8',
      drag: 0.5,
      glow: true
    })
  },

  explosion (x, y, radius = 100, kind = 'bomber') {
    const colors = BLAST_COLORS[kind] || BLAST_COLORS.bomber
    const big = radius > 110
    this.burst(x, y, big ? 46 : 34, colors, { speed: radius * 2.4, size: 4, life: 0.55 })
    this.burst(x, y, 14, ['#3a3a3a', '#555555', '#2a2a2a'], { speed: radius * 1.1, size: 7, life: 0.8, drag: 0.9 })
    this.rings.push({ x, y, r: radius, life: 0, maxLife: 0.42, color: kind === 'slam' ? '232,212,176' : '255,180,60' })
    this.decals.push({ x, y, r: radius * 0.42, a: 0.3, scorch: true })
    if (this.decals.length > 240) { this.decals.splice(0, this.decals.length - 240) }
  },

  floatText (x, y, text, color = '#00ff50') {
    this.floaters.push({ x, y, text, color, life: 0, maxLife: 0.9 })
  },

  shake (amt) {
    this.shakeAmt = Math.min(14, this.shakeAmt + amt)
  },

  _stepEffects (dt) {
    for (const p of this.particles) {
      p.life += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= p.drag
      p.vy *= p.drag
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife)

    for (const f of this.floaters) {
      f.life += dt
      f.y -= 34 * dt
    }
    this.floaters = this.floaters.filter(f => f.life < f.maxLife)

    for (const r of this.rings) { r.life += dt }
    this.rings = this.rings.filter(r => r.life < r.maxLife)

    this.shakeAmt *= 0.86
    if (this.shakeAmt < 0.3) { this.shakeAmt = 0 }
  },

  _drawDecals (ctx) {
    for (const d of this.decals) {
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = d.scorch ? `rgba(12,10,8,${d.a})` : `rgba(74,10,10,${d.a})`
      ctx.fill()
    }
  },

  _drawRings (ctx) {
    for (const r of this.rings) {
      const k = r.life / r.maxLife
      ctx.beginPath()
      ctx.arc(r.x, r.y, r.r * (0.35 + k * 0.75), 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${r.color},${(1 - k) * 0.85})`
      ctx.lineWidth = 10 * (1 - k) + 2
      ctx.stroke()
      if (k < 0.3) {
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r * 0.55 * (1 - k), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,240,180,${(0.3 - k) * 1.6})`
        ctx.fill()
      }
    }
  },

  _drawParticles (ctx) {
    for (const p of this.particles) {
      const k = 1 - p.life / p.maxLife
      ctx.globalAlpha = k
      if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = 10 }
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (0.5 + k * 0.5), 0, Math.PI * 2)
      ctx.fill()
      if (p.glow) { ctx.shadowBlur = 0 }
    }
    ctx.globalAlpha = 1
  },

  _drawFloaters (ctx) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const f of this.floaters) {
      const k = 1 - f.life / f.maxLife
      ctx.globalAlpha = Math.min(1, k * 1.6)
      ctx.font = 'bold 15px Orbitron, sans-serif'
      ctx.fillStyle = f.color
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'
      ctx.lineWidth = 3
      ctx.strokeText(f.text, f.x, f.y)
      ctx.fillText(f.text, f.x, f.y)
    }
    ctx.globalAlpha = 1
  }
}
