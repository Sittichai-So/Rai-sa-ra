<template>
  <div ref="gamePage" class="game-page" tabindex="0" @keydown="onKeyDown" @keyup="onKeyUp">
    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="hp-bar-wrap">
          <span class="hud-label">HP</span>
          <div class="hp-bar">
            <div class="hp-fill" :style="{ width: hpPct + '%', background: hpColor }" />
          </div>
          <span class="hp-num">{{ myPlayer ? myPlayer.hp : 0 }}</span>
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
      </div>
      <div class="hud-right">
        <div class="score-display">
          <span class="hud-label">SCORE</span>
          <span class="score-num">{{ myPlayer ? myPlayer.score : 0 }}</span>
        </div>
        <button class="escape-btn" @click="confirmLeave">
          <i class="fas fa-door-open" />
        </button>
      </div>
    </div>

    <!-- Scoreboard (mini) -->
    <div class="mini-scoreboard">
      <div v-for="p in sortedPlayers" :key="p.id" class="sb-row" :class="{ 'sb-dead': !p.alive, 'sb-me': p.id === myId }">
        <span class="sb-dot" :style="{ background: p.color }" />
        <span class="sb-name">{{ p.username }}</span>
        <span class="sb-score">{{ p.score }}</span>
        <span class="sb-kills">☠ {{ p.kills }}</span>
      </div>
    </div>

    <!-- Canvas -->
    <canvas
      ref="canvas"
      class="game-canvas"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @contextmenu.prevent
    />

    <!-- Wave announcement -->
    <transition name="wave-fade">
      <div v-if="waveAnnounce" class="wave-announce">
        <div class="wave-announce-inner">
          <span class="wa-tag">INCOMING</span>
          <h2>WAVE {{ wave }}</h2>
          <span class="wa-sub">{{ announceCount }} ซอมบี้</span>
        </div>
      </div>
    </transition>

    <!-- Dead overlay -->
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

    <!-- Game Over -->
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
            <div v-for="(p, i) in leaderboard" :key="p.username" class="lb-row" :class="{ 'lb-first': i === 0 }">
              <span class="lb-rank">#{{ i + 1 }}</span>
              <span class="lb-name">{{ p.username }}</span>
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
      wave: 0,
      waveActive: false,
      waveAnnounce: false,
      waveCountdown: 0,
      announceCount: 0,
      //   isDead: false,
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
      user: null
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
      return [...this.players].sort((a, b) => b.score - a.score)
    },
    isDead () {
      return this.myPlayer ? !this.myPlayer.alive : false
    }
  },
  mounted () {
    this.$refs.gamePage.focus()

    const stored = localStorage.getItem('userData')
    this.user = stored ? JSON.parse(stored) : { username: 'Guest', fullname: 'Guest' }

    this.setupCanvas()
    this.setupSocketListeners()
    this.setupRenderer()

    // Join game
    this.$socket.emit('gameJoin', {
      roomId: this.roomId,
      user: this.user
    })

    // Input loop: send movement 20x/sec
    this.inputInterval = setInterval(() => this.sendInput(), 50)

    // RAF render loop
    this.renderLoop()

    window.addEventListener('resize', this.setupCanvas)
  },
  beforeDestroy () {
    this.$socket.emit('gameLeave')
    this._offAll()
    cancelAnimationFrame(this.rafId)
    clearInterval(this.inputInterval)
    clearInterval(this.countdownInterval)
    window.removeEventListener('resize', this.setupCanvas)
  },
  methods: {
    // ─── canvas setup ───────────────────────────────────────────
    setupCanvas () {
      const canvas = this.$refs.canvas
      if (!canvas) { return }
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight - 60 // minus HUD
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
      // Smooth camera
      this.camX += (targetX - this.camX) * 0.12
      this.camY += (targetY - this.camY) * 0.12
      // Clamp to map
      this.camX = Math.max(0, Math.min(this.mapW - this.canvasW, this.camX))
      this.camY = Math.max(0, Math.min(this.mapH - this.canvasH, this.camY))
    },

    // ─── input ──────────────────────────────────────────────────
    onKeyDown (e) {
      this.keys[e.key.toLowerCase()] = true
      if (e.key === 'Escape') { this.confirmLeave() }
      e.preventDefault()
    },
    onKeyUp (e) {
      this.keys[e.key.toLowerCase()] = false
    },
    onMouseMove (e) {
      this.mouseX = e.clientX
      this.mouseY = e.clientY - 60 // offset HUD
    },
    onMouseDown (e) {
      if (e.button !== 0) { return }
      const angle = this.getShootAngle()
      this.$socket.emit('playerShoot', { angle })
    },

    sendInput () {
      if (!this.myId) { return }
      const dx = (this.keys.d || this.keys.arrowright ? 1 : 0) -
                 (this.keys.a || this.keys.arrowleft ? 1 : 0)
      const dy = (this.keys.s || this.keys.arrowdown ? 1 : 0) -
                 (this.keys.w || this.keys.arrowup ? 1 : 0)
      const angle = this.getShootAngle()
      this.$socket.emit('playerMove', { dx, dy, angle })
    },

    getShootAngle () {
      const p = this.myPlayer
      if (!p) { return 0 }
      const px = p.x - this.camX
      const py = p.y - this.camY
      return Math.atan2(this.mouseY - py, this.mouseX - px)
    },

    // ─── socket listeners ────────────────────────────────────────
    setupSocketListeners () {
      this.$socket.on('gameJoined', ({ playerId, mapSize }) => {
        this.myId = playerId
        if (mapSize) { this.mapW = mapSize.w; this.mapH = mapSize.h }
      })

      this.$socket.on('gameState', (state) => {
        this.players = state.players || []
        this.zombies = state.zombies || []
        this.bullets = state.bullets || []
        this.wave = state.wave || 0
        this.waveActive = state.waveActive || false
      })

      this.$socket.on('waveStart', ({ wave, count }) => {
        this.wave = wave
        this.announceCount = count
        this.waveAnnounce = true
        setTimeout(() => { this.waveAnnounce = false }, 2500)
        this._startCountdown()
      })

      this.$socket.on('playerDied', ({ playerId }) => {
        if (playerId === this.myId) { this.isDead = true }
      })

      this.$socket.on('gameOver', ({ wave, leaderboard }) => {
        this.wave = wave
        this.leaderboard = leaderboard || []
        this.gameOver = true
        clearInterval(this.countdownInterval)
      })

      this.$socket.on('gameRestarted', () => {
        this.gameOver = false
        this.isDead = false
        this.wave = 0
        this.players = []
        this.zombies = []
        this.bullets = []
      })
    },

    _offAll () {
      ['gameJoined', 'gameState', 'waveStart', 'playerDied',
        'playerHit', 'zombieKilled', 'zombieHit', 'gameOver', 'gameRestarted']
        .forEach(ev => this.$socket.off(ev))
    },

    _startCountdown () {
      clearInterval(this.countdownInterval)
      this.waveCountdown = 0
    },

    // ─── actions ────────────────────────────────────────────────
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

/* HUD */
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

.score-display { display: flex; flex-direction: column; align-items: flex-end; }
.score-num { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 700; color: #fff; }

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

/* Mini scoreboard */
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

/* Canvas */
.game-canvas {
  display: block;
  flex: 1;
  cursor: crosshair;
}

/* Wave announce */
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

/* Dead overlay */
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

/* Game over */
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

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter, .fade-leave-to { opacity: 0; }
.wave-fade-enter-active, .wave-fade-leave-active { transition: opacity 0.5s; }
.wave-fade-enter, .wave-fade-leave-to { opacity: 0; }
</style>
