import { shade } from './constants.js'

export const playerMethods = {
  loadHeroSprites (urls, meta) {
    this.heroMeta = meta
    this.hero = {}
    for (const skin of Object.keys(urls)) {
      this.hero[skin] = {}
      for (const anim of Object.keys(urls[skin])) {
        const img = new Image()
        img.src = urls[skin][anim]
        this.hero[skin][anim] = img
      }
    }
  },

  heroReady (female) {
    const set = this.hero && this.hero[female ? 'f' : 'm']
    const w = set && set.walk
    return !!(this.heroMeta && w && w.complete && w.naturalWidth)
  },

  _drawSurvivor (ctx, o) {
    if (this.heroReady(o.female)) {
      return this._drawHeroSprite(ctx, o)
    }
    return this._drawSurvivorVector(ctx, o)
  },

  _drawHeroSprite (ctx, o) {
    const skin = o.female ? 'f' : 'm'
    const set = this.hero[skin]
    const meta = this.heroMeta
    const skinMeta = (meta.skins && meta.skins[skin]) || null
    const animOf = name => (skinMeta && skinMeta.anims && skinMeta.anims[name]) || meta.anims[name]
    const facingOf = name => (skinMeta && skinMeta.facing && skinMeta.facing[name]) || meta.facing[name]
    const now = o.now || Date.now()
    const facingRight = Math.cos(o.angle || 0) >= 0

    let img = set.walk
    let a = animOf('walk')
    let sheetFacing = facingOf('walk')
    let fi = 0

    if (o.mode === 'dead' && set.dead && set.dead.complete && set.dead.naturalWidth) {
      img = set.dead; a = animOf('dead'); sheetFacing = facingOf('dead')
      const t = o.deadElapsed != null ? o.deadElapsed : 9999
      fi = Math.min(a.frames - 1, Math.floor(t / (1000 / a.fps)))
    } else if (o.mode === 'downed' && set.dead && set.dead.complete && set.dead.naturalWidth) {
      img = set.dead; a = animOf('dead'); sheetFacing = facingOf('dead')
      fi = a.downedFrame != null ? a.downedFrame : 3
    } else if (o.mode === 'slide' && set.slide && set.slide.complete && set.slide.naturalWidth) {
      img = set.slide; a = animOf('slide'); sheetFacing = facingOf('slide')
      const base = a.slideBase != null ? a.slideBase : 5
      const count = a.slideCount != null ? a.slideCount : (a.frames - base)
      fi = base + Math.min(count - 1, Math.floor((o.dashT || 0) * count))
    } else if (o.shooting && set.shoot && set.shoot.complete && set.shoot.naturalWidth) {
      img = set.shoot; a = animOf('shoot'); sheetFacing = facingOf('shoot')
      const fb = a.fireBase != null ? a.fireBase : 3
      const fl = a.fireLoop != null ? a.fireLoop : 3
      fi = fb + Math.floor((now / (1000 / a.fps)) % fl)
    } else if (o.moving) {
      fi = Math.floor(now / (1000 / a.fps)) % a.frames
    }
    fi = Math.min(fi, a.frames - 1)

    const cw = a.cw || meta.cell.w
    const ch = a.ch || meta.cell.h
    const sx = Math.round((fi % a.cols) * cw) + (a.sx || 0)
    const sy = (a.sy || 0) + Math.floor(fi / a.cols) * ch

    const drawH = o.rad * 3.0
    const drawW = drawH * (cw / ch)
    const footY = o.rad * 0.95
    const mirror = sheetFacing === 'left' ? facingRight : !facingRight

    ctx.save()
    if (o.mode === 'dead' || o.mode === 'downed') { ctx.globalAlpha = o.mode === 'dead' ? 0.95 : 1 }
    if (mirror) { ctx.scale(-1, 1) }
    ctx.drawImage(img, sx, sy, cw, ch, -drawW / 2, -drawH + footY, drawW, drawH)
    ctx.restore()

    if (o.flashing) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = 'rgba(255,70,70,0.28)'
      ctx.beginPath()
      ctx.ellipse(0, -drawH * 0.35, drawW * 0.4, drawH * 0.42, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  },

  _drawSurvivorVector (ctx, { rad, angle, step, flashing, female }) {
    const P = female
      ? { jacket: '#a83232', jacketD: '#7a2222', pack: '#5a4a30' }
      : { jacket: '#5a5f3a', jacketD: '#3f4428', pack: '#6b5335' }
    const skin = flashing ? '#ffcaca' : '#d9a97e'
    const hair = female ? '#b5824a' : '#2e241c'
    const s = rad / 15

    ctx.save()
    ctx.rotate(angle)
    const bob = step ? step * 0.8 * s : 0
    ctx.translate(0, bob)

    ctx.fillStyle = flashing ? '#e0b0b0' : P.pack
    ctx.fillRect(-13 * s, -7 * s, 7 * s, 14 * s)
    ctx.fillStyle = shade(P.pack, 0.7)
    ctx.fillRect(-13 * s, -2 * s, 7 * s, 4 * s)

    ctx.fillStyle = flashing ? '#ff9090' : '#23262d'
    ctx.fillRect(2 * s, -2.3 * s, 20 * s, 4.6 * s)
    ctx.fillStyle = flashing ? '#ffb0b0' : '#3a3f49'
    ctx.fillRect(1 * s, -3.5 * s, 6 * s, 7 * s)
    ctx.fillRect(-3 * s, -2 * s, 5 * s, 4 * s)

    ctx.fillStyle = flashing ? '#ff6b6b' : P.jacket
    ctx.beginPath()
    ctx.ellipse(0, 0, 10 * s, 8.5 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = flashing ? '#e05555' : P.jacketD
    ctx.fillRect(-2 * s, -8 * s, 4 * s, 16 * s)

    ctx.fillStyle = flashing ? '#ff8080' : P.jacketD
    ctx.fillRect(2 * s, -5 * s, 8 * s, 3 * s)
    ctx.fillRect(2 * s, 2 * s, 8 * s, 3 * s)
    ctx.fillStyle = skin
    ctx.fillRect(9 * s, -4 * s, 3 * s, 2.5 * s)
    ctx.fillRect(9 * s, 2 * s, 3 * s, 2.5 * s)

    ctx.fillStyle = skin
    ctx.beginPath(); ctx.arc(3 * s, 0, 5 * s, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = flashing ? '#ffdede' : hair
    ctx.beginPath(); ctx.arc(0.5 * s, 0, 5.4 * s, 0, Math.PI * 2); ctx.fill()
    if (female) {
      ctx.fillStyle = hair
      ctx.fillRect(-6 * s, -2.5 * s, 5 * s, 5 * s)
    }

    ctx.restore()
  },

  _drawPlayers (ctx, players, myId, now, shootFx, deathFx) {
    const wallNow = Date.now()
    for (const p of players) {
      const color = p.color || '#7c6ff5'
      const rad = p.radius || 18
      const female = p.skin === 'f'
      const useSprite = this.heroReady(female)

      if (!p.alive && !p.downed) {
        if (useSprite) {
          ctx.save()
          ctx.translate(Math.round(p.x), Math.round(p.y))
          this._drawHeroSprite(ctx, {
            rad,
            angle: p.angle,
            female,
            mode: 'dead',
            deadElapsed: deathFx && deathFx[p.id] ? wallNow - deathFx[p.id] : null
          })
          ctx.restore()
        } else {
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
        }
        continue
      }

      if (p.downed) {
        ctx.save()
        ctx.translate(Math.round(p.x), Math.round(p.y))
        ctx.beginPath()
        ctx.ellipse(0, rad * 0.5, rad * 1.4, rad * 0.7, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(80,14,14,0.32)'
        ctx.fill()
        if (useSprite) {
          this._drawHeroSprite(ctx, { rad, angle: p.angle, female, mode: 'downed' })
        } else {
          ctx.beginPath()
          ctx.ellipse(0, 0, rad * 0.95, rad * 0.6, p.angle, 0, Math.PI * 2)
          ctx.fillStyle = `${color}88`
          ctx.strokeStyle = '#ff5050'
          ctx.lineWidth = 1.5
          ctx.fill()
          ctx.stroke()
        }
        if (p.reviveProgress > 0) {
          ctx.beginPath()
          ctx.arc(0, 0, rad + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.reviveProgress)
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
      const dashing = (p.dashT || 0) > 0
      const moving = Math.hypot(p.vx || 0, p.vy || 0) > 6
      const shooting = !dashing && !p.reloading && (shootFx[p.id] || 0) > wallNow
      const step = moving ? Math.round(Math.sin(now / 90)) : 0

      ctx.save()
      ctx.translate(Math.round(p.x), Math.round(p.y))

      ctx.beginPath()
      ctx.ellipse(0, rad * 0.7, rad * 0.9, rad * 0.34, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.32)'
      ctx.fill()

      if (dashing) {
        const dir = Math.atan2(p.vy || 0, p.vx || 0)
        ctx.save()
        ctx.rotate(dir)
        const g = ctx.createLinearGradient(-rad * 2.6, 0, rad * 0.6, 0)
        g.addColorStop(0, 'rgba(220,230,240,0)')
        g.addColorStop(1, 'rgba(220,230,240,0.28)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(-rad * 0.9, rad * 0.55, rad * 2.2, rad * 0.42, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

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
        moving,
        shooting,
        flashing,
        female: p.skin === 'f',
        ring: isMe ? color : null,
        now,
        mode: dashing ? 'slide' : undefined,
        dashT: p.dashT || 0
      })

      ctx.restore()

      ctx.font = isMe ? 'bold 11px Share Tech Mono, monospace' : '10px Share Tech Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = isMe ? '#fff' : 'rgba(255,255,255,0.55)'
      ctx.fillText(p.username, p.x, p.y - rad - 8)

      const barW = 38
      const bx = p.x - barW / 2
      const by = p.y + rad + 6
      const hpPct = p.hp / p.maxHp
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(bx - 1, by - 1, barW + 2, 6)
      ctx.fillStyle = hpPct > 0.5 ? '#00ff50' : hpPct > 0.25 ? '#ffcc00' : '#ff4040'
      ctx.fillRect(bx, by, barW * Math.max(0, hpPct), 4)

      if (p.reloading) {
        const prog = p.reloadStart
          ? Math.max(0, Math.min(1, (wallNow - p.reloadStart) / (p.reloadMs || 1600)))
          : ((now / (p.reloadMs || 1600)) % 1)
        ctx.beginPath()
        ctx.arc(p.x, p.y, rad + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog)
        ctx.strokeStyle = '#ffcc40'
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }
  }
}
