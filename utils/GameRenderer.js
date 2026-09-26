import { mapMethods } from './render/map.js'
import { effectMethods } from './render/effects.js'
import { zombieMethods } from './render/zombies.js'
import { playerMethods } from './render/players.js'
import { objectMethods } from './render/objects.js'
import { minimapMethods } from './render/minimap.js'

export default class GameRenderer {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    this.map = null
    this.mapCanvas = null
    this.particles = []
    this.floaters = []
    this.decals = []
    this.rings = []
    this.shakeAmt = 0
    this.hero = null
    this.heroMeta = null
    this._last = (typeof performance !== 'undefined' ? performance.now() : Date.now())
  }

  draw ({ players, zombies, bullets, projectiles, pickups, barrels, shootFx, deathFx, myId, camX, camY, mapW, mapH, showMinimap = true }) {
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
    this._drawBarrels(ctx, barrels || [], now)
    this._drawPickups(ctx, pickups || [], now)
    this._drawBullets(ctx, bullets)
    this._drawTelegraphs(ctx, zombies, now)
    this._drawProjectiles(ctx, projectiles || [])
    this._drawZombies(ctx, zombies, now)
    this._drawPlayers(ctx, players, myId, now, shootFx || {}, deathFx || {})
    this._drawRings(ctx)
    this._drawParticles(ctx)
    this._drawFloaters(ctx)

    ctx.restore()

    if (showMinimap) {
      this._drawMinimap(ctx, players, zombies, barrels || [], myId, camX, camY, W, H, mapW, mapH)
    }
  }
}

Object.assign(
  GameRenderer.prototype,
  mapMethods,
  effectMethods,
  zombieMethods,
  playerMethods,
  objectMethods,
  minimapMethods
)
