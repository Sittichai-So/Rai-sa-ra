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

function shade (hex, f) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)))
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)))
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)))
  return `rgb(${r},${g},${b})`
}

const TILE_COL = {
  a: '#22242a', // ถนน
  s: '#2f3138', // ฟุตบาท
  g: '#1f3020', // หญ้า
  d: '#2e2820' // ดิน
}

export default class GameRenderer {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    this.map = null
    this.mapCanvas = null
    this.particles = []
    this.floaters = []
    this.decals = []
    this.shakeAmt = 0
    this._last = (typeof performance !== 'undefined' ? performance.now() : Date.now())
  }

  // ── สร้างชั้นแมพ (พื้น + ของ) ครั้งเดียว แล้ว blit ทุกเฟรม ──
  setMap (map) {
    if (!map || !map.tiles) { return }
    this.map = map
    const cv = document.createElement('canvas')
    cv.width = map.w
    cv.height = map.h
    const c = cv.getContext('2d')
    const t = map.tile
    const cols = Math.floor(map.w / t)

    for (let i = 0; i < map.tiles.length; i++) {
      const ch = map.tiles[i]
      const cx = (i % cols) * t
      const cy = Math.floor(i / cols) * t
      c.fillStyle = TILE_COL[ch] || '#202228'
      c.fillRect(cx, cy, t, t)
      // texture พิกเซลเล็กน้อย
      c.fillStyle = 'rgba(0,0,0,0.16)'
      for (let k = 0; k < 3; k++) {
        const px = cx + ((i * 7 + k * 13) % t)
        const py = cy + ((i * 11 + k * 5) % t)
        c.fillRect(px, py, 4, 4)
      }
      if (ch === 'g') {
        c.fillStyle = 'rgba(90,150,70,0.3)'
        c.fillRect(cx + (i % 20), cy + ((i * 3) % 24), 3, 6)
      }
      c.strokeStyle = 'rgba(255,255,255,0.03)'
      c.strokeRect(cx + 0.5, cy + 0.5, t, t)
    }

    // เส้นถนน
    c.fillStyle = 'rgba(220,200,90,0.5)'
    for (let y = 0; y < map.h; y += 64) { c.fillRect(map.w / 2 - 3, y + 14, 6, 30) }
    for (let x = 0; x < map.w; x += 64) { c.fillRect(x + 14, map.h / 2 - 3, 30, 6) }

    for (const p of map.props || []) { this._drawProp(c, p) }

    this.mapCanvas = cv
  }

  _drawProp (c, p) {
    c.save()
    c.translate(p.x, p.y)
    const w = p.w || (p.r ? p.r * 2 : 40)
    const h = p.h || (p.r ? p.r * 2 : 40)
    // เงา
    c.fillStyle = 'rgba(0,0,0,0.35)'
    c.fillRect(-w / 2 + 4, -h / 2 + 6, w, h)

    if (p.type === 'car') {
      const vert = h > w
      c.fillStyle = '#3a4657'
      c.fillRect(-w / 2, -h / 2, w, h)
      c.fillStyle = '#20262f'
      c.fillRect(-w / 2, -h / 2, w, h - (vert ? 0 : 4))
      c.fillStyle = '#8fb8d8'
      if (vert) {
        c.fillRect(-w / 2 + 5, -h / 2 + 8, w - 10, 14)
        c.fillRect(-w / 2 + 5, h / 2 - 22, w - 10, 14)
      } else {
        c.fillRect(-w / 2 + 8, -h / 2 + 5, 14, h - 10)
        c.fillRect(w / 2 - 22, -h / 2 + 5, 14, h - 10)
      }
      c.fillStyle = '#12151a'
      c.fillRect(-w / 2 - 2, -h / 2 + 4, 4, h - 8)
      c.fillRect(w / 2 - 2, -h / 2 + 4, 4, h - 8)
    } else if (p.type === 'dumpster') {
      c.fillStyle = '#2f5c39'
      c.fillRect(-w / 2, -h / 2, w, h)
      c.fillStyle = '#3d7449'
      c.fillRect(-w / 2, -h / 2, w, 8)
      c.fillStyle = '#1c3a24'
      c.fillRect(-w / 2 + 3, -h / 2 + 12, w - 6, h - 16)
    } else if (p.type === 'barrel') {
      const r = p.r || 20
      c.fillStyle = '#7a4a20'
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill()
      c.strokeStyle = '#3f2811'
      c.lineWidth = 3
      c.beginPath(); c.arc(0, 0, r - 3, 0, Math.PI * 2); c.stroke()
      c.beginPath(); c.arc(0, 0, r - 9, 0, Math.PI * 2); c.stroke()
    } else if (p.type === 'planter') {
      c.fillStyle = '#4a3a2a'
      c.fillRect(-w / 2, -h / 2, w, h)
      c.fillStyle = '#2f5a30'
      for (let i = 0; i < 6; i++) {
        c.fillRect(-w / 2 + 4 + (i * (w - 8)) / 6, -h / 2 - 4, 6, 12)
      }
    } else { // crate
      c.fillStyle = '#6b4a2a'
      c.fillRect(-w / 2, -h / 2, w, h)
      c.strokeStyle = '#3f2c18'
      c.lineWidth = 3
      c.strokeRect(-w / 2 + 1.5, -h / 2 + 1.5, w - 3, h - 3)
      c.beginPath()
      c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, h / 2)
      c.moveTo(w / 2, -h / 2); c.lineTo(-w / 2, h / 2)
      c.stroke()
    }
    c.restore()
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

    if (this.mapCanvas) {
      ctx.drawImage(this.mapCanvas, 0, 0)
    } else {
      ctx.fillStyle = '#1a1c22'
      ctx.fillRect(0, 0, mapW, mapH)
    }

    ctx.strokeStyle = 'rgba(0,255,80,0.18)'
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, mapW, mapH)

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
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(74,10,10,${d.a})`
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
      const bob = Math.round(Math.sin(now / 130 + z.id * 1.7) * 2)

      ctx.save()
      ctx.translate(Math.round(z.x), Math.round(z.y))

      // ground shadow
      ctx.beginPath()
      ctx.ellipse(0, rad * 0.55, rad * 0.85, rad * 0.35, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fill()

      if (z.type === 'boss') {
        const pulse = 1 + Math.sin(now / 200) * 0.06
        ctx.beginPath()
        ctx.arc(0, 0, rad * 1.3 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,32,32,0.13)'
        ctx.fill()
      } else if (z.elite) {
        const pulse = 1 + Math.sin(now / 160 + z.id) * 0.09
        ctx.beginPath()
        ctx.arc(0, 0, rad * 1.24 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,180,40,0.18)'
        ctx.fill()
      }

      // ── ตัวซอมบี้แบบพิกเซล ──
      const base = flashing ? '#ffffff' : style.color
      const dark = flashing ? '#dddddd' : style.dark
      const u = Math.max(3, Math.round(rad / 3.6))
      const R = Math.ceil(rad / u)
      for (let gy = -R; gy <= R; gy++) {
        for (let gx = -R; gx <= R; gx++) {
          const d = Math.hypot(gx, gy)
          const edge = R - 0.15 + 0.85 * Math.sin(gx * 1.6 + gy * 2.2 + z.id + now / 380)
          if (d <= edge) {
            ctx.fillStyle = d > edge - 1 ? dark : base
            ctx.fillRect(gx * u - (u >> 1), gy * u - (u >> 1) + bob, u, u)
          }
        }
      }

      if (z.type === 'tank' && !flashing) {
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'
        ctx.lineWidth = Math.max(2, u * 0.7)
        ctx.strokeRect(-rad * 0.5, -rad * 0.5 + bob, rad, rad)
      }

      // ตา (ด้านที่หันเข้าหาเป้า)
      const ex = Math.round(Math.cos(z.angle) * rad * 0.4)
      const ey = Math.round(Math.sin(z.angle) * rad * 0.4) + bob
      const perpX = Math.round(-Math.sin(z.angle) * rad * 0.28)
      const perpY = Math.round(Math.cos(z.angle) * rad * 0.28)
      ctx.fillStyle = flashing ? '#000' : (z.type === 'spitter' ? '#d8ccff' : '#ff2020')
      ctx.fillRect(ex + perpX - u, ey + perpY - u, u * 1.4, u * 1.4)
      ctx.fillRect(ex - perpX - u, ey - perpY - u, u * 1.4, u * 1.4)

      ctx.restore()

      const barW = Math.max(28, rad * 1.9)
      const barH = z.type === 'boss' ? 6 : 4
      const bx = Math.round(z.x - barW / 2)
      const by = Math.round(z.y - rad - 12)
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2)
      ctx.fillStyle = hpPct > 0.5 ? '#40ff40' : hpPct > 0.25 ? '#ffcc00' : '#ff4040'
      ctx.fillRect(bx, by, Math.round(barW * hpPct), barH)
    }
  }

  // นักเอาชีวิตรอดมุมมองบน — อ้างอิง assets/images/charector.png
  _drawSurvivor (ctx, { rad, angle, step, flashing, female, ring }) {
    const P = female
      ? { jacket: '#a83232', jacketD: '#7a2222', pack: '#5a4a30' }
      : { jacket: '#5a5f3a', jacketD: '#3f4428', pack: '#6b5335' }
    const skin = flashing ? '#ffcaca' : '#d9a97e'
    const hair = female ? '#b5824a' : '#2e241c'
    const s = rad / 15 // สเกลสไปรต์ (ใหญ่กว่า hitbox เล็กน้อย)

    ctx.save()
    ctx.rotate(angle)
    const bob = step ? step * 0.8 * s : 0
    ctx.translate(0, bob)

    // เป้สะพายหลัง (อยู่ด้านหลัง = -x)
    ctx.fillStyle = flashing ? '#e0b0b0' : P.pack
    ctx.fillRect(-13 * s, -7 * s, 7 * s, 14 * s)
    ctx.fillStyle = shade(P.pack, 0.7)
    ctx.fillRect(-13 * s, -2 * s, 7 * s, 4 * s)

    // ปืนไรเฟิล (ถือขวางด้านหน้า)
    ctx.fillStyle = flashing ? '#ff9090' : '#23262d'
    ctx.fillRect(2 * s, -2.3 * s, 20 * s, 4.6 * s)
    ctx.fillStyle = flashing ? '#ffb0b0' : '#3a3f49'
    ctx.fillRect(1 * s, -3.5 * s, 6 * s, 7 * s)
    ctx.fillRect(-3 * s, -2 * s, 5 * s, 4 * s)

    // ลำตัว (เสื้อแจ็คเก็ต)
    ctx.fillStyle = flashing ? '#ff6b6b' : P.jacket
    ctx.beginPath()
    ctx.ellipse(0, 0, 10 * s, 8.5 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = flashing ? '#e05555' : P.jacketD
    ctx.fillRect(-2 * s, -8 * s, 4 * s, 16 * s) // ซิปกลาง

    // แขนถือปืน
    ctx.fillStyle = flashing ? '#ff8080' : P.jacketD
    ctx.fillRect(2 * s, -5 * s, 8 * s, 3 * s)
    ctx.fillRect(2 * s, 2 * s, 8 * s, 3 * s)
    ctx.fillStyle = skin
    ctx.fillRect(9 * s, -4 * s, 3 * s, 2.5 * s)
    ctx.fillRect(9 * s, 2 * s, 3 * s, 2.5 * s)

    // หัว (มองจากบน: ผม + หน้านิดหน่อยด้านหน้า)
    ctx.fillStyle = skin
    ctx.beginPath(); ctx.arc(3 * s, 0, 5 * s, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = flashing ? '#ffdede' : hair
    ctx.beginPath(); ctx.arc(0.5 * s, 0, 5.4 * s, 0, Math.PI * 2); ctx.fill()
    if (female) {
      ctx.fillStyle = hair
      ctx.fillRect(-6 * s, -2.5 * s, 5 * s, 5 * s) // หางม้า
    }

    ctx.restore()
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
      const step = moving ? Math.round(Math.sin(now / 90)) : 0

      ctx.save()
      ctx.translate(Math.round(p.x), Math.round(p.y))

      // shadow
      ctx.beginPath()
      ctx.ellipse(0, rad * 0.7, rad * 0.9, rad * 0.34, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.32)'
      ctx.fill()

      if (isMe) {
        ctx.beginPath()
        ctx.arc(0, 0, rad + 8, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.3
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      this._drawSurvivor(ctx, {
        rad,
        angle: p.angle,
        step,
        flashing,
        female: p.skin === 'f',
        ring: isMe ? color : null
      })

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

    if (this.map && this.map.props) {
      ctx.fillStyle = 'rgba(140,150,165,0.35)'
      for (const pr of this.map.props) {
        const w = pr.w || (pr.r ? pr.r * 2 : 30)
        const h = pr.h || (pr.r ? pr.r * 2 : 30)
        ctx.fillRect(mmX + (pr.x - w / 2) * scX, mmY + (pr.y - h / 2) * scY, Math.max(1, w * scX), Math.max(1, h * scY))
      }
    }

    const cvW = Math.min(this.canvas.width, mapW)
    const cvH = Math.min(this.canvas.height, mapH)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 0.5
    ctx.strokeRect(mmX + camX * scX, mmY + camY * scY, cvW * scX, cvH * scY)

    for (const z of zombies) {
      if (z.type === 'boss') {
        ctx.fillStyle = '#ff2020'
        ctx.fillRect(mmX + z.x * scX - 2, mmY + z.y * scY - 2, 5, 5)
      } else if (z.elite) {
        ctx.fillStyle = '#ffb028'
        ctx.fillRect(mmX + z.x * scX - 1.5, mmY + z.y * scY - 1.5, 3, 3)
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
