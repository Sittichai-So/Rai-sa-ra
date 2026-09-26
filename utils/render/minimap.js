export const minimapMethods = {
  _drawMinimap (ctx, players, zombies, barrels, myId, camX, camY, W, H, mapW, mapH) {
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
        if (pr.type === 'barrel') { continue }
        const w = pr.w || (pr.r ? pr.r * 2 : 30)
        const h = pr.h || (pr.r ? pr.r * 2 : 30)
        ctx.fillRect(mmX + (pr.x - w / 2) * scX, mmY + (pr.y - h / 2) * scY, Math.max(1, w * scX), Math.max(1, h * scY))
      }
    }

    ctx.fillStyle = '#ff7a30'
    for (const b of barrels) {
      ctx.fillRect(mmX + b.x * scX - 1.5, mmY + b.y * scY - 1.5, 3, 3)
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
        ctx.fillStyle = z.type === 'spitter' ? '#9d6bff' : z.type === 'bomber' ? '#b6ff40' : '#ff4020'
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
