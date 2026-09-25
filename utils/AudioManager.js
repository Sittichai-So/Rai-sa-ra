const MAX_VOICES = 24
const HEAR_RANGE = 950
const PAN_RANGE = 650

export default class AudioManager {
  constructor ({ sounds = {}, music = {}, sfxVolume = 0.7, musicVolume = 0.35 } = {}) {
    this.sources = sounds
    this.musicSources = music
    this.sfxVolume = sfxVolume
    this.musicVolume = musicVolume
    this.buffers = {}
    this.ctx = null
    this.sfxGain = null
    this.musicGain = null
    this.voices = {}
    this.active = 0
    this.lastPlayed = {}
    this.musicEl = null
    this.musicName = null
    this.wantedMusic = null
    this.destroyed = false
  }

  unlock () {
    if (this.destroyed || typeof window === 'undefined') { return }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) { return }
    if (!this.ctx) {
      this.ctx = new Ctx()
      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.value = this.sfxVolume
      this.sfxGain.connect(this.ctx.destination)
      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = this.musicVolume
      this.musicGain.connect(this.ctx.destination)
      this._loadAll()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this._syncMusic()).catch(() => {})
    } else {
      this._syncMusic()
    }
  }

  get ready () {
    return !!(this.ctx && this.ctx.state === 'running')
  }

  _loadAll () {
    for (const name of Object.keys(this.sources)) {
      const list = Array.isArray(this.sources[name]) ? this.sources[name] : [this.sources[name]]
      this.buffers[name] = []
      for (const url of list) {
        fetch(url)
          .then(res => res.arrayBuffer())
          .then(data => new Promise((resolve, reject) => this.ctx.decodeAudioData(data, resolve, reject)))
          .then((buffer) => { if (!this.destroyed) { this.buffers[name].push(buffer) } })
          .catch(() => {})
      }
    }
  }

  play (name, opts = {}) {
    if (!this.ready || this.sfxVolume <= 0) { return }
    const list = this.buffers[name]
    if (!list || !list.length) { return }
    const { volume = 1, x = null, y = null, listener = null, rate = 1, jitter = 0.05, maxVoices = 4, minGap = 0 } = opts
    const now = this.ctx.currentTime
    if (minGap && this.lastPlayed[name] != null && now - this.lastPlayed[name] < minGap) { return }
    if ((this.voices[name] || 0) >= maxVoices || this.active >= MAX_VOICES) { return }

    let gain = volume
    let pan = 0
    if (x != null && y != null && listener) {
      const d = Math.hypot(x - listener.x, y - listener.y)
      if (d > HEAR_RANGE) { return }
      gain *= 1 - 0.85 * (d / HEAR_RANGE)
      pan = Math.max(-0.8, Math.min(0.8, (x - listener.x) / PAN_RANGE))
    }
    if (gain <= 0.01) { return }

    const src = this.ctx.createBufferSource()
    src.buffer = list[(Math.random() * list.length) | 0]
    src.playbackRate.value = rate * (1 + (Math.random() * 2 - 1) * jitter)
    const g = this.ctx.createGain()
    g.gain.value = gain
    src.connect(g)
    let tail = g
    if (pan && this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner()
      p.pan.value = pan
      g.connect(p)
      tail = p
    }
    tail.connect(this.sfxGain)

    this.voices[name] = (this.voices[name] || 0) + 1
    this.active++
    this.lastPlayed[name] = now
    src.onended = () => {
      this.voices[name] = Math.max(0, (this.voices[name] || 1) - 1)
      this.active = Math.max(0, this.active - 1)
      try { tail.disconnect() } catch (e) {}
    }
    src.start()
  }

  playMusic (name) {
    this.wantedMusic = name
    this._syncMusic()
  }

  stopMusic () {
    this.wantedMusic = null
    this._syncMusic()
  }

  _syncMusic () {
    if (!this.ctx || this.destroyed) { return }
    const want = this.musicVolume > 0 ? this.wantedMusic : null
    if (this.musicEl && this.musicName !== want) {
      this._fadeOutMusic()
    }
    if (!want || !this.musicSources[want] || this.ctx.state !== 'running') { return }
    if (this.musicEl && this.musicName === want) {
      if (this.musicEl.paused) { this.musicEl.play().catch(() => {}) }
      return
    }
    const el = new Audio(this.musicSources[want])
    el.loop = true
    el.preload = 'auto'
    const node = this.ctx.createMediaElementSource(el)
    const fader = this.ctx.createGain()
    fader.gain.setValueAtTime(0, this.ctx.currentTime)
    fader.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 1.2)
    node.connect(fader)
    fader.connect(this.musicGain)
    el.play().catch(() => {})
    this.musicEl = el
    this.musicName = want
    this.musicFader = fader
  }

  _fadeOutMusic () {
    const el = this.musicEl
    const fader = this.musicFader
    this.musicEl = null
    this.musicName = null
    this.musicFader = null
    if (!el) { return }
    if (fader && this.ctx) {
      const t = this.ctx.currentTime
      fader.gain.cancelScheduledValues(t)
      fader.gain.setValueAtTime(fader.gain.value, t)
      fader.gain.linearRampToValueAtTime(0, t + 0.8)
    }
    setTimeout(() => {
      el.pause()
      el.removeAttribute('src')
      try { fader.disconnect() } catch (e) {}
    }, 900)
  }

  setSfxVolume (v) {
    this.sfxVolume = Math.max(0, Math.min(1, v))
    if (this.sfxGain) { this.sfxGain.gain.value = this.sfxVolume }
  }

  setMusicVolume (v) {
    const was = this.musicVolume
    this.musicVolume = Math.max(0, Math.min(1, v))
    if (this.musicGain) { this.musicGain.gain.value = this.musicVolume }
    if ((was > 0) !== (this.musicVolume > 0)) { this._syncMusic() }
  }

  destroy () {
    this.destroyed = true
    this.wantedMusic = null
    if (this.musicEl) {
      this.musicEl.pause()
      this.musicEl.removeAttribute('src')
      this.musicEl = null
    }
    if (this.ctx) { this.ctx.close().catch(() => {}) }
    this.ctx = null
    this.buffers = {}
  }
}
