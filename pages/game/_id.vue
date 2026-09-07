<template>
  <div ref="gamePage" class="game-page" tabindex="0" @keydown="onKeyDown" @keyup="onKeyUp">
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

    <transition name="wave-fade">
      <div v-if="waveAnnounce" class="wave-announce">
        <div class="wave-announce-inner">
          <span class="wa-tag">INCOMING</span>
          <h2>WAVE {{ wave }}</h2>
          <span class="wa-sub">{{ announceCount }} ซอมบี้</span>
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

// TODO: เล่นบนมือถือไม่ได้ — ต้องมี virtual joystick (เดิน) + ปุ่มยิง สำหรับจอสัมผัส
// TODO: reconnect กลับเข้าเกมเมื่อ socket หลุด
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
      waveTimer: 0,
      waveTimeLimit: 120,
      combo: 0,
      maxCombo: 0,
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
      return this.myPlayer ? !this.myPlayer.alive : false
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

    const stored = localStorage.getItem('userData')
    this.user = stored ? JSON.parse(stored) : { username: 'Guest', fullname: 'Guest' }

    this.setupCanvas()
    this.setupSocketListeners()
    this.setupRenderer()

    this.$socket.emit('gameJoin', {
      roomId: this.roomId,
      user: this.user
    })

    this.inputInterval = setInterval(() => this.sendInput(), 50)

    this.timerInterval = setInterval(() => this.updateGameTimer(), 1000)

    this.renderLoop()

    window.addEventListener('resize', this.setupCanvas)
  },
  beforeDestroy () {
    this.$socket.emit('gameLeave')
    this._offAll()
    cancelAnimationFrame(this.rafId)
    clearInterval(this.inputInterval)
    clearInterval(this.countdownInterval)
    clearInterval(this.timerInterval)
    window.removeEventListener('resize', this.setupCanvas)
  },
  methods: {
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
      this.camX += (targetX - this.camX) * 0.12
      this.camY += (targetY - this.camY) * 0.12
      this.camX = Math.max(0, Math.min(this.mapW - this.canvasW, this.camX))
      this.camY = Math.max(0, Math.min(this.mapH - this.canvasH, this.camY))
    },

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
      this.mouseY = e.clientY - 60
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

      this.$socket.on('waveStart', ({ wave, count, timeLimit }) => {
        this.wave = wave
        this.announceCount = count
        this.waveAnnounce = true
        this.waveTimeLimit = timeLimit || 120
        this.waveTimer = this.waveTimeLimit
        setTimeout(() => { this.waveAnnounce = false }, 2500)
        this._startCountdown()
      })

      this.$socket.on('playerDied', ({ playerId }) => {
        // isDead เป็น computed ที่คำนวณจาก gameState อยู่แล้ว
        if (playerId === this.myId) {
          this.$nextTick(() => this.$forceUpdate())
        }
      })

      this.$socket.on('zombieKilled', ({ playerId, score, kills, isCombo }) => {
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
        this.leaderboard = []
      })
    },

    _offAll () {
      const events = [
        'gameJoined', 'gameState', 'waveCountdown', 'waveStart',
        'playerDied', 'zombieKilled', 'gameOver', 'gameRestarted'
      ]
      events.forEach(ev => this.$socket.off(ev))
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
