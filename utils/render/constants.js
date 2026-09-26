export const ZOMBIE_STYLE = {
  normal: { color: '#7f9a3c', dark: '#5c722a', radius: 20 },
  runner: { color: '#cf4fb2', dark: '#993380', radius: 15 },
  tank: { color: '#4c7d5c', dark: '#335740', radius: 31 },
  spitter: { color: '#6b4fd0', dark: '#4a3597', radius: 18 },
  bomber: { color: '#9be03c', dark: '#5f9420', radius: 18 },
  boss: { color: '#b52323', dark: '#7d1414', radius: 52 }
}

export const BLOOD = ['#8a1f1f', '#a82727', '#6d1616']

export const BOSS_CHARGE_LEN = 290

export const BLAST_COLORS = {
  bomber: ['#ffec70', '#ff9a20', '#ff4a10', '#9be03c'],
  bomber_shot: ['#ffec70', '#ffb030', '#9be03c', '#d8ff90'],
  slam: ['#c9a27a', '#8a6a4a', '#ff5030', '#e8d4b0'],
  barrel: ['#fff2a0', '#ffb030', '#ff5a10', '#d02a0a']
}

export function shade (hex, f) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)))
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)))
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)))
  return `rgb(${r},${g},${b})`
}

export const TILE_COL = {
  a: '#22242a',
  s: '#2f3138',
  g: '#1f3020',
  d: '#2e2820'
}
