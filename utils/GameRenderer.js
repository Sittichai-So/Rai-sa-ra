/* eslint-disable no-unused-vars */
// utils/GameRenderer.js
// Canvas 2D renderer — runs client-side at 60fps

// eslint-disable-next-line no-unused-vars
const MAP_W = 1600
const MAP_H = 1200
const TILE = 40

export default class GameRenderer {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this._buildMapPattern()
  }

  _buildMapPattern () {
    // Offscreen tile for background grid
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

  draw ({ players, zombies, bullets, myId, camX, camY, mapW, mapH }) {
    const ctx = this.ctx
    const W = this.canvas.width
    const H = this.canvas.height

    // Clear
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#080c10'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(-Math.round(camX), -Math.round(camY))

    // Map background
    ctx.fillStyle = this.mapPattern
    ctx.fillRect(0, 0, mapW, mapH)

    // Map border
    ctx.strokeStyle = 'rgba(0,255,80,0.25)'
    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, mapW, mapH)

    // Danger zone (red flash near edges)
    ctx.strokeStyle = 'rgba(255,40,40,0.15)'
    ctx.lineWidth = 20
    ctx.strokeRect(10, 10, mapW - 20, mapH - 20)

    // Bullets
    this._drawBullets(ctx, bullets)

    // Zombies
    this._drawZombies(ctx, zombies)

    // Players
    this._drawPlayers(ctx, players, myId)

    ctx.restore()

    // World coordinates minimap
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

  _drawZombies (ctx, zombies) {
    for (const z of zombies) {
      ctx.save()
      ctx.translate(z.x, z.y)
      ctx.rotate(z.angle + Math.PI / 2)

      // Body
      ctx.beginPath()
      ctx.arc(0, 0, 18, 0, Math.PI * 2)
      const hpPct = z.hp / z.maxHp
      const r = Math.round(200 - hpPct * 100)
      const g = Math.round(40 + hpPct * 80)
      ctx.fillStyle = `rgba(${r},${g},20,0.9)`
      ctx.strokeStyle = `rgba(255,${g},20,0.6)`
      ctx.lineWidth = 1.5
      ctx.fill()
      ctx.stroke()

      // Eyes
      ctx.fillStyle = '#ff2020'
      ctx.shadowColor = '#ff2020'
      ctx.shadowBlur = 4
      ctx.beginPath(); ctx.arc(-6, -8, 3, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(6, -8, 3, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0

      ctx.restore()

      // HP bar above zombie
      const barW = 36
      const barH = 4
      const bx = z.x - barW / 2
      const by = z.y - 28
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(bx, by, barW, barH)
      ctx.fillStyle = hpPct > 0.5 ? '#40ff40' : hpPct > 0.25 ? '#ffcc00' : '#ff4040'
      ctx.fillRect(bx, by, barW * hpPct, barH)
    }
  }

  _drawPlayers (ctx, players, myId) {
    for (const p of players) {
      if (!p.alive) {
        // Draw skull for dead player
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

      // Outer ring for local player
      if (isMe) {
        ctx.beginPath()
        ctx.arc(0, 0, 24, 0, Math.PI * 2)
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.3
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Body circle
      ctx.beginPath()
      ctx.arc(0, 0, 18, 0, Math.PI * 2)
      ctx.fillStyle = isMe ? p.color : `${p.color}cc`
      ctx.strokeStyle = isMe ? '#fff' : p.color
      ctx.lineWidth = isMe ? 2 : 1
      ctx.fill()
      ctx.stroke()

      // Gun direction indicator
      ctx.save()
      ctx.rotate(p.angle)
      ctx.fillStyle = isMe ? '#fff' : p.color
      ctx.fillRect(14, -3, 12, 6)
      ctx.restore()

      // Username
      ctx.font = isMe ? 'bold 11px Share Tech Mono, monospace' : '10px Share Tech Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = isMe ? '#fff' : 'rgba(255,255,255,0.6)'
      ctx.fillText(p.username, 0, -22)

      ctx.restore()

      // HP bar
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

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(mmX, mmY, mmW, mmH)
    ctx.strokeStyle = 'rgba(0,255,80,0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(mmX, mmY, mmW, mmH)

    // Viewport rect
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

    // Zombies
    ctx.fillStyle = '#ff4020'
    for (const z of zombies) {
      ctx.fillRect(mmX + z.x * scX - 1, mmY + z.y * scY - 1, 2, 2)
    }

    // Players
    for (const p of players) {
      ctx.fillStyle = p.alive ? (p.id === myId ? '#fff' : p.color) : '#555'
      ctx.beginPath()
      ctx.arc(mmX + p.x * scX, mmY + p.y * scY, p.id === myId ? 3 : 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Label
    ctx.fillStyle = 'rgba(0,255,80,0.4)'
    ctx.font = '9px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('MAP', mmX + 4, mmY + 10)
  }
}
