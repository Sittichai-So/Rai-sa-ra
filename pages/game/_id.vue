<template>
  <div ref="gamePage" class="game-page" tabindex="0">
    <div class="hud">
      <div class="hud-left">
        <div class="hp-bar-wrap">
          <span class="hud-label">HP</span>
          <div class="hp-bar">
            <div class="hp-fill" :style="{ width: hpPct + '%', background: hpColor }" />
          </div>
          <span class="hp-num">{{ myPlayer ? myPlayer.hp : 0 }}</span>
        </div>
        <div class="ammo-wrap" :class="{ reloading: myReloading, low: !myReloading && myAmmo <= myMag * 0.25 }">
          <i class="fas fa-bolt" />
          <span v-if="myReloading" class="ammo-num">รีโหลด...</span>
          <span v-else class="ammo-num">{{ myAmmo }}<small>/{{ myMag }}</small></span>
        </div>
      </div>
      <div class="hud-center">
        <div class="wave-display">
          <span class="wave-label">WAVE</span>
          <span class="wave-num">{{ wave }}</span>
        </div>
        <div v-if="waveCountdown > 0" class="wave-countdown">
          คลื่นถัดไปใน {{ waveCountdown }}s
        </div>
        <div v-else-if="waveActive && waveTimer <= 0" class="timer-display timer-warning">
          <i class="fas fa-skull" /> OVERTIME
        </div>
        <div v-else-if="waveActive" class="timer-display" :class="{ 'timer-warning': waveTimer <= 30 }">
          <i class="fas fa-clock" /> {{ timerDisplay }} / {{ timeLimitDisplay }}
        </div>
      </div>
      <div class="hud-right">
        <div class="score-display">
          <span class="hud-label">SCORE</span>
          <span class="score-num">{{ myPlayer ? myPlayer.score : 0 }}</span>
        </div>
        <div v-if="combo > 1" class="combo-display" :class="comboClass">
          <span class="combo-label">COMBO</span>
          <span class="combo-num">x{{ combo }}</span>
        </div>
        <button class="escape-btn" @click="confirmLeave">
          <i class="fas fa-door-open" />
        </button>
      </div>
    </div>

    <div class="mini-scoreboard">
      <div v-for="score in leaderboard" :key="score.playerId" class="sb-row" :class="{ 'sb-me': score.playerId === myId }">
        <span class="sb-name">{{ score.username || getPlayerName(score.playerId) }}</span>
        <span class="sb-score">{{ score.score }}</span>
        <span class="sb-kills">☠ {{ score.kills }}</span>
      </div>
    </div>

    <canvas
      ref="canvas"
      class="game-canvas"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @contextmenu.prevent
    />

    <div v-if="isTouch" class="touch-controls">
      <div
        ref="movePad"
        class="joystick-pad move-pad"
        @touchstart.prevent="onStickStart($event, 'move')"
      >
        <div class="joystick-base" />
        <div class="joystick-knob" :style="knobStyle(moveStick)" />
      </div>
      <div
        ref="aimPad"
        class="joystick-pad aim-pad"
        @touchstart.prevent="onStickStart($event, 'aim')"
      >
        <div class="joystick-base">
          <i class="fas fa-crosshairs" />
        </div>
        <div class="joystick-knob aim-knob" :style="knobStyle(aimStick)" />
      </div>
      <button
        class="reload-btn"
        :class="{ active: myReloading }"
        @touchstart.prevent="$socket.emit('playerReload')"
      >
        <i class="fas fa-rotate" />
      </button>
    </div>

    <transition name="fade">
      <div v-if="reconnecting" class="reconnect-overlay">
        <div class="reconnect-box">
          <i class="fas fa-wifi" />
          <p>การเชื่อมต่อหลุด — กำลังเชื่อมต่อใหม่...</p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="reinforceMsg" class="reinforce-toast">
        <i class="fas fa-triangle-exclamation" /> {{ reinforceMsg }}
      </div>
    </transition>

    <transition name="fade">
      <div v-if="upgradeOffer" class="upgrade-overlay">
        <div class="upgrade-panel">
          <div class="upgrade-head">
            <span class="uh-tag">LEVEL UP</span>
            <h3>เลือกอัปเกรด<span v-if="upgradeOffer.picks > 1"> ({{ upgradeOffer.picks }})</span></h3>
          </div>
          <div class="upgrade-cards" :class="{ busy: upgradeBusy }">
            <button
              v-for="c in upgradeOffer.choices"
              :key="c.key"
              class="upgrade-card"
              :disabled="upgradeBusy"
              @click="pickUpgrade(c.key)"
            >
              <span class="uc-name">{{ c.name }}</span>
              <span class="uc-desc">{{ c.desc }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="myUpgrades.length" class="upgrade-tags">
      <span
        v-for="(u, i) in upgradeSummary"
        :key="i"
        class="upgrade-tag"
      >{{ u.label }}<b v-if="u.count > 1">×{{ u.count }}</b></span>
    </div>

    <div v-if="bossZombie" class="boss-bar">
      <div class="boss-bar-label">
        <i class="fas fa-skull" /> BOSS
      </div>
      <div class="boss-bar-track">
        <div class="boss-bar-fill" :style="{ width: bossHpPct + '%' }" />
      </div>
    </div>

    <transition name="wave-fade">
      <div v-if="waveAnnounce" class="wave-announce">
        <div class="wave-announce-inner" :class="{ 'wa-boss': waveIsBoss, 'wa-brute': waveIsBrute }">
          <span class="wa-tag">{{ waveTag }}</span>
          <h2>WAVE {{ wave }}</h2>
          <span class="wa-sub">
            {{ waveSubText }}
          </span>
          <span v-if="waveTier > 0" class="wa-diff">ความยาก ×{{ diffLabel }}</span>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isDowned && !gameOver" class="downed-overlay">
        <div class="downed-box">
          <div class="downed-icon">
            <i class="fas fa-heart-crack" />
          </div>
          <h2>คุณถูกน็อค!</h2>
          <p>รอเพื่อนมาช่วยชุบ — อย่าเพิ่งยอมแพ้</p>
          <div class="bleed-track">
            <div class="bleed-fill" :style="{ width: downedBleedPct + '%' }" />
          </div>
          <div v-if="reviveProgressPct > 0" class="revive-note">
            กำลังถูกช่วย {{ reviveProgressPct }}%
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isDead && !gameOver" class="dead-overlay">
        <div class="dead-box">
          <div class="dead-icon">
            ☠
          </div>
          <h2>คุณตายแล้ว</h2>
          <p>รอผู้เล่นคนอื่นต่อสู้...</p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="gameOver" class="gameover-overlay">
        <div class="gameover-box">
          <div class="go-tag">
            GAME OVER
          </div>
          <h2>Wave {{ wave }} — ทุกคนเสียชีวิต</h2>
          <div class="leaderboard">
            <div class="lb-header">
              <span>ผู้เล่น</span>
              <span>คะแนน</span>
              <span>ฆ่า</span>
            </div>
            <div v-for="(p, i) in leaderboard" :key="p.playerId || i" class="lb-row" :class="{ 'lb-first': i === 0 }">
              <span class="lb-rank">#{{ i + 1 }}</span>
              <span class="lb-name">{{ p.username || getPlayerName(p.playerId) }}</span>
              <span class="lb-score">{{ p.score }}</span>
              <span class="lb-kills">{{ p.kills }}</span>
            </div>
          </div>
          <div class="go-actions">
            <button class="go-btn go-restart" @click="restart">
              <i class="fas fa-redo" /> เล่นใหม่
            </button>
            <button class="go-btn go-leave" @click="leaveGame">
              <i class="fas fa-door-open" /> ออกจากเกม
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import GameRenderer from '~/utils/GameRenderer'

const STICK_RADIUS = 46
const STICK_DEADZONE = 0.18

export default {
  name: 'GameRoom',
  middleware: 'middlewareAuth',
  data () {
    return {
      roomId: this.$route.params.id,
      myId: null,
      players: [],
      zombies: [],
      bullets: [],
      projectiles: [],
      pickups: [],
      wave: 0,
      waveActive: false,
      waveAnnounce: false,
      waveIsBoss: false,
      waveIsBrute: false,
      waveTier: 0,
      waveCountdown: 0,
      announceCount: 0,
      waveTimer: 0,
      waveTimeLimit: 120,
      combo: 0,
      maxCombo: 0,
      reinforceMsg: '',
      upgradeOffer: null,
      upgradeBusy: false,
      myUpgrades: [],
      scoreMultiplier: 1,
      lastKillTime: 0,
      comboTimeWindow: 3000,
      gameOver: false,
      leaderboard: [],
      keys: {},
      mouseX: 0,
      mouseY: 0,
      canvasW: 0,
      canvasH: 0,
      camX: 0,
      camY: 0,
      mapW: 1600,
      mapH: 1200,
      renderer: null,
      rafId: null,
      inputInterval: null,
      countdownInterval: null,
      timerInterval: null,
      user: null,
      isTouch: false,
      reconnecting: false,
      joined: false,
      moveStick: { active: false, id: null, x: 0, y: 0, which: 'move' },
      aimStick: { active: false, id: null, x: 0, y: 0, which: 'aim' },
      lastTouchShot: 0
    }
  },
  computed: {
    myPlayer () {
      return this.players.find(p => p.id === this.myId) || null
    },
    hpPct () {
      if (!this.myPlayer) { return 0 }
      return (this.myPlayer.hp / this.myPlayer.maxHp) * 100
    },
    hpColor () {
      const pct = this.hpPct
      if (pct > 60) { return '#00ff50' }
      if (pct > 30) { return '#ffcc00' }
      return '#ff4040'
    },
    sortedPlayers () {
      return this.leaderboard.map((score) => {
        const player = this.players.find(p => p.id === score.playerId)
        return {
          ...player,
          score: score.score,
          kills: score.kills,
          deaths: score.deaths
        }
      }).sort((a, b) => b.score - a.score)
    },
    isDead () {
      return this.myPlayer ? (!this.myPlayer.alive && !this.myPlayer.downed) : false
    },
    isDowned () {
      return this.myPlayer ? !!this.myPlayer.downed : false
    },
    downedBleedPct () {
      const p = this.myPlayer
      if (!p || !p.downed || !p.downedAt) { return 100 }
      const elapsed = Date.now() - p.downedAt
      return Math.max(0, 100 - (elapsed / 18000) * 100)
    },
    reviveProgressPct () {
      const p = this.myPlayer
      return p && p.reviveProgress ? Math.round(p.reviveProgress * 100) : 0
    },
    waveTag () {
      if (this.waveIsBoss) { return 'BOSS WAVE' }
      if (this.waveIsBrute) { return 'BRUTE WAVE' }
      return 'INCOMING'
    },
    waveSubText () {
      if (this.waveIsBoss) { return 'ระวังบอส!' }
      if (this.waveIsBrute) { return 'ตัวถังหนักบุกหนัก!' }
      return this.announceCount + ' ซอมบี้'
    },
    diffLabel () {
      return Math.pow(1.42, this.waveTier).toFixed(1)
    },
    myAmmo () {
      return this.myPlayer ? this.myPlayer.ammo : 0
    },
    myMag () {
      return this.myPlayer ? this.myPlayer.magSize : 30
    },
    myReloading () {
      return this.myPlayer ? this.myPlayer.reloading : false
    },
    bossZombie () {
      return this.zombies.find(z => z.type === 'boss') || null
    },
    bossHpPct () {
      const b = this.bossZombie
      if (!b || !b.maxHp) { return 0 }
      return Math.max(0, (b.hp / b.maxHp) * 100)
    },
    upgradeSummary () {
      const labels = {
        damage: 'DMG',
        firerate: 'RATE',
        magsize: 'MAG',
        reload: 'RLD',
        speed: 'SPD',
        maxhp: 'HP',
        pierce: 'PRC',
        multishot: 'MULTI',
        lifesteal: 'LEECH',
        regen: 'REGEN'
      }
      const counts = {}
      for (const k of this.myUpgrades) { counts[k] = (counts[k] || 0) + 1 }
      return Object.entries(counts).map(([k, count]) => ({ label: labels[k] || k, count }))
    },
    timerDisplay () {
      const mins = Math.floor(this.waveTimer / 60)
      const secs = this.waveTimer % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    timeLimitDisplay () {
      const mins = Math.floor(this.waveTimeLimit / 60)
      const secs = this.waveTimeLimit % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    comboClass () {
      if (this.combo >= 10) { return 'combo-x2' }
      if (this.combo >= 5) { return 'combo-x1.5' }
      if (this.combo >= 3) { return 'combo-x1.2' }
      return ''
    }
  },
  mounted () {
    this.$refs.gamePage.focus()

    this.isTouch = (typeof window !== 'undefined') &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)

    const stored = localStorage.getItem('userData')
    this.user = stored ? JSON.parse(stored) : { username: 'Guest', fullname: 'Guest' }

    this.setupCanvas()
    this.setupSocketListeners()
    this.setupRenderer()

    this.joinGame()

    this.inputInterval = setInterval(() => this.sendInput(), 50)

    this.timerInterval = setInterval(() => this.updateGameTimer(), 1000)

    this.renderLoop()

    window.addEventListener('resize', this.setupCanvas)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.clearKeys)

    if (this.isTouch) {
      window.addEventListener('touchmove', this.onStickMove, { passive: false })
      window.addEventListener('touchend', this.onStickEnd)
      window.addEventListener('touchcancel', this.onStickEnd)
    }
  },
  beforeDestroy () {
    this.$socket.emit('gameLeave')
    this._offAll()
    cancelAnimationFrame(this.rafId)
    clearInterval(this.inputInterval)
    clearInterval(this.countdownInterval)
    clearInterval(this.timerInterval)
    clearTimeout(this._reinforceT)
    window.removeEventListener('resize', this.setupCanvas)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.clearKeys)
    window.removeEventListener('touchmove', this.onStickMove)
    window.removeEventListener('touchend', this.onStickEnd)
    window.removeEventListener('touchcancel', this.onStickEnd)
  },
  methods: {
    setupCanvas () {
      const canvas = this.$refs.canvas
      if (!canvas) { return }
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight - 60
      this.canvasW = canvas.width
      this.canvasH = canvas.height
    },

    setupRenderer () {
      this.renderer = new GameRenderer(this.$refs.canvas)
    },

    renderLoop () {
      this.rafId = requestAnimationFrame(() => this.renderLoop())
      this.updateCamera()
      if (this.renderer) {
        this.renderer.draw({
          players: this.players,
          zombies: this.zombies,
          bullets: this.bullets,
          projectiles: this.projectiles,
          pickups: this.pickups,
          myId: this.myId,
          camX: this.camX,
          camY: this.camY,
          mapW: this.mapW,
          mapH: this.mapH
        })
      }
    },

    updateCamera () {
      const p = this.myPlayer
      if (!p) { return }
      const targetX = p.x - this.canvasW / 2
      const targetY = p.y - this.canvasH / 2
      this.camX += (targetX - this.camX) * 0.12
      this.camY += (targetY - this.camY) * 0.12
      this.camX = Math.max(0, Math.min(this.mapW - this.canvasW, this.camX))
      this.camY = Math.max(0, Math.min(this.mapH - this.canvasH, this.camY))
    },

    onKeyDown (e) {
      const k = e.key.toLowerCase()
      const gameKeys = ['w', 'a', 's', 'd', 'r', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ']
      if (e.key === 'Escape') { this.confirmLeave(); return }
      if (!gameKeys.includes(k)) { return }
      this.keys[k] = true
      if (k === 'r') { this.$socket.emit('playerReload') }
      e.preventDefault()
    },
    onKeyUp (e) {
      this.keys[e.key.toLowerCase()] = false
    },
    clearKeys () {
      this.keys = {}
    },
    onMouseMove (e) {
      this.mouseX = e.clientX
      this.mouseY = e.clientY - 60
    },
    onMouseDown (e) {
      if (e.button !== 0) { return }
      const angle = this.getShootAngle()
      this.$socket.emit('playerShoot', { angle })
      this._muzzle(angle)
    },

    _muzzle (angle) {
      const p = this.myPlayer
      if (p && this.renderer && !p.reloading) {
        this.renderer.muzzle(p.x, p.y, angle)
      }
    },

    pickUpgrade (key) {
      if (this.upgradeBusy) { return }
      this.upgradeBusy = true
      this.$socket.emit('upgradePick', { key })
      this.clearKeys()
      this.$nextTick(() => {
        if (this.$refs.gamePage) { this.$refs.gamePage.focus() }
      })
    },

    sendInput () {
      if (!this.myId) { return }

      let dx, dy, angle

      if (this.isTouch) {
        dx = this.moveStick.x
        dy = this.moveStick.y
        const aiming = this.aimStick.active && (this.aimStick.x || this.aimStick.y)
        if (aiming) {
          angle = Math.atan2(this.aimStick.y, this.aimStick.x)
        } else if (dx || dy) {
          angle = Math.atan2(dy, dx)
        } else {
          angle = this.myPlayer ? this.myPlayer.angle : 0
        }
        this.$socket.emit('playerMove', { dx, dy, angle })
        if (aiming) {
          const now = Date.now()
          if (now - this.lastTouchShot > 140) {
            this.lastTouchShot = now
            this.$socket.emit('playerShoot', { angle })
            this._muzzle(angle)
          }
        }
        return
      }

      dx = (this.keys.d || this.keys.arrowright ? 1 : 0) -
           (this.keys.a || this.keys.arrowleft ? 1 : 0)
      dy = (this.keys.s || this.keys.arrowdown ? 1 : 0) -
           (this.keys.w || this.keys.arrowup ? 1 : 0)
      angle = this.getShootAngle()
      this.$socket.emit('playerMove', { dx, dy, angle })
    },

    stickFor (which) {
      return which === 'move' ? this.moveStick : this.aimStick
    },

    padRef (which) {
      return which === 'move' ? this.$refs.movePad : this.$refs.aimPad
    },

    knobStyle (stick) {
      return {
        transform: `translate(${stick.x * STICK_RADIUS}px, ${stick.y * STICK_RADIUS}px)`
      }
    },

    onStickStart (e, which) {
      const touch = e.changedTouches[0]
      const stick = this.stickFor(which)
      stick.active = true
      stick.id = touch.identifier
      this.updateStick(stick, touch)
    },

    onStickMove (e) {
      let handled = false
      for (const stick of [this.moveStick, this.aimStick]) {
        if (!stick.active) { continue }
        for (const touch of e.changedTouches) {
          if (touch.identifier === stick.id) {
            this.updateStick(stick, touch)
            handled = true
          }
        }
      }
      if (handled) { e.preventDefault() }
    },

    onStickEnd (e) {
      for (const stick of [this.moveStick, this.aimStick]) {
        if (!stick.active) { continue }
        for (const touch of e.changedTouches) {
          if (touch.identifier === stick.id) {
            stick.active = false
            stick.id = null
            stick.x = 0
            stick.y = 0
          }
        }
      }
    },

    updateStick (stick, touch) {
      const pad = this.padRef(stick.which)
      if (!pad) { return }
      const rect = pad.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      let nx = (touch.clientX - cx) / STICK_RADIUS
      let ny = (touch.clientY - cy) / STICK_RADIUS
      const len = Math.hypot(nx, ny)
      if (len > 1) { nx /= len; ny /= len }
      if (Math.hypot(nx, ny) < STICK_DEADZONE) { nx = 0; ny = 0 }
      stick.x = nx
      stick.y = ny
    },

    getShootAngle () {
      const p = this.myPlayer
      if (!p) { return 0 }
      const px = p.x - this.camX
      const py = p.y - this.camY
      return Math.atan2(this.mouseY - py, this.mouseX - px)
    },

    joinGame () {
      this.$socket.emit('gameJoin', {
        roomId: this.roomId,
        user: this.user
      })
    },

    setupSocketListeners () {
      this.$socket.on('connect', this.onSocketReconnect)
      this.$socket.on('disconnect', this.onSocketDrop)

      this.$socket.on('gameJoined', ({ playerId, mapSize, map }) => {
        this.myId = playerId
        this.joined = true
        this.reconnecting = false
        if (mapSize) { this.mapW = mapSize.w; this.mapH = mapSize.h }
        if (map && this.renderer) { this.renderer.setMap(map) }
      })

      this.$socket.on('gameState', (state) => {
        this.players = state.players || []
        this.zombies = state.zombies || []
        this.bullets = state.bullets || []
        this.projectiles = state.projectiles || []
        this.pickups = state.pickups || []
        this.wave = state.wave || 0
        this.waveActive = state.waveActive || false

        if (state.scores && state.scores.length > 0) {
          this.leaderboard = state.scores
        }
      })

      this.$socket.on('waveCountdown', ({ countdown }) => {
        this.waveCountdown = countdown

        if (countdown === 0) {
          this.waveCountdown = 0
        }
      })

      this.$socket.on('waveStart', ({ wave, count, timeLimit, boss, brute, tier }) => {
        this.wave = wave
        this.announceCount = count
        this.waveIsBoss = !!boss
        this.waveIsBrute = !!brute
        this.waveTier = tier || 0
        this.waveAnnounce = true
        this.waveTimeLimit = timeLimit || 120
        this.waveTimer = this.waveTimeLimit
        setTimeout(() => { this.waveAnnounce = false }, 2800)
        this._startCountdown()
      })

      this.$socket.on('playerDied', ({ playerId }) => {
        const p = this.players.find(x => x.id === playerId)
        if (p && this.renderer) { this.renderer.bloodSplat(p.x, p.y, true) }
        if (playerId === this.myId) {
          if (this.renderer) { this.renderer.shake(12) }
          this.$nextTick(() => this.$forceUpdate())
        }
      })

      this.$socket.on('playerDowned', ({ playerId }) => {
        const p = this.players.find(x => x.id === playerId)
        if (p && this.renderer) {
          this.renderer.bloodSplat(p.x, p.y, true)
          this.renderer.floatText(p.x, p.y - 24, 'DOWN!', '#ff4040')
        }
        if (playerId === this.myId && this.renderer) { this.renderer.shake(10) }
      })

      this.$socket.on('playerRevived', ({ playerId }) => {
        const p = this.players.find(x => x.id === playerId)
        if (p && this.renderer) {
          this.renderer.spark(p.x, p.y, '#40ff78')
          this.renderer.floatText(p.x, p.y - 24, 'REVIVED', '#40ff78')
        }
      })

      this.$socket.on('playerHit', ({ playerId, damage }) => {
        const p = this.players.find(x => x.id === playerId)
        if (!p || !this.renderer) { return }
        this.renderer.bloodSplat(p.x, p.y, false)
        if (playerId === this.myId) { this.renderer.shake(Math.min(8, 2 + damage / 6)) }
      })

      this.$socket.on('pickupCollected', ({ type, x, y }) => {
        if (this.renderer) {
          this.renderer.spark(x, y, type === 'ammo' ? '#ffcc40' : '#40ff78')
        }
      })

      this.$socket.on('zombieKilled', ({ playerId, score, kills, isCombo, zombieType, x, y, gained }) => {
        if (this.renderer && x != null) {
          const big = zombieType === 'boss' || zombieType === 'tank'
          this.renderer.bloodSplat(x, y, big)
          this.renderer.floatText(x, y, '+' + (gained || 0), big ? '#ffcc40' : '#00ff50')
          if (zombieType === 'boss') { this.renderer.shake(10) }
        }
        if (playerId === this.myId) {
          const now = Date.now()
          if (isCombo || (now - this.lastKillTime < this.comboTimeWindow)) {
            this.combo = (this.combo || 0) + 1
            this.maxCombo = Math.max(this.maxCombo, this.combo)
          } else {
            this.combo = 1
          }
          this.lastKillTime = now

          const player = this.players.find(p => p.id === playerId)
          if (player) {
            player.score = score
            player.kills = kills
          }
        }
      })

      this.$socket.on('gameOver', ({ wave, leaderboard }) => {
        this.wave = wave
        this.leaderboard = leaderboard || []
        this.gameOver = true
        clearInterval(this.countdownInterval)
      })

      this.$socket.on('gameRestarted', () => {
        this.gameOver = false
        this.wave = 0
        this.combo = 0
        this.maxCombo = 0
        this.players = []
        this.zombies = []
        this.bullets = []
        this.pickups = []
        this.projectiles = []
        this.leaderboard = []
        this.myUpgrades = []
        this.upgradeOffer = null
        if (this.renderer) {
          this.renderer.decals = []
          this.renderer.particles = []
        }
      })

      this.$socket.on('waveReinforce', ({ count }) => {
        this.reinforceMsg = `หมดเวลา! กำลังเสริม ${count} ตัว`
        clearTimeout(this._reinforceT)
        this._reinforceT = setTimeout(() => { this.reinforceMsg = '' }, 3000)
      })

      this.$socket.on('upgradeOffer', ({ choices, picks }) => {
        this.upgradeOffer = { choices, picks }
        this.upgradeBusy = false
      })

      this.$socket.on('upgradeApplied', ({ upgrades, picksLeft, auto }) => {
        this.myUpgrades = upgrades || []
        this.upgradeBusy = false
        if (picksLeft <= 0) { this.upgradeOffer = null }
        if (auto && this.renderer && this.myPlayer) {
          this.renderer.floatText(this.myPlayer.x, this.myPlayer.y - 30, 'AUTO UPGRADE', '#ffcc40')
        }
      })
    },

    _offAll () {
      const events = [
        'gameJoined', 'gameState', 'waveCountdown', 'waveStart', 'playerHit',
        'playerDied', 'playerDowned', 'playerRevived', 'zombieKilled', 'gameOver',
        'gameRestarted', 'waveReinforce', 'pickupCollected', 'upgradeOffer', 'upgradeApplied'
      ]
      events.forEach(ev => this.$socket.off(ev))
      this.$socket.off('connect', this.onSocketReconnect)
      this.$socket.off('disconnect', this.onSocketDrop)
    },

    onSocketDrop () {
      if (this.joined) { this.reconnecting = true }
    },

    onSocketReconnect () {
      if (!this.joined) { return }
      this.joinGame()
    },

    _startCountdown () {
      clearInterval(this.countdownInterval)
      this.waveCountdown = 0
    },

    updateGameTimer () {
      if (!this.waveActive || this.gameOver) { return }

      if (this.waveTimer > 0) {
        this.waveTimer--

        if (this.waveTimer <= 0) {
          this.$socket.emit('waveTimeUp', { roomId: this.roomId, wave: this.wave })
        }
      }
    },

    resetCombo () {
      this.combo = 0
      this.lastKillTime = 0
    },

    async confirmLeave () {
      const ok = await this.$bvModal.msgBoxConfirm('ออกจากเกมหรือไม่?', {
        title: 'ยืนยัน',
        okVariant: 'danger',
        okTitle: 'ออก',
        cancelTitle: 'เล่นต่อ',
        centered: true
      })
      if (ok) { this.leaveGame() }
    },

    leaveGame () {
      this.$socket.emit('gameLeave')
      this.$router.push('/game')
    },

    restart () {
      this.$socket.emit('gameRestart', { roomId: this.roomId })
    },

    getPlayerName (playerId) {
      const player = this.players.find(p => p.id === playerId)
      return player ? player.username : 'Unknown'
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.game-page {
  width: 100vw;
  height: 100vh;
  background: #080c10;
  overflow: hidden;
  position: relative;
  outline: none;
  display: flex;
  flex-direction: column;
}

.hud {
  height: 60px;
  background: rgba(0,0,0,0.85);
  border-bottom: 1px solid rgba(0,255,80,0.2);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;
  z-index: 10;
  flex-shrink: 0;
}
.hud-left, .hud-right {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}
.hud-right { justify-content: flex-end; }
.hud-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.hud-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(0,255,80,0.5);
}

.hp-bar-wrap { display: flex; align-items: center; gap: 8px; }

.ammo-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #ffcc40;
}
.ammo-wrap i { font-size: 11px; opacity: 0.8; }
.ammo-num small { font-size: 10px; opacity: 0.55; }
.ammo-wrap.low { color: #ff6040; animation: pulse-warning 0.8s infinite; }
.ammo-wrap.reloading { color: rgba(255,204,64,0.6); font-size: 12px; }
.hp-bar {
  width: 140px;
  height: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}
.hp-fill { height: 100%; transition: width 0.2s, background 0.4s; }
.hp-num { font-family: 'Orbitron', sans-serif; font-size: 13px; color: #e0f0e0; min-width: 28px; }

.wave-display { display: flex; align-items: baseline; gap: 6px; }
.wave-label { font-family: 'Orbitron', sans-serif; font-size: 10px; letter-spacing: 2px; color: rgba(0,255,80,0.5); }
.wave-num { font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; color: #00ff50; line-height: 1; }
.wave-countdown { font-size: 11px; color: rgba(224,240,224,0.4); font-family: 'Share Tech Mono', monospace; }

.timer-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #00ff50;
  padding: 4px 12px;
  background: rgba(0,255,80,0.1);
  border: 1px solid rgba(0,255,80,0.3);
  margin-top: 4px;
}
.timer-display.timer-warning {
  color: #ff4040;
  background: rgba(255,64,64,0.1);
  border-color: rgba(255,64,64,0.4);
  animation: pulse-warning 1s infinite;
}
@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.score-display { display: flex; flex-direction: column; align-items: flex-end; }
.score-num { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 700; color: #fff; }

.combo-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 16px;
  background: rgba(0,0,0,0.6);
  border: 2px solid rgba(0,255,80,0.3);
  margin-left: 12px;
  animation: combo-pop 0.3s ease-out;
}
@keyframes combo-pop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.combo-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  letter-spacing: 2px;
  color: rgba(0,255,80,0.6);
}
.combo-num {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  font-weight: 900;
  color: #00ff50;
  text-shadow: 0 0 10px rgba(0,255,80,0.5);
}
.combo-display.combo-x1\.2 {
  border-color: rgba(0,200,255,0.5);
  .combo-num { color: #00c8ff; text-shadow: 0 0 10px rgba(0,200,255,0.6); }
}
.combo-display.combo-x1\.5 {
  border-color: rgba(255,180,0,0.5);
  .combo-num { color: #ffb400; text-shadow: 0 0 12px rgba(255,180,0,0.7); }
}
.combo-display.combo-x2 {
  border-color: rgba(255,0,100,0.6);
  .combo-num { color: #ff0064; text-shadow: 0 0 15px rgba(255,0,100,0.8); animation: combo-shake 0.5s ease-in-out; }
}
@keyframes combo-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

.escape-btn {
  background: transparent;
  border: 1px solid rgba(255,80,80,0.3);
  color: rgba(255,80,80,0.6);
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.escape-btn:hover { background: rgba(255,80,80,0.1); border-color: #ff5050; color: #ff5050; }

.mini-scoreboard {
  position: absolute;
  top: 70px;
  right: 14px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
}
.sb-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(0,255,80,0.08);
  padding: 5px 10px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  color: rgba(224,240,224,0.6);
}
.sb-me { border-color: rgba(0,255,80,0.3); color: #e0f0e0; }
.sb-dead { opacity: 0.35; text-decoration: line-through; }
.sb-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sb-name { flex: 1; }
.sb-score { color: #00ff50; min-width: 40px; text-align: right; }
.sb-kills { color: #ff8080; min-width: 40px; text-align: right; }

.game-canvas {
  display: block;
  flex: 1;
  cursor: crosshair;
}

.touch-controls {
  position: absolute;
  inset: 60px 0 0 0;
  pointer-events: none;
  z-index: 15;
}

.joystick-pad {
  position: absolute;
  bottom: 28px;
  width: 132px;
  height: 132px;
  pointer-events: auto;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.move-pad { left: 24px; }
.aim-pad { right: 24px; }

.joystick-base {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  border: 2px solid rgba(0, 255, 80, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 80, 80, 0.5);
  font-size: 22px;
}

.aim-pad .joystick-base { border-color: rgba(255, 80, 80, 0.3); }

.joystick-knob {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 255, 80, 0.35);
  border: 2px solid rgba(0, 255, 80, 0.7);
  will-change: transform;
}

.aim-knob {
  background: rgba(255, 80, 80, 0.35);
  border-color: rgba(255, 80, 80, 0.7);
}

.reload-btn {
  position: absolute;
  right: 168px;
  bottom: 40px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(255, 204, 64, 0.2);
  border: 2px solid rgba(255, 204, 64, 0.6);
  color: #ffcc40;
  font-size: 20px;
  pointer-events: auto;
  touch-action: none;
}
.reload-btn.active {
  animation: pulse-warning 0.6s infinite;
}

.reconnect-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.reconnect-box {
  text-align: center;
  color: #e0f0e0;
  font-family: 'Share Tech Mono', monospace;
}

.reconnect-box i {
  font-size: 40px;
  color: #ffcc00;
  margin-bottom: 12px;
  animation: pulse-warning 1s infinite;
}

.wave-announce {
  position: absolute;
  inset: 0;
  top: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 20;
}
.wave-announce-inner {
  text-align: center;
  padding: 28px 48px;
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(0,255,80,0.3);
}
.wa-tag {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 4px;
  color: #ff4040;
}
.wave-announce-inner h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: #fff;
  margin: 4px 0 8px;
  text-shadow: 0 0 20px rgba(0,255,80,0.5);
}
.wa-sub { font-size: 14px; color: rgba(224,240,224,0.5); font-family: 'Share Tech Mono', monospace; }

.wave-announce-inner.wa-boss {
  border-color: rgba(255,40,40,0.6);
  box-shadow: 0 0 40px rgba(255,40,40,0.35);
}
.wa-boss .wa-tag { color: #ff2020; letter-spacing: 6px; }
.wa-boss h2 { color: #ff5050; text-shadow: 0 0 24px rgba(255,40,40,0.7); }

.wave-announce-inner.wa-brute { border-color: rgba(255,160,40,0.55); }
.wa-brute .wa-tag { color: #ff9028; letter-spacing: 5px; }
.wa-brute h2 { color: #ffb040; }

.wa-diff {
  display: block;
  margin-top: 6px;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 2px;
  color: #ff6040;
}

.reinforce-toast {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background: rgba(255,40,40,0.15);
  border: 1px solid rgba(255,40,40,0.5);
  color: #ff6040;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  padding: 8px 18px;
}

.upgrade-overlay {
  position: absolute;
  inset: 60px 0 0 0;
  background: rgba(4,8,10,0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 45;
}
.upgrade-panel {
  text-align: center;
  padding: 28px;
}
.upgrade-head { margin-bottom: 22px; }
.uh-tag {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 5px;
  color: #00ff50;
}
.upgrade-head h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  color: #fff;
  margin: 6px 0 0;
}
.upgrade-cards {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}
.upgrade-cards.busy { opacity: 0.5; pointer-events: none; }
.upgrade-card {
  width: 200px;
  min-height: 130px;
  padding: 18px 16px;
  background: rgba(0,255,80,0.04);
  border: 1px solid rgba(0,255,80,0.25);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  text-align: left;
  transition: all 0.15s;
}
.upgrade-card:hover {
  background: rgba(0,255,80,0.12);
  border-color: #00ff50;
  transform: translateY(-3px);
  box-shadow: 0 0 24px rgba(0,255,80,0.25);
}
.uc-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #00ff50;
}
.uc-desc {
  font-size: 12px;
  color: rgba(224,240,224,0.6);
  font-family: 'Share Tech Mono', monospace;
}

.upgrade-tags {
  position: absolute;
  left: 14px;
  top: 72px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 10;
}
.upgrade-tag {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: rgba(0,255,80,0.7);
  background: rgba(0,0,0,0.5);
  border-left: 2px solid rgba(0,255,80,0.5);
  padding: 2px 8px;
}
.upgrade-tag b { color: #fff; margin-left: 3px; }

@media (max-width: 900px) {
  .upgrade-card { width: 44%; min-height: 0; }
  .upgrade-tags { top: 66px; }
}

.boss-bar {
  position: absolute;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  width: min(560px, 80vw);
  z-index: 16;
  display: flex;
  align-items: center;
  gap: 10px;
}
.boss-bar-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #ff3030;
  white-space: nowrap;
}
.boss-bar-track {
  flex: 1;
  height: 12px;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,40,40,0.4);
}
.boss-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff2020, #ff6040);
  transition: width 0.2s;
}

.dead-overlay {
  position: absolute;
  inset: 0;
  top: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  z-index: 18;
}
.dead-box {
  text-align: center;
  background: rgba(0,0,0,0.8);
  border: 1px solid rgba(255,80,80,0.3);
  padding: 40px 60px;
}
.dead-icon { font-size: 52px; margin-bottom: 12px; opacity: 0.5; }
.dead-box h2 { font-family: 'Orbitron', sans-serif; font-size: 22px; color: #ff5050; margin-bottom: 8px; }
.dead-box p { font-size: 13px; color: rgba(224,240,224,0.4); font-family: 'Share Tech Mono', monospace; }

.downed-overlay {
  position: absolute;
  inset: 60px 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(60,0,0,0.35);
  z-index: 18;
  pointer-events: none;
}
.downed-box {
  text-align: center;
  background: rgba(10,0,0,0.78);
  border: 1px solid rgba(255,64,64,0.45);
  padding: 30px 44px;
}
.downed-icon { font-size: 40px; color: #ff4040; margin-bottom: 10px; animation: pulse-warning 0.9s infinite; }
.downed-box h2 { font-family: 'Orbitron', sans-serif; font-size: 20px; color: #ff5050; margin-bottom: 6px; }
.downed-box p { font-size: 12px; color: rgba(224,240,224,0.55); font-family: 'Share Tech Mono', monospace; margin-bottom: 14px; }
.bleed-track {
  width: 220px;
  height: 6px;
  margin: 0 auto;
  background: rgba(255,255,255,0.1);
}
.bleed-fill { height: 100%; background: linear-gradient(90deg, #ff2020, #ff7040); transition: width 0.2s linear; }
.revive-note { margin-top: 10px; font-size: 12px; color: #40ff78; font-family: 'Share Tech Mono', monospace; }

.gameover-overlay {
  position: absolute;
  inset: 0;
  top: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.82);
  z-index: 30;
}
.gameover-box {
  background: rgba(8,12,16,0.98);
  border: 1px solid rgba(0,255,80,0.2);
  padding: 40px 52px;
  min-width: 420px;
  text-align: center;
}
.go-tag {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 4px;
  color: #ff4040;
  margin-bottom: 8px;
}
.gameover-box h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  color: #fff;
  margin-bottom: 24px;
}

.leaderboard { margin-bottom: 28px; }
.lb-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,255,80,0.15);
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  letter-spacing: 1px;
  color: rgba(0,255,80,0.5);
  text-align: left;
}
.lb-row {
  display: grid;
  grid-template-columns: auto 2fr 1fr 1fr;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  color: rgba(224,240,224,0.6);
  text-align: left;
  align-items: center;
}
.lb-first { color: #fff; }
.lb-rank { color: #00ff50; width: 24px; }
.lb-score { color: #00ff50; }
.lb-kills { color: #ff8080; }

.go-actions { display: flex; gap: 12px; }
.go-btn {
  flex: 1;
  padding: 13px;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.go-restart { background: #00ff50; color: #080c10; }
.go-restart:hover { background: #80ffb0; }
.go-leave { background: transparent; border: 1px solid rgba(255,80,80,0.3); color: rgba(255,80,80,0.7); }
.go-leave:hover { background: rgba(255,80,80,0.1); border-color: #ff5050; color: #ff5050; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter, .fade-leave-to { opacity: 0; }
.wave-fade-enter-active, .wave-fade-leave-active { transition: opacity 0.5s; }
.wave-fade-enter, .wave-fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .hud {
    padding: 0 12px;
    gap: 10px;
  }
  .hud-left, .hud-right {
    min-width: 0;
    gap: 8px;
  }
  .hp-bar { width: 90px; }
  .wave-num { font-size: 20px; }
  .wave-label { font-size: 9px; }
  .score-num { font-size: 15px; }
  .combo-display { padding: 4px 10px; margin-left: 8px; }
  .combo-num { font-size: 18px; }
  .escape-btn { width: 32px; height: 32px; font-size: 12px; }

  .mini-scoreboard {
    top: 64px;
    right: 8px;
    min-width: 150px;
  }
  .sb-row { font-size: 10.5px; padding: 4px 8px; }
  .sb-kills { display: none; }

  .wave-announce-inner { padding: 20px 32px; }
  .wave-announce-inner h2 { font-size: 32px; }
  .wa-tag { font-size: 10px; }

  .dead-box { padding: 28px 36px; }
  .dead-icon { font-size: 40px; }
  .dead-box h2 { font-size: 18px; }

  .gameover-box {
    min-width: 0;
    width: 90vw;
    padding: 28px 24px;
  }
  .gameover-box h2 { font-size: 17px; }
  .lb-row, .lb-header { font-size: 11.5px; }
}

@media (max-width: 480px) {
  .hud { height: 52px; padding: 0 8px; gap: 6px; }
  .hud-label { font-size: 7.5px; }
  .hp-bar { width: 60px; height: 6px; }
  .hp-num { font-size: 11px; min-width: 22px; }
  .wave-num { font-size: 16px; }
  .wave-countdown, .timer-display { font-size: 10px; padding: 2px 8px; }
  .score-num { font-size: 12px; }
  .combo-display { padding: 3px 8px; margin-left: 4px; }
  .combo-num { font-size: 14px; }
  .escape-btn { width: 28px; height: 28px; }

  .mini-scoreboard { min-width: 120px; top: 58px; }
  .sb-row { font-size: 9.5px; gap: 4px; padding: 3px 6px; }

  .wave-announce-inner { padding: 14px 20px; }
  .wave-announce-inner h2 { font-size: 24px; }

  .dead-box { padding: 20px 24px; }
  .dead-box h2 { font-size: 16px; }
  .dead-box p { font-size: 11px; }

  .gameover-box { width: 94vw; padding: 20px 16px; }
  .go-actions { flex-direction: column; }
  .go-btn { font-size: 11px; padding: 11px; }
}
</style>
