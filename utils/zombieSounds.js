import shoot1 from '~/assets/sounds/zombie/shoot1.mp3'
import shoot2 from '~/assets/sounds/zombie/shoot2.mp3'
import reload from '~/assets/sounds/zombie/reload.mp3'
import groan1 from '~/assets/sounds/zombie/groan1.mp3'
import groan2 from '~/assets/sounds/zombie/groan2.mp3'
import groan3 from '~/assets/sounds/zombie/groan3.mp3'
import groan4 from '~/assets/sounds/zombie/groan4.mp3'
import growl from '~/assets/sounds/zombie/growl.mp3'
import roar from '~/assets/sounds/zombie/roar.mp3'
import screech from '~/assets/sounds/zombie/screech.mp3'
import die1 from '~/assets/sounds/zombie/die1.mp3'
import die2 from '~/assets/sounds/zombie/die2.mp3'
import explodeBig from '~/assets/sounds/zombie/explode-big.mp3'
import explodeSmall from '~/assets/sounds/zombie/explode-small.mp3'
import slam from '~/assets/sounds/zombie/slam.mp3'
import hurt from '~/assets/sounds/zombie/hurt.mp3'
import down from '~/assets/sounds/zombie/down.mp3'
import revive from '~/assets/sounds/zombie/revive.mp3'
import waveClear from '~/assets/sounds/zombie/wave-clear.mp3'
import waveStart from '~/assets/sounds/zombie/wave-start.mp3'
import fuse from '~/assets/sounds/zombie/fuse.mp3'
import pickupHealth from '~/assets/sounds/zombie/pickup-health.mp3'
import pickupAmmo from '~/assets/sounds/zombie/pickup-ammo.mp3'
import select from '~/assets/sounds/zombie/select.mp3'
import dash from '~/assets/sounds/zombie/dash.mp3'
import musicFight from '~/assets/sounds/zombie/music-fight.mp3'
import gameover from '~/assets/sounds/rpg/gameover.mp3'

export const ZOMBIE_SOUNDS = {
  shoot: [shoot1, shoot2],
  reload,
  groan: [groan1, groan2, groan3, groan4],
  growl,
  roar,
  screech,
  die: [die1, die2],
  explodeBig,
  explodeSmall,
  slam,
  hurt,
  down,
  revive,
  waveClear,
  waveStart,
  fuse,
  pickupHealth,
  pickupAmmo,
  select,
  dash,
  gameover
}

export const ZOMBIE_MUSIC = {
  fight: musicFight
}

const STORAGE_KEY = 'zombieAudio'
const DEFAULT_SETTINGS = { musicVol: 35, sfxVol: 70, muted: false }

const clampVol = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback
}

export function loadZombieAudioSettings () {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!raw || typeof raw !== 'object') { return { ...DEFAULT_SETTINGS } }
    return {
      musicVol: clampVol(raw.musicVol, DEFAULT_SETTINGS.musicVol),
      sfxVol: clampVol(raw.sfxVol, DEFAULT_SETTINGS.sfxVol),
      muted: !!raw.muted
    }
  } catch (e) {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveZombieAudioSettings ({ musicVol, sfxVol, muted }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ musicVol, sfxVol, muted: !!muted }))
  } catch (e) {}
}
