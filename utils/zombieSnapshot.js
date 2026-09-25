export const ZOMBIE_TYPE_CODES = ['normal', 'runner', 'tank', 'spitter', 'bomber', 'boss']
export const ZOMBIE_STATE_CODES = [null, 'armed', 'charge_wind', 'charging', 'slam_wind']
export const PICKUP_TYPE_CODES = ['health', 'ammo']

export function createSnapshotDecoder () {
  const roster = new Map()
  let scores = []

  function player (row, now) {
    const [id, x, y, vx, vy, angle, hp, maxHp, flags, reviveProgress, dashT, hitFlash,
      ammo, magSize, reloadMs, reloadAgo, downedAgo, lastAttackTime, score, kills] = row
    const info = roster.get(id) || []
    return {
      id,
      username: info[1] || '',
      color: info[2] || '#7c6ff5',
      skin: info[3] || 'm',
      radius: info[4] || 18,
      x,
      y,
      vx,
      vy,
      angle,
      hp,
      maxHp,
      alive: !!(flags & 1),
      downed: !!(flags & 2),
      reloading: !!(flags & 4),
      reviveProgress,
      dashT,
      hitFlash,
      ammo,
      magSize,
      reloadMs,
      reloadStart: (flags & 4) ? now - reloadAgo : 0,
      downedAt: (flags & 2) ? now - downedAgo : 0,
      lastAttackTime,
      score,
      kills
    }
  }

  function zombie (row) {
    const [id, type, x, y, angle, hp, maxHp, radius, flags, hitFlash, state, stateProgress, extra, chargeAngle] = row
    const typeName = ZOMBIE_TYPE_CODES[type] || 'normal'
    const z = {
      id,
      type: typeName,
      x,
      y,
      angle,
      hp,
      maxHp,
      radius,
      elite: !!(flags & 1),
      enraged: !!(flags & 2),
      hitFlash,
      state: ZOMBIE_STATE_CODES[state] || null,
      stateProgress
    }
    if (typeName === 'boss') {
      z.slamRadius = extra
      if (chargeAngle != null) { z.chargeAngle = chargeAngle }
    } else if (extra) {
      z.blastRadius = extra
    }
    return z
  }

  function bullets (flat) {
    const out = []
    for (let i = 0; i + 3 < flat.length; i += 4) {
      out.push({ x: flat[i], y: flat[i + 1], vx: flat[i + 2], vy: flat[i + 3] })
    }
    return out
  }

  return function decode (msg, now = Date.now()) {
    if (msg.r) {
      roster.clear()
      for (const row of msg.r) { roster.set(row[0], row) }
    }
    if (msg.s) { scores = msg.s }
    return {
      players: (msg.p || []).map(row => player(row, now)),
      zombies: (msg.z || []).map(zombie),
      bullets: bullets(msg.b || []),
      projectiles: (msg.j || []).map(([x, y, radius, boss]) => ({ x, y, radius, boss: !!boss })),
      pickups: (msg.k || []).map(([id, type, x, y]) => ({ id, type: PICKUP_TYPE_CODES[type] || 'health', x, y })),
      wave: msg.w || 0,
      waveActive: !!msg.a,
      waveTimeLeft: msg.l,
      scores: msg.s ? scores : null
    }
  }
}
