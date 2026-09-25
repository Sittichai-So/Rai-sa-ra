const DELAY_MS = 100
const MAX_EXTRAPOLATE_MS = 120
const SNAP_DISTANCE = 220
const BUFFER_SIZE = 12
const OFFSET_DRIFT_PER_SNAPSHOT = 0.05

function lerpAngle (a, b, k) {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) { d -= Math.PI * 2 }
  if (d < -Math.PI) { d += Math.PI * 2 }
  return a + d * k
}

function blend (from, to, k) {
  if (!from) { return to }
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (dx * dx + dy * dy > SNAP_DISTANCE * SNAP_DISTANCE) { return to }
  return {
    ...to,
    x: from.x + dx * k,
    y: from.y + dy * k,
    angle: lerpAngle(from.angle || 0, to.angle || 0, Math.min(1, k))
  }
}

function indexById (list) {
  const map = new Map()
  for (const item of list) { map.set(item.id, item) }
  return map
}

export default class Interpolator {
  constructor ({ delay = DELAY_MS } = {}) {
    this.delay = delay
    this.snaps = []
    this.offset = null
  }

  reset () {
    this.snaps = []
    this.offset = null
  }

  push (serverTime, state, clientNow = Date.now()) {
    const t = typeof serverTime === 'number' ? serverTime : clientNow
    const diff = clientNow - t
    this.offset = this.offset == null ? diff : Math.min(this.offset + OFFSET_DRIFT_PER_SNAPSHOT, diff)
    const last = this.snaps[this.snaps.length - 1]
    if (last && t <= last.t) { return }
    this.snaps.push({
      t,
      players: state.players,
      zombies: state.zombies,
      bullets: state.bullets,
      playerIndex: indexById(state.players),
      zombieIndex: indexById(state.zombies)
    })
    if (this.snaps.length > BUFFER_SIZE) { this.snaps.shift() }
  }

  sample (clientNow = Date.now()) {
    const snaps = this.snaps
    if (!snaps.length) { return null }
    const renderTime = clientNow - this.offset - this.delay
    const newest = snaps[snaps.length - 1]

    if (snaps.length === 1 || renderTime <= snaps[0].t) {
      const only = renderTime <= snaps[0].t ? snaps[0] : newest
      return { players: only.players, zombies: only.zombies, bullets: only.bullets }
    }

    let a
    let b
    let k
    if (renderTime >= newest.t) {
      a = snaps[snaps.length - 2]
      b = newest
      const span = b.t - a.t
      k = 1 + Math.min(renderTime - b.t, MAX_EXTRAPOLATE_MS) / span
    } else {
      let i = snaps.length - 1
      while (i > 0 && snaps[i - 1].t > renderTime) { i-- }
      a = snaps[i - 1]
      b = snaps[i]
      k = (renderTime - a.t) / (b.t - a.t)
    }

    const base = renderTime >= b.t ? b : a
    const bulletDt = Math.min(renderTime - base.t, MAX_EXTRAPOLATE_MS) / 1000
    return {
      players: b.players.map(p => blend(a.playerIndex.get(p.id), p, k)),
      zombies: b.zombies.map(z => blend(a.zombieIndex.get(z.id), z, k)),
      bullets: base.bullets.map(bl => ({ ...bl, x: bl.x + bl.vx * bulletDt, y: bl.y + bl.vy * bulletDt }))
    }
  }
}
