import { ZOMBIE_STYLE, BOSS_CHARGE_LEN } from './constants.js'

export const zombieMethods = {
  _drawTelegraphs (ctx, zombies, now) {
    for (const z of zombies) {
      if (!z.state) { continue }
      const k = z.stateProgress || 0
      const blink = 0.55 + Math.sin(now / 45) * 0.45
      if (z.state === 'armed') {
        const r = z.blastRadius || 110
        ctx.beginPath()
        ctx.arc(z.x, z.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,70,20,${0.08 + k * 0.14})`
        ctx.fill()
        ctx.strokeStyle = `rgba(255,90,30,${0.35 + blink * 0.4})`
        ctx.lineWidth = 2
        ctx.setLineDash([8, 6])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.arc(z.x, z.y, r * k, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,120,40,0.16)'
        ctx.fill()
      } else if (z.state === 'slam_wind') {
        const r = z.slamRadius || 150
        ctx.beginPath()
        ctx.arc(z.x, z.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,40,20,${0.06 + k * 0.12})`
        ctx.fill()
        ctx.strokeStyle = `rgba(255,60,30,${0.45 + blink * 0.4})`
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(z.x, z.y, r * k, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,200,80,0.8)'
        ctx.lineWidth = 2
        ctx.stroke()
      } else if (z.state === 'charge_wind' || z.state === 'charging') {
        const a = z.chargeAngle != null ? z.chargeAngle : z.angle
        const zr = z.radius || 52
        const w = zr * 1.7
        const len = z.state === 'charge_wind' ? BOSS_CHARGE_LEN + zr : BOSS_CHARGE_LEN * (1 - k) + zr
        ctx.save()
        ctx.translate(z.x, z.y)
        ctx.rotate(a)
        ctx.fillStyle = z.state === 'charge_wind'
          ? `rgba(255,40,20,${0.1 + k * 0.18})`
          : 'rgba(255,90,40,0.18)'
        ctx.fillRect(0, -w / 2, len, w)
        ctx.strokeStyle = `rgba(255,60,30,${0.4 + blink * 0.45})`
        ctx.lineWidth = 2
        ctx.strokeRect(0, -w / 2, len, w)
        if (z.state === 'charge_wind') {
          ctx.fillStyle = 'rgba(255,200,80,0.35)'
          ctx.fillRect(0, -w / 2, len * k, w)
        }
        ctx.restore()
      }
    }
  },

  _drawZombies (ctx, zombies, now) {
    for (const z of zombies) {
      const style = ZOMBIE_STYLE[z.type] || ZOMBIE_STYLE.normal
      const rad = z.radius || style.radius
      const hpPct = z.maxHp ? z.hp / z.maxHp : 1
      const flashing = z.hitFlash > 0
      const bob = Math.round(Math.sin(now / 130 + z.id * 1.7) * 2)

      ctx.save()
      ctx.translate(Math.round(z.x), Math.round(z.y))

      ctx.beginPath()
      ctx.ellipse(0, rad * 0.55, rad * 0.85, rad * 0.35, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fill()

      if (z.type === 'boss') {
        const pulse = 1 + Math.sin(now / (z.enraged ? 90 : 200)) * (z.enraged ? 0.1 : 0.06)
        ctx.beginPath()
        ctx.arc(0, 0, rad * (z.enraged ? 1.45 : 1.3) * pulse, 0, Math.PI * 2)
        ctx.fillStyle = z.enraged ? 'rgba(255,110,20,0.26)' : 'rgba(255,32,32,0.13)'
        ctx.fill()
        if (z.state === 'charging') {
          const a = z.chargeAngle != null ? z.chargeAngle : z.angle
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath()
            ctx.arc(-Math.cos(a) * rad * 0.7 * i, -Math.sin(a) * rad * 0.7 * i, rad * (1 - i * 0.18), 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255,60,30,${0.22 - i * 0.05})`
            ctx.fill()
          }
        }
      } else if (z.type === 'bomber') {
        const armed = z.state === 'armed'
        const pulse = 1 + Math.sin(now / (armed ? 50 : 240) + z.id) * (armed ? 0.16 : 0.07)
        ctx.beginPath()
        ctx.arc(0, 0, rad * 1.28 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = armed ? 'rgba(255,90,20,0.32)' : 'rgba(170,255,60,0.16)'
        ctx.fill()
      } else if (z.elite) {
        const pulse = 1 + Math.sin(now / 160 + z.id) * 0.09
        ctx.beginPath()
        ctx.arc(0, 0, rad * 1.24 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,180,40,0.18)'
        ctx.fill()
      }

      const fuseBlink = z.state === 'armed' && Math.sin(now / Math.max(25, 90 - (z.stateProgress || 0) * 65)) > 0
      const rageTint = z.type === 'boss' && z.enraged && Math.sin(now / 120) > 0.2
      const base = flashing || fuseBlink ? '#ffffff' : (rageTint ? '#e0401a' : style.color)
      const dark = flashing || fuseBlink ? '#dddddd' : style.dark
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

      if (z.type === 'bomber' && !flashing && !fuseBlink) {
        ctx.fillStyle = '#e8ff9a'
        const spots = [[-0.45, -0.3], [0.35, 0.4], [-0.15, 0.5], [0.5, -0.35]]
        for (const [px, py] of spots) {
          ctx.fillRect(Math.round(px * rad) - u / 2, Math.round(py * rad) + bob - u / 2, u, u)
        }
      }

      if (z.type === 'boss' && !flashing) {
        ctx.fillStyle = z.enraged ? '#ffcc40' : '#e8e0d0'
        const hx = Math.cos(z.angle)
        const hy = Math.sin(z.angle)
        for (const side of [-1, 1]) {
          const bx = Math.round(hx * rad * 0.15 - hy * side * rad * 0.62)
          const by = Math.round(hy * rad * 0.15 + hx * side * rad * 0.62) + bob
          ctx.fillRect(bx - u, by - u, u * 2, u * 2)
          ctx.fillRect(Math.round(bx + hx * u * 1.5) - u / 2, Math.round(by + hy * u * 1.5) - u / 2, u, u)
        }
      }

      const ex = Math.round(Math.cos(z.angle) * rad * 0.4)
      const ey = Math.round(Math.sin(z.angle) * rad * 0.4) + bob
      const perpX = Math.round(-Math.sin(z.angle) * rad * 0.28)
      const perpY = Math.round(Math.cos(z.angle) * rad * 0.28)
      ctx.fillStyle = flashing ? '#000' : (z.type === 'spitter' ? '#d8ccff' : z.type === 'bomber' ? '#fff27a' : (z.type === 'boss' && z.enraged ? '#ffe040' : '#ff2020'))
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
}
