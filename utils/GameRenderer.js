/* eslint-disable no-unused-vars */

const TILE = 40

const ZOMBIE_STYLE = {
  normal: { color: '#7f9a3c', dark: '#5c722a', radius: 20 },
  runner: { color: '#cf4fb2', dark: '#993380', radius: 15 },
  tank: { color: '#4c7d5c', dark: '#335740', radius: 31 },
  spitter: { color: '#6b4fd0', dark: '#4a3597', radius: 18 },
  boss: { color: '#b52323', dark: '#7d1414', radius: 52 }
}

const BLOOD = ['#8a1f1f', '#a82727', '#6d1616']

export default class GameRenderer {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this._buildMapPattern()

    this.particles = []
    this.floaters = []
    this.decals = []
    this.shakeAmt = 0
    this._last = (typeof performance !== 'undefined' ? performance.now() : Date.now())
  }

  _buildMapPattern () {
    const off = document.createElement('canvas')
    off.width = TILE
    off.height = TILE
    const c = off.getContext('2d')
    c.fillStyle = '#0d1117'
    c.fillRect(0, 0, TILE, TILE)
    c.strokeStyle = 'rgba(0,255,80,0.06)'
    c.lineWidth = 0.5
    c.strokeRect(0, 0, TILE, TILE)
    this.mapPattern = this.ctx.createPattern(off, 'repeat')
  }

  // ── effect triggers (เรียกจาก component) ─────────────
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
  }

  bloodSplat (x, y, big = false) {
    this.burst(x, y, big ? 26 : 12, BLOOD, { speed: big ? 190 : 130, size: big ? 4 : 3 })
    this.decals.push({ x, y, r: big ? 22 : 12, a: 0.5 })
    if (this.decals.length > 60) { this.decals.shift() }
  }

  spark (x, y, color = '#ffec70') {
    this.burst(x, y, 8, [color, '#ffffff'], { speed: 120, life: 0.3, size: 2, drag: 0.8 })
  }

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
  }

  floatText (x, y, text, color = '#00ff50') {
    this.floaters.push({ x, y, text, color, life: 0, maxLife: 0.9 })
  }

  shake (amt) {
    this.shakeAmt = Math.min(14, this.shakeAmt + amt)
  }

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

    for (const d of this.decals) { d.a *= 0.999 }
    this.shakeAmt *= 0.86
    if (this.shakeAmt < 0.3) { this.shakeAmt = 0 }
  }

  // ── main draw ────────────────────────────────────────
  draw ({ players, zombies, bullets, projectiles, pickups, myId, camX, camY, mapW, mapH }) {
    const ctx = this.ctx
    const W = this.canvas.width
    const H = this.canvas.height
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    const dt = Math.min(0.05, (now - this._last) / 1000)
    this._last = now
    this._stepEffects(dt)

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#080c10'
    ctx.fillRect(0, 0, W, H)

    const sx = this.shakeAmt ? (Math.random() - 0.5) * this.shakeAmt : 0
    const sy = this.shakeAmt ? (Math.random() - 0.5) * this.shakeAmt : 0

    ctx.save()
    ctx.translate(-Math.round(camX) + sx, -Math.round(camY) + sy)

    ctx.fillStyle = this.mapPattern
    ctx.fillRect(0, 0, mapW, mapH)

    ctx.strokeStyle = 'rgba(0,255,80,0.22)'
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, mapW, mapH)
    ctx.strokeStyle = 'rgba(255,40,40,0.12)'
    ctx.lineWidth = 20
    ctx.strokeRect(10, 10, mapW - 20, mapH - 20)

    this._drawDecals(ctx)
    this._drawPickups(ctx, pickups || [], now)
    this._drawBullets(ctx, bullets)
    this._drawProjectiles(ctx, projectiles || [])
    this._drawZombies(ctx, zombies, now)
    this._drawPlayers(ctx, players, myId, now)
    this._drawParticles(ctx)
    this._drawFloaters(ctx)

    ctx.restore()

    this._drawMinimap(ctx, players, zombies, myId, camX, camY, W, H, mapW, mapH)
  }

  _drawDecals (ctx) {
    for (const d of this.decals) {
      if (d.a < 0.04) { continue }
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(80,14,14,${d.a})`
      ctx.fill()
    }
  }

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
  }

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

  _drawBullets (ctx, bullets) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255,236,64,0.4)'
    ctx.lineWidth = 2
    for (const b of bullets) {
      ctx.beginPath()
      ctx.moveTo(b.x, b.y)
      ctx.lineTo(b.x - (b.vx || 0) * 0.028, b.y - (b.vy || 0) * 0.028)
      ctx.stroke()
    }
    for (const b of bullets) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#ffec40'
      ctx.shadowColor = '#ffec40'
      ctx.shadowBlur = 8
      ctx.fill()
    }
    ctx.shadowBlur = 0
    ctx.restore()
  }

  _drawProjectiles (ctx, projectiles) {
    ctx.save()
    for (const p of projectiles) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius || 7, 0, Math.PI * 2)
      ctx.fillStyle = '#9d6bff'
      ctx.shadowColor = '#9d6bff'
      ctx.shadowBlur = 12
      ctx.fill()
    }
    ctx.shadowBlur = 0
    ctx.restore()
  }

  _drawPickups (ctx, pickups, now) {
    const t = now / 300
    for (const p of pickups) {
      const bob = Math.sin(t + p.id) * 3
      const isAmmo = p.type === 'ammo'
      const c = isAmmo ? '#ffcc40' : '#40ff78'
      ctx.save()
      ctx.translate(p.x, p.y + bob)

      ctx.beginPath()
      ctx.arc(0, 0, 15, 0, Math.PI * 2)
      ctx.fillStyle = isAmmo ? 'rgba(255,204,64,0.16)' : 'rgba(64,255,120,0.16)'
      ctx.strokeStyle = c
      ctx.lineWidth = 2
      ctx.shadowColor = c
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.fillStyle = c
      if (isAmmo) {
        ctx.fillRect(-5, -6, 10, 12)
        ctx.fillStyle = '#080c10'
        ctx.fillRect(-5, -6, 10, 3)
      } else {
        ctx.fillRect(-2, -7, 4, 14)
        ctx.fillRect(-7, -2, 14, 4)
      }
      ctx.restore()
    }
  }

  _drawZombies (ctx, zombies, now) {
    for (const z of zombies) {
      const style = ZOMBIE_STYLE[z.type] || ZOMBIE_STYLE.normal
      const rad = z.radius || style.radius
      const hpPct = z.maxHp ? z.hp / z.maxHp : 1
      const flashing = z.hitFlash > 0
      const wob = Math.sin(now / 120 + z.id * 1.7) * 0.14

      ctx.save()
      ctx.translate(z.x, z.y)

      // ground shadow
      ctx.beginPath()
      ctx.ellipse(0, rad * 0.5, rad * 0.9, rad * 0.4, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fill()

      ctx.rotate(z.angle + Math.PI / 2 + wob)

      if (z.type === 'boss') {
        const pulse = 1 + Math.sin(now / 200) * 0.05
        ctx.beginPath()
        ctx.arc(0, 0, rad * 1.35 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,32,32,0.12)'
        ctx.fill()
      }

      // irregular body
      ctx.beginPath()
      const lobes = z.type === 'boss' ? 9 : 7
      for (let i = 0; i <= lobes; i++) {
        const a = (i / lobes) * Math.PI * 2
        const rr = rad * (0.86 + 0.14 * Math.sin(a * 3 + z.id + now / 300))
        const px = Math.cos(a) * rr
        const py = Math.sin(a) * rr
        if (i === 0) { ctx.moveTo(px, py) } else { ctx.lineTo(px, py) }
      }
      ctx.closePath()
      ctx.fillStyle = flashing ? '#ffffff' : style.color
      ctx.strokeStyle = flashing ? '#ffffff' : style.dark
      ctx.lineWidth = z.type === 'boss' ? 3 : 2
      ctx.fill()
      ctx.stroke()

      if (z.type === 'tank') {
        ctx.beginPath()
        ctx.arc(0, 0, rad * 0.62, 0, Math.PI * 2)
        ctx.strokeStyle = flashing ? '#fff' : 'rgba(0,0,0,0.35)'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // eyes
      const eyeOff = rad * 0.32
      ctx.fillStyle = flashing ? '#000' : (z.type === 'spitter' ? '#c9b8ff' : '#ff2626')
      ctx.shadowColor = '#ff2020'
      ctx.shadowBlur = flashing ? 0 : 5
      ctx.beginPath(); ctx.arc(-eyeOff, -rad * 0.38, rad * 0.15, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(eyeOff, -rad * 0.38, rad * 0.15, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0

      ctx.restore()

      const barW = Math.max(30, rad * 1.9)
      const barH = z.type === 'boss' ? 6 : 4
      const bx = z.x - barW / 2
      const by = z.y - rad - 12
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2)
      ctx.fillStyle = hpPct > 0.5 ? '#40ff40' : hpPct > 0.25 ? '#ffcc00' : '#ff4040'
      ctx.fillRect(bx, by, barW * hpPct, barH)
    }
  }

  _drawPlayers (ctx, players, myId, now) {
    for (const p of players) {
      const color = p.color || '#7c6ff5'
      const rad = p.radius || 18

      if (!p.alive && !p.downed) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.beginPath()
        ctx.ellipse(0, 0, rad * 1.2, rad * 0.7, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(80,14,14,0.4)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(0, 0, rad * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(60,60,66,0.7)'
        ctx.fill()
        ctx.restore()
        continue
      }

      if (p.downed) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.beginPath()
        ctx.ellipse(0, 0, rad * 1.3, rad * 0.75, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(80,14,14,0.35)'
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(0, 0, rad * 0.95, rad * 0.6, p.angle, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color || '#7c6ff5'}88`
        ctx.strokeStyle = '#ff5050'
        ctx.lineWidth = 1.5
        ctx.fill()
        ctx.stroke()
        // revive progress ring
        if (p.reviveProgress > 0) {
          ctx.beginPath()
          ctx.arc(0, 0, rad + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.reviveProgress)
          ctx.strokeStyle = '#40ff78'
          ctx.lineWidth = 3
          ctx.stroke()
        }
        ctx.restore()

        ctx.font = '10px Share Tech Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#ff6060'
        ctx.fillText('▼ ' + p.username, p.x, p.y - rad - 8)
        continue
      }

      const isMe = p.id === myId
      const flashing = p.hitFlash > 0
      const moving = Math.hypot(p.vx || 0, p.vy || 0) > 1
      const bob = moving ? Math.sin(now / 70) * 1.6 : 0

      ctx.save()
      ctx.translate(p.x, p.y)

      // shadow
      ctx.beginPath()
      ctx.ellipse(0, rad * 0.55, rad * 0.85, rad * 0.35, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fill()

      if (isMe) {
        ctx.beginPath()
        ctx.arc(0, 0, rad + 7, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.28
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      ctx.rotate(p.angle)
      ctx.translate(0, bob)

      // gun
      ctx.fillStyle = flashing ? '#ff8f8f' : '#20242c'
      ctx.fillRect(rad - 3, -3.5, 15, 7)

      // body
      ctx.beginPath()
      ctx.arc(0, 0, rad, 0, Math.PI * 2)
      ctx.fillStyle = flashing ? '#ff6b6b' : (isMe ? color : `${color}bb`)
      ctx.strokeStyle = isMe ? '#ffffff' : color
      ctx.lineWidth = isMe ? 2.5 : 1.5
      ctx.fill()
      ctx.stroke()

      // head (offset toward facing)
      ctx.beginPath()
      ctx.arc(rad * 0.36, 0, rad * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = flashing ? '#ffcaca' : '#e9e4d6'
      ctx.fill()

      ctx.restore()

      // name
      ctx.font = isMe ? 'bold 11px Share Tech Mono, monospace' : '10px Share Tech Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = isMe ? '#fff' : 'rgba(255,255,255,0.55)'
      ctx.fillText(p.username, p.x, p.y - rad - 8)

      // hp bar
      const barW = 38
      const bx = p.x - barW / 2
      const by = p.y + rad + 6
      const hpPct = p.hp / p.maxHp
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(bx - 1, by - 1, barW + 2, 6)
      ctx.fillStyle = hpPct > 0.5 ? '#00ff50' : hpPct > 0.25 ? '#ffcc00' : '#ff4040'
      ctx.fillRect(bx, by, barW * Math.max(0, hpPct), 4)

      // reload ring
      if (p.reloading) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, rad + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ((now / (p.reloadMs || 1600)) % 1))
        ctx.strokeStyle = '#ffcc40'
        ctx.lineWidth = 2.5
        ctx.stroke()
      }
    }
  }

  _drawMinimap (ctx, players, zombies, myId, camX, camY, W, H, mapW, mapH) {
    const mmW = 140
    const mmH = 105
    const mmX = 14
    const mmY = H - mmH - 14
    const scX = mmW / mapW
    const scY = mmH / mapH

    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(mmX, mmY, mmW, mmH)
    ctx.strokeStyle = 'rgba(0,255,80,0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(mmX, mmY, mmW, mmH)

    const cvW = Math.min(this.canvas.width, mapW)
    const cvH = Math.min(this.canvas.height, mapH)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 0.5
    ctx.strokeRect(mmX + camX * scX, mmY + camY * scY, cvW * scX, cvH * scY)

    for (const z of zombies) {
      if (z.type === 'boss') {
        ctx.fillStyle = '#ff2020'
        ctx.fillRect(mmX + z.x * scX - 2, mmY + z.y * scY - 2, 5, 5)
      } else {
        ctx.fillStyle = z.type === 'spitter' ? '#9d6bff' : '#ff4020'
        ctx.fillRect(mmX + z.x * scX - 1, mmY + z.y * scY - 1, 2, 2)
      }
    }

    for (const p of players) {
      ctx.fillStyle = p.alive ? (p.id === myId ? '#fff' : (p.color || '#7c6ff5')) : '#555'
      ctx.beginPath()
      ctx.arc(mmX + p.x * scX, mmY + p.y * scY, p.id === myId ? 3 : 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = 'rgba(0,255,80,0.4)'
    ctx.font = '9px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('MAP', mmX + 4, mmY + 10)
  }
}
