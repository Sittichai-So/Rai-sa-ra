import { TILE_COL } from './constants.js'

export const mapMethods = {
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

    c.fillStyle = 'rgba(220,200,90,0.5)'
    for (let y = 0; y < map.h; y += 64) { c.fillRect(map.w / 2 - 3, y + 14, 6, 30) }
    for (let x = 0; x < map.w; x += 64) { c.fillRect(x + 14, map.h / 2 - 3, 30, 6) }

    for (const p of map.props || []) {
      if (p.type !== 'barrel') { this._drawProp(c, p) }
    }

    this.mapCanvas = cv
  },

  _drawProp (c, p) {
    c.save()
    c.translate(p.x, p.y)
    const w = p.w || (p.r ? p.r * 2 : 40)
    const h = p.h || (p.r ? p.r * 2 : 40)
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
    } else {
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
}
