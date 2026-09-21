import diceSfx from '~/assets/sounds/rpg/dice.mp3'
import eventSfx from '~/assets/sounds/rpg/event.mp3'
import clickSfx from '~/assets/sounds/rpg/click.mp3'
import treasureSfx from '~/assets/sounds/rpg/treasure.mp3'
import damageSfx from '~/assets/sounds/rpg/damage.mp3'
import victorySfx from '~/assets/sounds/rpg/victory.mp3'
import hitSfx from '~/assets/sounds/rpg/hit.mp3'
import successSfx from '~/assets/sounds/rpg/success.mp3'
import levelupSfx from '~/assets/sounds/rpg/levelup.mp3'
import gameoverSfx from '~/assets/sounds/rpg/gameover.mp3'
import villageMusic from '~/assets/sounds/rpg/music/village.mp3'
import forestMusic from '~/assets/sounds/rpg/music/forest.mp3'
import valleyMusic from '~/assets/sounds/rpg/music/valley.mp3'
import dungeonMusic from '~/assets/sounds/rpg/music/dungeon.mp3'
import fightMusic from '~/assets/sounds/rpg/music/fight.mp3'

const SOUND_FILES = {
  dice: diceSfx,
  event: eventSfx,
  click: clickSfx,
  treasure: treasureSfx,
  damage: damageSfx,
  victory: victorySfx,
  hit: hitSfx,
  success: successSfx,
  levelup: levelupSfx,
  gameover: gameoverSfx
}

const MUSIC_FILES = { village: villageMusic, forest: forestMusic, valley: valleyMusic, dungeon: dungeonMusic, fight: fightMusic }

const MUSIC_GAIN = 0.4
const FADE_STEP = 0.04
const FADE_INTERVAL_MS = 50

const music = { cache: {}, current: null, wanted: null, settings: null, waitingForGesture: false }

export function loadSoundSettings () {
  const settings = { muted: false, volume: 50 }
  try { settings.muted = localStorage.getItem('rpgSoundMuted') === '1' } catch (e) {}
  try {
    const v = parseInt(localStorage.getItem('rpgSoundVolume'), 10)
    if (!isNaN(v)) { settings.volume = Math.max(0, Math.min(100, v)) }
  } catch (e) {}
  return settings
}

export function saveSoundSettings (settings) {
  try { localStorage.setItem('rpgSoundMuted', settings.muted ? '1' : '0') } catch (e) {}
  try { localStorage.setItem('rpgSoundVolume', String(settings.volume)) } catch (e) {}
}

export function playSound (name, settings) {
  if (settings.muted) { return }
  const src = SOUND_FILES[name]
  if (!src) { return }
  const audio = new Audio(src)
  audio.volume = settings.volume / 100
  audio.play().catch(() => {})
}

function musicLevel (settings) {
  return (settings.volume / 100) * MUSIC_GAIN
}

function fade (audio, target, done) {
  clearInterval(audio.fadeTimer)
  audio.fadeTimer = setInterval(() => {
    const diff = target - audio.volume
    if (Math.abs(diff) <= FADE_STEP) {
      audio.volume = Math.max(0, Math.min(1, target))
      clearInterval(audio.fadeTimer)
      if (done) { done() }
      return
    }
    audio.volume = Math.max(0, Math.min(1, audio.volume + (diff > 0 ? FADE_STEP : -FADE_STEP)))
  }, FADE_INTERVAL_MS)
}

function waitForGesture () {
  if (music.waitingForGesture || typeof window === 'undefined') { return }
  music.waitingForGesture = true
  const resume = () => {
    window.removeEventListener('pointerdown', resume)
    window.removeEventListener('keydown', resume)
    music.waitingForGesture = false
    if (music.current && music.settings && !music.settings.muted) { tryPlay(music.current) }
  }
  window.addEventListener('pointerdown', resume)
  window.addEventListener('keydown', resume)
}

function tryPlay (audio) {
  const attempt = audio.play()
  if (attempt && attempt.catch) { attempt.catch(() => waitForGesture()) }
}

function trackFor (name) {
  if (music.cache[name]) { return music.cache[name] }
  const src = MUSIC_FILES[name]
  if (!src) { return null }
  const audio = new Audio(src)
  audio.loop = true
  audio.volume = 0
  audio.preload = 'auto'
  music.cache[name] = audio
  return audio
}

export function playMusic (name, settings) {
  music.settings = settings
  music.wanted = name
  const next = trackFor(name)
  if (music.current === next) {
    syncMusic(settings)
    return
  }
  const previous = music.current
  music.current = next
  if (previous) { fade(previous, 0, () => previous.pause()) }
  if (next && !settings.muted) {
    tryPlay(next)
    fade(next, musicLevel(settings))
  }
}

export function syncMusic (settings) {
  music.settings = settings
  const audio = music.current
  if (!audio) { return }
  if (settings.muted) {
    fade(audio, 0, () => audio.pause())
    return
  }
  if (audio.paused) { tryPlay(audio) }
  fade(audio, musicLevel(settings))
}

export function stopMusic () {
  const audios = Object.keys(music.cache).map(key => music.cache[key])
  music.cache = {}
  music.current = null
  music.wanted = null
  audios.forEach(audio => fade(audio, 0, () => audio.pause()))
}
