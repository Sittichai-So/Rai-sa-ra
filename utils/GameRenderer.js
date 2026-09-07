/* eslint-disable no-unused-vars */

// eslint-disable-next-line no-unused-vars
const MAP_W = 1600
const MAP_H = 1200
const TILE = 40

const ZOMBIE_STYLE = {
  normal: { color: '#7f9a3c', radius: 20 },
  runner: { color: '#cf4fb2', radius: 15 },
  tank: { color: '#4c7d5c', radius: 31 },
  spitter: { color: '#6b4fd0', radius: 18 },
  boss: { color: '#b52323', radius: 52 }
}

export default class GameRenderer {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this._buildMapPattern()
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
    this.mapPatternCanvas = off
  }

  draw ({ players, zombies, bullets, projectiles, myId, camX, camY, mapW, mapH }) {
    const ctx = this.ctx
    const W = this.canvas.width
    const H = this.canvas.height

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#080c10'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(-Math.round(camX), -Math.round(camY))

    ctx.fillStyle = this.mapPattern
    ctx.fillRect(0, 0, mapW, mapH)

    ctx.strokeStyle = 'rgba(0,255,80,0.25)'
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, mapW, mapH)

    ctx.strokeStyle = 'rgba(255,40,40,0.15)'
    ctx.lineWidth = 20
    ctx.strokeRect(10, 10, mapW - 20, mapH - 20)

    this._drawBullets(ctx, bullets)

    this._drawProjectiles(ctx, projectiles || [])

    this._drawZombies(ctx, zombies)

    this._drawPlayers(ctx, players, myId)

    ctx.restore()

    this._drawMinimap(ctx, players, zombies, myId, camX, camY, W, H, mapW, mapH)
  }

  _drawBullets (ctx, bullets) {
    ctx.save()
    for (const b of bullets) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2)
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
      ctx.shadowBlur = 10
      ctx.fill()
    }
    ctx.shadowBlur = 0
    ctx.restore()
  }

  _drawZombies (ctx, zombies) {
    for (const z of zombies) {
      const style = ZOMBIE_STYLE[z.type] || ZOMBIE_STYLE.normal
      const rad = z.radius || style.radius
      const hpPct = z.maxHp ? z.hp / z.maxHp : 1
      const flashing = z.hitFlash > 0

      ctx.save()
      ctx.translate(z.x, z.y)
      ctx.rotate(z.angle + Math.PI / 2)

      ctx.beginPath()
      ctx.arc(0, 0, rad, 0, Math.PI * 2)
      ctx.fillStyle = flashing ? '#ffffff' : style.color
      ctx.strokeStyle = z.type === 'boss' ? '#ff5050' : 'rgba(0,0,0,0.5)'
      ctx.lineWidth = z.type === 'boss' ? 3 : 1.5
      ctx.fill()
      ctx.stroke()

      const eyeOff = rad * 0.34
      ctx.fillStyle = flashing ? '#000' : '#ff2020'
      ctx.shadowColor = '#ff2020'
      ctx.shadowBlur = 4
      ctx.beginPath(); ctx.arc(-eyeOff, -rad * 0.4, rad * 0.16, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(eyeOff, -rad * 0.4, rad * 0.16, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0

      ctx.restore()

      const barW = Math.max(30, rad * 1.9)
      const barH = z.type === 'boss' ? 6 : 4
      const bx = z.x - barW / 2
      const by = z.y - rad - 10
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(bx, by, barW, barH)
      ctx.fillStyle = hpPct > 0.5 ? '#40ff40' : hpPct > 0.25 ? '#ffcc00' : '#ff4040'
      ctx.fillRect(bx, by, barW * hpPct, barH)
    }
  }

  _drawPlayers (ctx, players, myId) {
    for (const p of players) {
      if (!p.alive) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.globalAlpha = 0.3
        ctx.fillStyle = '#888'
        ctx.font = '22px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('☠', 0, 0)
        ctx.restore()
        continue
      }

      ctx.save()
      ctx.translate(p.x, p.y)

      const isMe = p.id === myId
      const color = p.color || '#7c6ff5'
      const rad = p.radius || 18
      const flashing = p.hitFlash > 0

      if (isMe) {
        ctx.beginPath()
        ctx.arc(0, 0, rad + 6, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.3
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      ctx.beginPath()
      ctx.arc(0, 0, rad, 0, Math.PI * 2)
      ctx.fillStyle = flashing ? '#ff6b6b' : (isMe ? color : `${color}cc`)
      ctx.strokeStyle = isMe ? '#fff' : color
      ctx.lineWidth = isMe ? 2 : 1
      ctx.fill()
      ctx.stroke()

      ctx.save()
      ctx.rotate(p.angle)
      ctx.fillStyle = isMe ? '#fff' : color
      ctx.fillRect(rad - 4, -3, 12, 6)
      ctx.restore()

      ctx.font = isMe ? 'bold 11px Share Tech Mono, monospace' : '10px Share Tech Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = isMe ? '#fff' : 'rgba(255,255,255,0.6)'
      ctx.fillText(p.username, 0, -22)

      ctx.restore()

      const barW = 36
      const barH = 4
      const bx = p.x - barW / 2
      const by = p.y + 22
      const hpPct = p.hp / p.maxHp
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(bx, by, barW, barH)
      ctx.fillStyle = hpPct > 0.5 ? '#00ff50' : hpPct > 0.25 ? '#ffcc00' : '#ff4040'
      ctx.fillRect(bx, by, barW * hpPct, barH)
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
    ctx.strokeRect(
      mmX + camX * scX,
      mmY + camY * scY,
      cvW * scX,
      cvH * scY
    )

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
      ctx.fillStyle = p.alive ? (p.id === myId ? '#fff' : p.color) : '#555'
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
