export const objectMethods = {
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
  },

  _drawProjectiles (ctx, projectiles) {
    ctx.save()
    for (const p of projectiles) {
      const c = p.boss ? '#ff4a6a' : '#9d6bff'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius || 7, 0, Math.PI * 2)
      ctx.fillStyle = c
      ctx.shadowColor = c
      ctx.shadowBlur = 12
      ctx.fill()
    }
    ctx.shadowBlur = 0
    ctx.restore()
  },

  _drawBarrels (ctx, barrels, now) {
    for (const b of barrels) {
      const r = b.r || 20
      const flash = b.hitFlash > 0
      const pct = b.maxHp ? b.hp / b.maxHp : 1
      ctx.save()
      ctx.translate(b.x, b.y)
      if (pct < 1) { ctx.translate(Math.sin(now / 30) * (1 - pct) * 1.5, 0) }

      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.beginPath(); ctx.arc(4, 6, r, 0, Math.PI * 2); ctx.fill()

      ctx.fillStyle = flash ? '#ffffff' : '#b0301c'
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = flash ? '#dddddd' : '#5a160c'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.arc(0, 0, r - 3, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.arc(0, 0, r - 9, 0, Math.PI * 2); ctx.stroke()

      if (!flash) {
        ctx.fillStyle = '#ffcc30'
        ctx.beginPath()
        ctx.moveTo(0, -8); ctx.lineTo(7.5, 5.5); ctx.lineTo(-7.5, 5.5)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#1a0a05'
        ctx.fillRect(-1, -3.5, 2, 5)
        ctx.fillRect(-1, 2.5, 2, 1.8)
      }
      ctx.restore()

      if (pct < 1) {
        const bw = r * 1.8
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(b.x - bw / 2 - 1, b.y - r - 11, bw + 2, 5)
        ctx.fillStyle = '#ff9a30'
        ctx.fillRect(b.x - bw / 2, b.y - r - 10, bw * pct, 3)
      }
    }
  },

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
}
