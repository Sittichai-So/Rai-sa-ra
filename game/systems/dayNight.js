const CYCLE_MS = 8 * 60 * 1000

function goldenFalloff (t, center) {
  return Math.max(0, 1 - Math.abs(t - center) / 0.07)
}

export function dayNightState (now = Date.now()) {
  const t = (now % CYCLE_MS) / CYCLE_MS
  const daylight = (Math.cos((t - 0.5) * 2 * Math.PI) + 1) / 2
  const nightAlpha = Math.max(0, (1 - daylight) - 0.15) / 0.85 * 0.5
  const goldenAlpha = Math.max(goldenFalloff(t, 0.12), goldenFalloff(t, 0.88)) * 0.22

  let phase = 'day'
  if (nightAlpha > 0.3) { phase = 'night' } else if (goldenAlpha > 0.05) { phase = t < 0.5 ? 'dawn' : 'dusk' }

  return { t, nightAlpha, goldenAlpha, phase }
}

export const PHASE_LABEL = { day: 'กลางวัน', dawn: 'รุ่งอรุณ', dusk: 'พลบค่ำ', night: 'กลางคืน' }
