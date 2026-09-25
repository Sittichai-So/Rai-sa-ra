<template>
  <div
    ref="gamePage"
    class="game-page"
    tabindex="0"
    @pointerdown="refocusGame"
  >
    <div class="hud" :class="{ raised: soundOpen }">
      <div class="hud-left">
        <div class="hp-bar-wrap">
          <span class="hud-label">HP</span>
          <div class="hp-bar">
            <div class="hp-fill" :style="{ width: hpPct + '%', background: hpColor }" />
          </div>
          <span class="hp-num">{{ myHp }}</span>
        </div>
        <div class="ammo-wrap" :class="{ reloading: myReloading, low: !myReloading && myAmmo <= myMag * 0.25 }">
          <i class="fas fa-bolt" />
          <span v-if="myReloading" class="ammo-num">รีโหลด...</span>
          <span v-else class="ammo-num">{{ myAmmo }}<small>/{{ myMag }}</small></span>
        </div>
        <div
          class="dash-pip"
          :class="{ cooling: !dashReady }"
          :style="{ '--dash-cd': dashCooldownMs + 'ms' }"
          title="สไลด์หลบ (Space)"
        >
          <i class="fas fa-person-running" />
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
          <span class="score-num">{{ myScore }}</span>
        </div>
        <div v-if="combo > 1" class="combo-display" :class="comboClass">
          <span class="combo-label">COMBO</span>
          <span class="combo-num">x{{ combo }}</span>
          <span v-if="comboBonusText" class="combo-bonus">{{ comboBonusText }}</span>
        </div>
        <div class="sound-ctl" @pointerdown.stop>
          <button class="sound-btn" :class="{ muted: audioMuted }" title="ตั้งค่าเสียง (M = ปิด/เปิดเสียง)" @click="soundOpen = !soundOpen">
            <i :class="audioMuted ? 'fas fa-volume-xmark' : 'fas fa-volume-high'" />
          </button>
          <div v-if="soundOpen" class="sound-panel">
            <div class="sp-title">
              เสียง
            </div>
            <label class="sp-row">
              <span>เพลง</span>
              <input
                v-model.number="musicVol"
                type="range"
                min="0"
                max="100"
                step="5"
                :disabled="audioMuted"
              >
              <b>{{ musicVol }}</b>
            </label>
            <label class="sp-row">
              <span>เอฟเฟกต์</span>
              <input
                v-model.number="sfxVol"
                type="range"
                min="0"
                max="100"
                step="5"
                :disabled="audioMuted"
                @change="previewSfx"
              >
              <b>{{ sfxVol }}</b>
            </label>
            <button class="sp-mute" :class="{ on: audioMuted }" @click="toggleMute">
              <i :class="audioMuted ? 'fas fa-volume-high' : 'fas fa-volume-xmark'" />
              {{ audioMuted ? 'เปิดเสียง' : 'ปิดเสียงทั้งหมด' }}
            </button>
            <div v-if="!isTouch" class="sp-hint">
              กด M เพื่อปิด/เปิดเสียงเร็ว
            </div>
          </div>
        </div>
        <button class="escape-btn" @click="confirmLeave">
          <i class="fas fa-door-open" />
        </button>
      </div>
    </div>

    <div class="mini-scoreboard">
      <div v-for="score in miniLeaderboard" :key="score.playerId" class="sb-row" :class="{ 'sb-me': score.playerId === myId }">
        <span class="sb-name">{{ score.username || getPlayerName(score.playerId) }}</span>
        <span class="sb-score">{{ score.score }}</span>
        <span class="sb-kills"><i class="fas fa-skull" /> {{ score.kills }}</span>
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
        @touchstart.prevent="emitReload"
      >
        <i class="fas fa-rotate" />
      </button>
      <button
        class="dash-btn"
        :class="{ cooling: !dashReady }"
        @touchstart.prevent="doDash"
      >
        <i class="fas fa-person-running" />
      </button>
    </div>

    <transition name="fade">
      <div v-if="!joined && !fatalError && !forcedDead && !reconnecting" class="reconnect-overlay loading-overlay">
        <div class="reconnect-box">
          <i class="fas fa-circle-notch" />
          <p>กำลังเข้าเกม...</p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="inLobby && joined && !fatalError" class="gameover-overlay lobby-overlay">
        <div class="gameover-box lobby-box">
          <div class="go-tag">
            ห้องรอ
          </div>
          <h2>เตรียมพร้อมก่อนเริ่มเกม</h2>

          <div class="lobby-players">
            <div class="lb-header lobby-player-header">
              <span>ผู้เล่น</span>
              <span>สถานะ</span>
            </div>
            <div v-for="p in lobbyPlayers" :key="p.id" class="lb-row lobby-player-row">
              <span class="lobby-player-name">
                {{ p.username }}
                <span v-if="String(p.userId) === String(lobbyHostId)" class="lobby-host-tag">HOST</span>
              </span>
              <span class="lobby-ready-tag" :class="{ on: p.ready }">
                <i :class="p.ready ? 'fas fa-check' : 'fas fa-hourglass-half'" />
                {{ p.ready ? 'พร้อม' : 'รอ...' }}
              </span>
            </div>
          </div>

          <p class="lobby-hint">
            {{ lobbyHintText }}
          </p>
          <p v-if="lobbyError" class="lobby-error">
            {{ lobbyError }}
          </p>

          <div class="go-actions">
            <button class="go-btn lobby-ready-btn" :class="{ on: myReady }" @click="toggleReady">
              <i :class="myReady ? 'fas fa-times' : 'fas fa-check'" />
              {{ myReady ? 'ยกเลิกพร้อม' : 'พร้อมแล้ว' }}
            </button>
            <button
              v-if="isLobbyHost"
              class="go-btn lobby-start-btn"
              :disabled="!allLobbyReady"
              @click="startGame"
            >
              <i class="fas fa-play" /> เริ่มเกม
            </button>
          </div>
          <button class="go-btn go-leave lobby-leave-btn" @click="leaveGame">
            <i class="fas fa-door-open" /> ออกจากห้อง
          </button>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="reconnecting" class="reconnect-overlay">
        <div class="reconnect-box">
          <i class="fas fa-wifi" />
          <p>การเชื่อมต่อหลุด — กำลังเชื่อมต่อใหม่...</p>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="fatalError" class="reconnect-overlay">
        <div class="reconnect-box">
          <i class="fas fa-triangle-exclamation" />
          <p>{{ fatalError }}</p>
          <button v-if="versionMismatch" class="go-btn version-reload-btn" @click="reloadPage">
            <i class="fas fa-rotate" /> รีเฟรชหน้า
          </button>
          <button class="go-btn go-leave" @click="leaveGame">
            <i class="fas fa-door-open" /> กลับไปที่ล็อบบี้
          </button>
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

    <div v-if="bossZombie" class="boss-bar" :class="{ enraged: bossZombie.enraged }">
      <div class="boss-bar-label">
        <i class="fas fa-skull" /> BOSS<span v-if="bossZombie.enraged" class="boss-rage"> คลั่ง!</span>
      </div>
      <div class="boss-bar-track">
        <div class="boss-bar-fill" :style="{ width: bossHpPct + '%' }" />
      </div>
    </div>

    <div class="version-corner">
      v{{ gameVersion }}
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
            <i class="fas fa-skull" />
          </div>
          <h2>คุณตายแล้ว</h2>
          <p v-if="forcedDead">
            รีเฟรชหน้าไม่ทำให้ฟื้น — รอเกมรอบใหม่
          </p>
          <p v-else>
            รอผู้เล่นคนอื่นต่อสู้...
          </p>
          <button class="go-btn go-leave" @click="leaveGame">
            <i class="fas fa-door-open" /> กลับไปที่ล็อบบี้
          </button>
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
            <div v-for="(p, i) in topLeaderboard" :key="p.playerId || i" class="lb-row" :class="{ 'lb-first': i === 0 }">
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
import { ZOMBIE_GAME_VERSION } from '~/utils/zombieGameVersion'
import { createSnapshotDecoder } from '~/utils/zombieSnapshot'
import AudioManager from '~/utils/AudioManager'
import Interpolator from '~/utils/Interpolator'
import { ZOMBIE_SOUNDS, ZOMBIE_MUSIC, loadZombieAudioSettings, saveZombieAudioSettings } from '~/utils/zombieSounds'
import heroMWalk from '~/assets/images/hero_m_walk.png'
import heroFWalk from '~/assets/images/hero_f_walk.png'
import heroMShoot from '~/assets/images/hero_m_shoot.png'
import heroMDead from '~/assets/images/hero_m_dead.png'
import heroFShoot from '~/assets/images/hero_f_shoot.png'
import heroFDead from '~/assets/images/hero_f_dead.png'
import heroMSlide from '~/assets/images/hero_m_slide.png'
import heroFSlide from '~/assets/images/hero_f_slide.png'
import heroSpriteMeta from '~/assets/images/hero_sprites.json'

const BOSS_ABILITY_LABEL = {
  charge: { text: 'พุ่งชน!', color: '#ff6040' },
  slam: { text: 'กระทืบ!', color: '#ffcc40' },
  spit: { text: 'พ่นกรด!', color: '#ff70b0' },
  summon: { text: 'เรียกลูกน้อง!', color: '#c49bff' },
  enrage: { text: 'คลั่ง!!', color: '#ff3000' }
}

const COMBO_SCORE_AT = 10
const COMBO_DROP_AT = 25

const STICK_RADIUS = 46
const STICK_DEADZONE = 0.18

export default {
  name: 'GameRoom',
  middleware: 'middlewareAuth',
  data () {
    const audioSettings = loadZombieAudioSettings()
    return {
      roomId: this.$route.params.id,
      gameVersion: ZOMBIE_GAME_VERSION,
      versionMismatch: '',
      soundOpen: false,
      musicVol: audioSettings.musicVol,
      sfxVol: audioSettings.sfxVol,
      audioMuted: audioSettings.muted,
      myId: null,
      players: [],
      zombies: [],
      bullets: [],
      projectiles: [],
      pickups: [],
      barrels: [],
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
      user: null,
      isTouch: false,
      reconnecting: false,
      joined: false,
      moveStick: { active: false, id: null, x: 0, y: 0, which: 'move' },
      aimStick: { active: false, id: null, x: 0, y: 0, which: 'aim' },
      lastTouchShot: 0,
      shootFx: {},
      atkSeen: {},
      deathFx: {},
      fatalError: '',
      mouseAimed: false,
      dashReady: true,
      dashCooldownMs: 3000,
      forcedDead: false,
      inLobby: false,
      lobbyPlayers: [],
      lobbyHostId: null,
      lobbyError: ''
    }
  },
  computed: {
    musicWanted () {
      return this.joined && !this.inLobby && !this.gameOver && !this.fatalError
    },
    myPlayer () {
      return this.players.find(p => p.id === this.myId) || null
    },
    myScore () {
      const s = this.leaderboard.find(x => x.playerId === this.myId)
      return s ? s.score : (this.myPlayer ? this.myPlayer.score : 0)
    },
    hpPct () {
      if (!this.myPlayer) { return 0 }
      return (this.myPlayer.hp / this.myPlayer.maxHp) * 100
    },
    myHp () {
      const hp = this.myPlayer ? this.myPlayer.hp : 0
      return Math.round(hp * 100) / 100
    },
    hpColor () {
      const pct = this.hpPct
      if (pct > 60) { return '#00ff50' }
      if (pct > 30) { return '#ffcc00' }
      return '#ff4040'
    },
    topLeaderboard () {
      return this.leaderboard.slice(0, 10)
    },
    miniLeaderboard () {
      return this.leaderboard.slice(0, this.isTouch ? 4 : 6)
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
      if (this.forcedDead) { return true }
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
    comboBonusText () {
      if (this.combo >= COMBO_DROP_AT) { return 'คะแนน ×1.5 · ดรอป +50%' }
      if (this.combo >= COMBO_SCORE_AT) { return 'คะแนน ×1.5' }
      return ''
    },
    comboClass () {
      if (this.combo >= COMBO_DROP_AT) { return 'combo-x2' }
      if (this.combo >= COMBO_SCORE_AT) { return 'combo-x1.5' }
      if (this.combo >= 5) { return 'combo-x1.2' }
      return ''
    },
    myReady () {
      const me = this.lobbyPlayers.find(p => p.id === this.myId)
      return !!(me && me.ready)
    },
    isLobbyHost () {
      return !!(this.user && this.lobbyHostId && String(this.lobbyHostId) === String(this.user._id))
    },
    allLobbyReady () {
      return this.lobbyPlayers.length > 0 && this.lobbyPlayers.every(p => p.ready)
    },
    lobbyHintText () {
      if (this.isLobbyHost) {
        return this.allLobbyReady ? 'ผู้เล่นพร้อมครบแล้ว กดเริ่มเกมได้เลย' : 'รอผู้เล่นทุกคนกดพร้อมก่อนเริ่มเกม'
      }
      return 'รอหัวห้องกดเริ่มเกม'
    }
  },
  watch: {
    musicWanted (on) {
      if (on) { this.audio.playMusic('fight') } else { this.audio.stopMusic() }
    },
    myReloading (now, before) {
      if (now && !before) { this.sfx('reload', { volume: 0.6, jitter: 0.02 }) }
    },
    musicVol () { this.applyAudioSettings() },
    sfxVol () { this.applyAudioSettings() },
    audioMuted () { this.applyAudioSettings() }
  },
  created () {
    this.decodeSnapshot = createSnapshotDecoder()
    this.interp = new Interpolator()
    this.audio = new AudioManager({ sounds: ZOMBIE_SOUNDS, music: ZOMBIE_MUSIC })
    this.applyAudioSettings(false)
    this._armedSeen = new Set()
    this._nextGroanAt = 0
  },
  mounted () {
    this.$refs.gamePage.focus()

    this.isTouch = (typeof window !== 'undefined') &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)

    const stored = localStorage.getItem('userData')
    this.user = stored ? JSON.parse(stored) : { username: 'Guest', fullname: 'Guest' }

    this.forcedDead = this._readDeadFlag()

    this.setupCanvas()
    this.$nextTick(() => requestAnimationFrame(this.setupCanvas))
    this.setupSocketListeners()
    this.setupRenderer()

    this.joinGame()
    this._joinRetry = setInterval(() => {
      if (!this.joined) { this.joinGame() }
    }, 3500)

    this.inputInterval = setInterval(() => this.sendInput(), 50)

    this.renderLoop()

    window.addEventListener('pointerdown', this.unlockAudio)
    window.addEventListener('keydown', this.unlockAudio)
    window.addEventListener('touchstart', this.unlockAudio)
    window.addEventListener('resize', this.setupCanvas)
    window.addEventListener('orientationchange', this._onOrientationChange)
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
    clearInterval(this._joinRetry)
    clearTimeout(this._reinforceT)
    clearTimeout(this._dashCdT)
    clearTimeout(this._comboT)
    clearTimeout(this._orientT)
    clearTimeout(this._lobbyErrT)
    this.audio.destroy()
    window.removeEventListener('pointerdown', this.unlockAudio)
    window.removeEventListener('keydown', this.unlockAudio)
    window.removeEventListener('touchstart', this.unlockAudio)
    window.removeEventListener('resize', this.setupCanvas)
    window.removeEventListener('orientationchange', this._onOrientationChange)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.clearKeys)
    window.removeEventListener('touchmove', this.onStickMove)
    window.removeEventListener('touchend', this.onStickEnd)
    window.removeEventListener('touchcancel', this.onStickEnd)
  },
  methods: {
    unlockAudio () {
      this.audio.unlock()
    },

    applyAudioSettings (save = true) {
      this.audio.setMusicVolume(this.audioMuted ? 0 : this.musicVol / 100)
      this.audio.setSfxVolume(this.audioMuted ? 0 : this.sfxVol / 100)
      if (save) { saveZombieAudioSettings({ musicVol: this.musicVol, sfxVol: this.sfxVol, muted: this.audioMuted }) }
    },

    toggleMute () {
      this.audioMuted = !this.audioMuted
    },

    previewSfx () {
      this.sfx('select', { volume: 0.8, jitter: 0 })
    },

    _ear () {
      const me = this.myPlayer
      if (me && (me.alive || me.downed)) { return { x: me.x, y: me.y } }
      return { x: this.camX + this.canvasW / 2, y: this.camY + this.canvasH / 2 }
    },

    sfx (name, opts = {}) {
      if (opts.x != null) { opts.listener = this._ear() }
      this.audio.play(name, opts)
    },

    _stateSounds (now) {
      const ear = this._ear()
      const armed = new Set()
      for (const z of this.zombies) {
        if (z.state !== 'armed') { continue }
        armed.add(z.id)
        if (!this._armedSeen.has(z.id)) { this.sfx('fuse', { x: z.x, y: z.y, volume: 0.7, maxVoices: 3 }) }
      }
      this._armedSeen = armed

      if (now < this._nextGroanAt || !this.zombies.length) { return }
      const near = this.zombies.filter(z => Math.hypot(z.x - ear.x, z.y - ear.y) < 750)
      this._nextGroanAt = now + Math.max(900, 4200 - this.zombies.length * 90) * (0.6 + Math.random() * 0.8)
      if (!near.length) { return }
      const z = near[(Math.random() * near.length) | 0]
      const name = z.type === 'boss' ? 'roar' : z.type === 'runner' ? 'screech' : (z.type === 'tank' ? 'growl' : 'groan')
      this.sfx(name, { x: z.x, y: z.y, volume: z.type === 'boss' ? 0.9 : 0.55, rate: z.type === 'tank' ? 0.8 : (z.type === 'boss' ? 0.7 : 1), jitter: 0.1, maxVoices: 3 })
    },

    _onOrientationChange () {
      this.setupCanvas()
      clearTimeout(this._orientT)
      this._orientT = setTimeout(() => this.setupCanvas(), 300)
    },

    setupCanvas () {
      const canvas = this.$refs.canvas
      if (!canvas) { return }
      const rect = canvas.getBoundingClientRect()
      const w = Math.round(rect.width) || window.innerWidth
      const h = Math.round(rect.height) || Math.max(1, window.innerHeight - 60)
      canvas.width = w
      canvas.height = h
      this.canvasW = w
      this.canvasH = h
    },

    canvasPoint (e) {
      const canvas = this.$refs.canvas
      if (!canvas) { return { x: 0, y: 0 } }
      const rect = canvas.getBoundingClientRect()
      const sx = rect.width ? canvas.width / rect.width : 1
      const sy = rect.height ? canvas.height / rect.height : 1
      return {
        x: (e.clientX - rect.left) * sx,
        y: (e.clientY - rect.top) * sy
      }
    },

    setupRenderer () {
      this.renderer = new GameRenderer(this.$refs.canvas)
      this.renderer.loadHeroSprites({
        m: { walk: heroMWalk, shoot: heroMShoot, dead: heroMDead, slide: heroMSlide },
        f: { walk: heroFWalk, shoot: heroFShoot, dead: heroFDead, slide: heroFSlide }
      }, heroSpriteMeta)
    },

    renderLoop () {
      this.rafId = requestAnimationFrame(() => this.renderLoop())
      const view = this.interp.sample(Date.now())
      const players = view ? view.players : this.players
      this.updateCamera(players.find(p => p.id === this.myId))
      if (this.renderer) {
        this.renderer.draw({
          players,
          zombies: view ? view.zombies : this.zombies,
          bullets: view ? view.bullets : this.bullets,
          projectiles: this.projectiles,
          pickups: this.pickups,
          barrels: this.barrels,
          shootFx: this.shootFx,
          deathFx: this.deathFx,
          myId: this.myId,
          camX: this.camX,
          camY: this.camY,
          mapW: this.mapW,
          mapH: this.mapH,
          showMinimap: !this.isTouch
        })
      }
    },

    updateCamera (viewMe) {
      const p = viewMe || this.myPlayer
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
      if (k === 'm' && !e.repeat && !/^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || '')) {
        this.toggleMute()
        return
      }
      if (!gameKeys.includes(k)) { return }
      const wasDown = this.keys[k]
      this.keys[k] = true
      if (k === 'r' && !wasDown) { this.emitReload() }
      if (k === ' ' && !wasDown) { this.doDash() }
      e.preventDefault()
    },

    emitReload () {
      if (this.forcedDead) { return }
      this.$socket.emit('playerReload')
    },

    doDash () {
      if (!this.myId || this.forcedDead) { return }
      const dx = (this.keys.d || this.keys.arrowright ? 1 : 0) - (this.keys.a || this.keys.arrowleft ? 1 : 0)
      const dy = (this.keys.s || this.keys.arrowdown ? 1 : 0) - (this.keys.w || this.keys.arrowup ? 1 : 0)
      const stickMove = this.moveStick.active && (this.moveStick.x || this.moveStick.y)
      const aiming = this.aimStick.active && (this.aimStick.x || this.aimStick.y)
      const payload = { dx, dy, angle: undefined }
      if (stickMove) { payload.dx = this.moveStick.x; payload.dy = this.moveStick.y }
      if (!dx && !dy && !stickMove) {
        payload.angle = aiming ? Math.atan2(this.aimStick.y, this.aimStick.x) : this.getShootAngle()
      }
      this.$socket.emit('playerDash', payload)
    },
    onKeyUp (e) {
      this.keys[e.key.toLowerCase()] = false
    },
    clearKeys () {
      this.keys = {}
    },
    refocusGame () {
      this.soundOpen = false
      if (this.$refs.gamePage) { this.$refs.gamePage.focus({ preventScroll: true }) }
    },
    onMouseMove (e) {
      const p = this.canvasPoint(e)
      this.mouseX = p.x
      this.mouseY = p.y
      this.mouseAimed = true
    },
    onMouseDown (e) {
      if (e.button !== 0 || this.forcedDead) { return }
      const p = this.canvasPoint(e)
      this.mouseX = p.x
      this.mouseY = p.y
      this.mouseAimed = true
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
      if (this.upgradeBusy || this.forcedDead) { return }
      this.upgradeBusy = true
      this.sfx('select', { volume: 0.6, jitter: 0 })
      this.$socket.emit('upgradePick', { key })
      this.clearKeys()
      this.$nextTick(() => {
        if (this.$refs.gamePage) { this.$refs.gamePage.focus() }
      })
    },

    sendInput () {
      if (!this.myId || this.forcedDead) { return }

      const kdx = (this.keys.d || this.keys.arrowright ? 1 : 0) -
                  (this.keys.a || this.keys.arrowleft ? 1 : 0)
      const kdy = (this.keys.s || this.keys.arrowdown ? 1 : 0) -
                  (this.keys.w || this.keys.arrowup ? 1 : 0)

      const stickActive = this.moveStick.active && (this.moveStick.x !== 0 || this.moveStick.y !== 0)
      const aiming = this.aimStick.active && (this.aimStick.x !== 0 || this.aimStick.y !== 0)

      let dx = 0
      let dy = 0
      if (kdx !== 0 || kdy !== 0) {
        dx = kdx
        dy = kdy
      } else if (stickActive) {
        dx = this.moveStick.x
        dy = this.moveStick.y
      }

      let angle
      if (aiming) {
        angle = Math.atan2(this.aimStick.y, this.aimStick.x)
      } else if (this.mouseAimed) {
        angle = this.getShootAngle()
      } else if (dx !== 0 || dy !== 0) {
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

    _onVersionMismatch (serverVersion) {
      clearInterval(this._joinRetry)
      this.versionMismatch = serverVersion || '?'
      this.fatalError = `เกมมีเวอร์ชันใหม่ (เซิร์ฟเวอร์ v${this.versionMismatch} แต่หน้านี้ v${ZOMBIE_GAME_VERSION}) — กรุณารีเฟรชหน้า ถ้ายังขึ้นอยู่ให้รอสักครู่แล้วลองใหม่`
    },

    reloadPage () {
      window.location.reload()
    },

    joinGame () {
      let skin = null
      try { skin = localStorage.getItem('gameSkin') } catch (e) {}
      this.$socket.emit('gameJoin', {
        roomId: this.roomId,
        version: ZOMBIE_GAME_VERSION,
        user: { ...this.user, skin: skin === 'f' ? 'f' : (skin === 'm' ? 'm' : undefined) }
      })
    },

    setupSocketListeners () {
      this.$socket.on('connect', this.onSocketReconnect)
      this.$socket.on('disconnect', this.onSocketDrop)

      this.$socket.on('gameJoined', ({ playerId, mapSize, map, gameOver, leaderboard, started, lobby }) => {
        this.myId = playerId
        this.interp.reset()
        this.joined = true
        this.reconnecting = false
        this.fatalError = ''
        clearInterval(this._joinRetry)
        if (mapSize) { this.mapW = mapSize.w; this.mapH = mapSize.h }
        if (map && this.renderer) { this.renderer.setMap(map) }
        if (gameOver) {
          this.gameOver = true
          if (leaderboard) { this.leaderboard = leaderboard }
        }
        this.inLobby = !started && !gameOver
        if (lobby) {
          this.lobbyHostId = lobby.hostId
          this.lobbyPlayers = lobby.players || []
        }
      })

      this.$socket.on('lobbyUpdate', ({ hostId, started, players }) => {
        this.lobbyHostId = hostId
        this.lobbyPlayers = players || []
        if (started) { this.inLobby = false }
      })

      this.$socket.on('matchStarted', () => {
        this.inLobby = false
      })

      this.$socket.on('gameError', ({ error, serverVersion }) => {
        if (error === 'version_mismatch') {
          this._onVersionMismatch(serverVersion)
          return
        }
        if (['not_host', 'not_all_ready', 'empty_room', 'already_started'].includes(error)) {
          this.lobbyError = error === 'not_all_ready'
            ? 'ผู้เล่นยังไม่พร้อมครบทุกคน'
            : error === 'not_host'
              ? 'มีแค่หัวห้องเท่านั้นที่เริ่มเกมได้'
              : error === 'empty_room'
                ? 'ห้องว่างไป ไม่สามารถเริ่มได้'
                : 'เกมเริ่มไปแล้ว'
          clearTimeout(this._lobbyErrT)
          this._lobbyErrT = setTimeout(() => { this.lobbyError = '' }, 3000)
          return
        }
        clearInterval(this._joinRetry)
        if (error === 'unauthorized') {
          this.fatalError = 'เซสชันหมดอายุ — กรุณาเข้าสู่ระบบใหม่'
        } else if (error === 'room_full') {
          this.fatalError = 'ห้องนี้เต็มแล้ว (สูงสุด 8 คน) — ลองห้องอื่นหรือสร้างใหม่'
        } else if (error === 'game_already_started') {
          this.fatalError = 'ห้องนี้เริ่มเกมไปแล้ว เข้าร่วมเพิ่มไม่ได้ — ลองห้องอื่นหรือสร้างห้องใหม่'
        } else {
          this.fatalError = 'เข้าห้องเกมไม่สำเร็จ ลองกลับไปที่ล็อบบี้แล้วเข้าใหม่'
        }
      })

      this.$socket.on('gameState', (msg) => {
        const now = Date.now()
        const state = this.decodeSnapshot(msg, now)
        this.interp.push(state.serverTime, state, now)
        this.players = state.players
        for (const p of this.players) {
          if (p.lastAttackTime && this.atkSeen[p.id] !== p.lastAttackTime) {
            const heard = this.atkSeen[p.id] !== undefined
            this.atkSeen[p.id] = p.lastAttackTime
            this.$set(this.shootFx, p.id, now + 240)
            if (heard) {
              const mine = p.id === this.myId
              this.sfx('shoot', { x: p.x, y: p.y, volume: mine ? 0.5 : 0.3, maxVoices: 8, jitter: 0.06 })
            }
          }
        }
        this.zombies = state.zombies
        this.bullets = state.bullets
        this.projectiles = state.projectiles
        this.pickups = state.pickups
        this.barrels = state.barrels
        this.wave = state.wave
        this.waveActive = state.waveActive
        if (typeof state.waveTimeLeft === 'number') { this.waveTimer = state.waveTimeLeft }

        if (state.scores && state.scores.length > 0) {
          this.leaderboard = state.scores
        }
        this._stateSounds(now)
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
        this.sfx('waveStart', { volume: 0.6 })
        if (boss) { this.sfx('roar', { volume: 1, rate: 0.6, jitter: 0 }) }
        setTimeout(() => { this.waveAnnounce = false }, 2800)
        this._startCountdown()
      })

      this.$socket.on('playerDied', ({ playerId }) => {
        const p = this.players.find(x => x.id === playerId)
        if (p && this.renderer) { this.renderer.bloodSplat(p.x, p.y, true) }
        this.$set(this.deathFx, playerId, Date.now())
        if (playerId === this.myId) {
          this.sfx('down', { volume: 0.8, rate: 0.8, jitter: 0 })
        } else if (p) {
          this.sfx('down', { x: p.x, y: p.y, volume: 0.5, rate: 0.8 })
        }
        if (playerId === this.myId) {
          this.upgradeOffer = null
          this.upgradeBusy = false
          this.combo = 0
          clearTimeout(this._comboT)
          this._setDeadFlag()
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
        if (playerId === this.myId) {
          this.sfx('down', { volume: 0.8 })
        } else if (p) {
          this.sfx('down', { x: p.x, y: p.y, volume: 0.6 })
        }
        if (playerId === this.myId) {
          this.upgradeOffer = null
          this.upgradeBusy = false
          this.combo = 0
          clearTimeout(this._comboT)
          if (this.renderer) { this.renderer.shake(10) }
        }
      })

      this.$socket.on('playerRevived', ({ playerId }) => {
        this.$delete(this.deathFx, playerId)
        const p = this.players.find(x => x.id === playerId)
        if (p && this.renderer) {
          this.renderer.spark(p.x, p.y, '#40ff78')
          this.renderer.floatText(p.x, p.y - 24, 'REVIVED', '#40ff78')
        }
        if (p) { this.sfx('revive', { x: p.x, y: p.y, volume: playerId === this.myId ? 0.8 : 0.6 }) }
      })

      this.$socket.on('playerHit', ({ playerId, damage }) => {
        const p = this.players.find(x => x.id === playerId)
        if (!p || !this.renderer) { return }
        this.renderer.bloodSplat(p.x, p.y, false)
        if (playerId === this.myId) {
          this.renderer.shake(Math.min(8, 2 + damage / 6))
          this.sfx('hurt', { volume: 0.7, maxVoices: 2, minGap: 0.08 })
        } else {
          this.sfx('hurt', { x: p.x, y: p.y, volume: 0.35, maxVoices: 2, minGap: 0.08 })
        }
      })

      this.$socket.on('pickupCollected', ({ playerId, type, x, y }) => {
        if (this.renderer) {
          this.renderer.spark(x, y, type === 'ammo' ? '#ffcc40' : '#40ff78')
        }
        this.sfx(type === 'ammo' ? 'pickupAmmo' : 'pickupHealth', { x, y, volume: playerId === this.myId ? 0.8 : 0.45 })
      })

      this.$socket.on('playerDash', ({ playerId, x, y, angle }) => {
        if (this.renderer) { this.renderer.dashPuff(x, y, angle) }
        this.sfx('dash', { x, y, volume: playerId === this.myId ? 0.6 : 0.3 })
        if (playerId === this.myId) {
          this.dashReady = false
          clearTimeout(this._dashCdT)
          this._dashCdT = setTimeout(() => { this.dashReady = true }, this.dashCooldownMs)
          if (this.renderer) { this.renderer.shake(4) }
        }
      })

      this.$socket.on('zombieBlast', ({ kind, x, y, radius }) => {
        if (kind === 'slam') {
          this.sfx('slam', { x, y, volume: 1, rate: 0.7, maxVoices: 2 })
        } else {
          this.sfx(kind === 'barrel' ? 'explodeBig' : 'explodeSmall', { x, y, volume: kind === 'barrel' ? 1 : 0.85, maxVoices: 4 })
        }
        if (!this.renderer) { return }
        this.renderer.explosion(x, y, radius, kind)
        const me = this.myPlayer
        const dist = me ? Math.hypot(me.x - x, me.y - y) : Infinity
        const reach = (radius || 100) * 2.4
        if (dist < reach) { this.renderer.shake((kind === 'slam' ? 11 : 9) * (1 - dist / reach) + 2) }
      })

      this.$socket.on('bossAbility', ({ ability, x, y }) => {
        if (ability === 'spit') {
          this.sfx('die', { x, y, volume: 0.8, rate: 1.3 })
        } else {
          const rate = { charge: 0.8, slam: 0.9, summon: 1, enrage: 0.6 }[ability] || 1
          this.sfx('roar', { x, y, volume: 1, rate, jitter: 0.03, maxVoices: 2 })
        }
        if (!this.renderer) { return }
        const label = BOSS_ABILITY_LABEL[ability]
        if (label) { this.renderer.floatText(x, y - 70, label.text, label.color) }
        if (ability === 'enrage') {
          this.renderer.burst(x, y, 40, ['#ff3000', '#ffcc40', '#ff6020'], { speed: 260, size: 4 })
          this.renderer.shake(8)
        } else if (ability === 'summon') {
          this.renderer.burst(x, y, 24, ['#6b4fd0', '#9be03c', '#cf4fb2'], { speed: 200, size: 3 })
        }
      })

      this.$socket.on('zombieKilled', ({ playerId, score, kills, comboCount, comboMult, zombieType, x, y, gained }) => {
        if (this.renderer && x != null) {
          const big = zombieType === 'boss' || zombieType === 'tank'
          const boosted = comboMult > 1
          this.renderer.bloodSplat(x, y, big)
          if (gained) { this.renderer.floatText(x, y, '+' + gained, boosted ? '#ff4fa0' : (big ? '#ffcc40' : '#00ff50')) }
          if (zombieType === 'boss') { this.renderer.shake(10) }
        }
        if (x != null) {
          if (zombieType === 'boss') {
            this.sfx('roar', { x, y, volume: 1, rate: 0.5, jitter: 0 })
          } else if (zombieType !== 'bomber') {
            this.sfx('die', { x, y, volume: zombieType === 'tank' ? 0.7 : 0.45, rate: zombieType === 'tank' ? 0.75 : 1, maxVoices: 4, minGap: 0.03 })
          }
        }
        if (playerId && playerId === this.myId) {
          this.combo = comboCount || 1
          this.maxCombo = Math.max(this.maxCombo, this.combo)
          this.lastKillTime = Date.now()
          clearTimeout(this._comboT)
          this._comboT = setTimeout(() => { this.combo = 0 }, this.comboTimeWindow)

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
        this._clearDeadFlag()
        clearInterval(this.countdownInterval)
        this.sfx('gameover', { volume: 0.8, jitter: 0 })
      })

      this.$socket.on('gameRestarted', () => {
        this.gameOver = false
        this.forcedDead = false
        this._clearDeadFlag()
        this.wave = 0
        this.combo = 0
        this.maxCombo = 0
        this.players = []
        this.zombies = []
        this.bullets = []
        this.pickups = []
        this.barrels = []
        this.projectiles = []
        this.leaderboard = []
        this.myUpgrades = []
        this.upgradeOffer = null
        this.deathFx = {}
        this.shootFx = {}
        this.atkSeen = {}
        this.interp.reset()
        if (this.renderer) {
          this.renderer.decals = []
          this.renderer.particles = []
        }
      })

      this.$socket.on('waveReinforce', ({ count }) => {
        this.reinforceMsg = `หมดเวลา! กำลังเสริม ${count} ตัว`
        this.sfx('roar', { volume: 0.8, rate: 0.85 })
        clearTimeout(this._reinforceT)
        this._reinforceT = setTimeout(() => { this.reinforceMsg = '' }, 3000)
      })

      this.$socket.on('upgradeOffer', ({ choices, picks }) => {
        if (!this.upgradeOffer) { this.sfx('waveClear', { volume: 0.7, jitter: 0 }) }
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
        'gameJoined', 'gameError', 'gameState', 'waveCountdown', 'waveStart', 'playerHit',
        'playerDied', 'playerDowned', 'playerRevived', 'playerDash', 'zombieKilled', 'gameOver',
        'gameRestarted', 'waveReinforce', 'pickupCollected', 'upgradeOffer', 'upgradeApplied',
        'lobbyUpdate', 'matchStarted', 'zombieBlast', 'bossAbility'
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
      this.joined = false
      this.myId = null
      this.joinGame()
      clearInterval(this._joinRetry)
      this._joinRetry = setInterval(() => {
        if (!this.joined) { this.joinGame() } else { clearInterval(this._joinRetry) }
      }, 3000)
    },

    _startCountdown () {
      clearInterval(this.countdownInterval)
      this.waveCountdown = 0
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

    toggleReady () {
      this.$socket.emit('gameReady', { ready: !this.myReady })
    },

    startGame () {
      this.$socket.emit('gameStart')
    },

    getPlayerName (playerId) {
      const player = this.players.find(p => p.id === playerId)
      return player ? player.username : 'Unknown'
    },

    _deadKey () {
      return 'raisara:gameDead:' + this.roomId
    },
    _readDeadFlag () {
      try {
        const t = parseInt(sessionStorage.getItem(this._deadKey()) || '0', 10)
        if (t && Date.now() - t < 15 * 60 * 1000) { return true }
        sessionStorage.removeItem(this._deadKey())
        return false
      } catch (e) { return false }
    },
    _setDeadFlag () {
      try { sessionStorage.setItem(this._deadKey(), String(Date.now())) } catch (e) {}
    },
    _clearDeadFlag () {
      try { sessionStorage.removeItem(this._deadKey()) } catch (e) {}
    }
  }
}

// eslint-disable-next-line no-undef
if (typeof module !== 'undefined' && module.hot) { module.hot.decline() }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.game-page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: #080c10;
  overflow: hidden;
  position: relative;
  outline: none;
  display: flex;
  flex-direction: column;
}

.hud {
  min-height: 60px;
  background: rgba(0,0,0,0.85);
  border-bottom: 1px solid rgba(0,255,80,0.2);
  display: flex;
  align-items: center;
  padding: env(safe-area-inset-top) max(20px, env(safe-area-inset-right)) 0 max(20px, env(safe-area-inset-left));
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

.dash-pip {
  position: relative;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(0,255,80,0.45);
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff50;
  font-size: 12px;
  overflow: hidden;
  flex-shrink: 0;
}
.dash-pip.cooling {
  border-color: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.35);
}
.dash-pip.cooling::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.14);
  height: 100%;
  animation: dash-cd var(--dash-cd, 3000ms) linear forwards;
}
@keyframes dash-cd { from { height: 100%; } to { height: 0; } }
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
.combo-bonus {
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  color: #ffcc40;
}
.combo-display:has(.combo-bonus) { padding-top: 3px; padding-bottom: 3px; }
.combo-display:has(.combo-bonus) .combo-num { font-size: 20px; line-height: 1.05; }
.combo-display.combo-x2 .combo-bonus { color: #ff4fa0; }
.combo-display.combo-x1\.2 { border-color: rgba(0,200,255,0.5); }
.combo-display.combo-x1\.2 .combo-num { color: #00c8ff; text-shadow: 0 0 10px rgba(0,200,255,0.6); }
.combo-display.combo-x1\.5 { border-color: rgba(255,180,0,0.5); }
.combo-display.combo-x1\.5 .combo-num { color: #ffb400; text-shadow: 0 0 12px rgba(255,180,0,0.7); }
.combo-display.combo-x2 { border-color: rgba(255,0,100,0.6); }
.combo-display.combo-x2 .combo-num { color: #ff0064; text-shadow: 0 0 15px rgba(255,0,100,0.8); animation: combo-shake 0.5s ease-in-out; }
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

.hud.raised { position: relative; z-index: 35; }
.sound-ctl { position: relative; }
.sound-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 80, 0.3);
  color: rgba(0, 255, 80, 0.75);
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.sound-btn:hover { background: rgba(0, 255, 80, 0.1); border-color: #00ff50; color: #00ff50; }
.sound-btn.muted { border-color: rgba(255, 204, 0, 0.5); color: #ffcc00; }
.sound-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 40;
  width: 250px;
  padding: 12px 14px;
  background: rgba(6, 12, 8, 0.96);
  border: 1px solid rgba(0, 255, 80, 0.35);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sp-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 2px;
  color: #00ff50;
}
.sp-row {
  display: grid;
  grid-template-columns: 62px 1fr 28px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #d8ecd8;
}
.sp-row input { width: 100%; accent-color: #00ff50; cursor: pointer; }
.sp-row input:disabled { opacity: 0.35; cursor: not-allowed; }
.sp-row b { text-align: right; font-family: 'Share Tech Mono', monospace; color: #00ff50; font-weight: 400; }
.sp-mute {
  padding: 8px;
  border: 1px solid rgba(255, 204, 0, 0.45);
  background: rgba(255, 204, 0, 0.08);
  color: #ffd84a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.sp-mute.on { border-color: rgba(0, 255, 80, 0.5); background: rgba(0, 255, 80, 0.1); color: #00ff50; }
.sp-hint { font-size: 10px; color: rgba(216, 236, 216, 0.45); text-align: center; }

.mini-scoreboard {
  position: absolute;
  top: 70px;
  right: max(14px, env(safe-area-inset-right));
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
  max-height: 42vh;
  overflow: hidden;
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
  min-height: 0;
  min-width: 0;
  cursor: crosshair;
}

.touch-controls {
  position: absolute;
  inset: 0;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
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
  transition: none;
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

.dash-btn {
  position: absolute;
  right: 24px;
  bottom: 174px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(0, 255, 80, 0.16);
  border: 2px solid rgba(0, 255, 80, 0.55);
  color: #4dffa0;
  font-size: 20px;
  pointer-events: auto;
  touch-action: none;
  transition: opacity 0.15s ease;
}
.dash-btn.cooling {
  opacity: 0.35;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.4);
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

.loading-overlay .reconnect-box i {
  color: #00ff50;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.reconnect-box .go-btn {
  margin: 16px auto 0;
  min-width: 200px;
  animation: none;
}
.reconnect-box .go-btn i {
  font-size: 12px;
  margin: 0;
  color: inherit;
  animation: none;
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
  inset: 0;
  background: rgba(4,8,10,0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: calc(58px + env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  z-index: 45;
}
.upgrade-panel {
  text-align: center;
  padding: 28px;
  margin: auto;
  max-width: 100%;
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
  left: max(14px, env(safe-area-inset-left));
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
.boss-rage {
  color: #ffcc40;
  animation: boss-rage-blink 0.5s steps(2) infinite;
}
.boss-bar.enraged .boss-bar-track {
  border-color: #ff8040;
  box-shadow: 0 0 12px rgba(255, 80, 20, 0.6);
}
.boss-bar.enraged .boss-bar-fill {
  background: linear-gradient(90deg, #ff6000, #ffcc40);
}
@keyframes boss-rage-blink {
  50% { opacity: 0.35; }
}
.version-corner {
  position: absolute;
  right: max(10px, env(safe-area-inset-right));
  bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 9;
  pointer-events: none;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  color: rgba(0, 255, 80, 0.45);
}

.dead-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: calc(66px + env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
  background: rgba(0,0,0,0.5);
  z-index: 18;
}
.dead-box {
  text-align: center;
  background: rgba(0,0,0,0.8);
  border: 1px solid rgba(255,80,80,0.3);
  padding: 40px 60px;
  max-width: min(360px, 100%);
  margin: auto;
}
.dead-icon { font-size: 52px; color: #ff5050; margin-bottom: 12px; opacity: 0.6; }
.dead-box h2 { font-family: 'Orbitron', sans-serif; font-size: 22px; color: #ff5050; margin-bottom: 8px; }
.dead-box p { font-size: 13px; color: rgba(224,240,224,0.4); font-family: 'Share Tech Mono', monospace; }
.dead-box .go-btn { margin: 18px auto 0; min-width: 180px; }
.dead-box .go-btn i { font-size: 12px; }

.downed-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(66px + env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) calc(96px + env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
  background: rgba(60,0,0,0.35);
  z-index: 18;
  pointer-events: none;
}
.downed-box {
  text-align: center;
  background: rgba(10,0,0,0.78);
  border: 1px solid rgba(255,64,64,0.45);
  padding: 30px 44px;
  max-width: min(340px, 100%);
  margin: auto;
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
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: calc(56px + env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
  background: rgba(0,0,0,0.82);
  z-index: 30;
}
.gameover-box {
  background: rgba(8,12,16,0.98);
  border: 1px solid rgba(0,255,80,0.2);
  padding: 40px 52px;
  width: min(420px, 100%);
  margin: auto;
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

.lobby-box { width: min(440px, 100%); }

.lobby-players {
  max-height: 240px;
  overflow-y: auto;
  margin-bottom: 18px;
}

.lobby-player-header { grid-template-columns: 1fr auto; }
.lobby-player-row { grid-template-columns: 1fr auto; }

.lobby-player-name {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lobby-host-tag {
  flex-shrink: 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  letter-spacing: 1px;
  color: #080c10;
  background: #00ff50;
  padding: 2px 6px;
}

.lobby-ready-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: rgba(224,240,224,0.4);
  white-space: nowrap;
}
.lobby-ready-tag.on { color: #00ff50; }

.lobby-hint {
  font-size: 12.5px;
  color: rgba(224,240,224,0.5);
  margin-bottom: 8px;
}

.lobby-error {
  font-size: 12px;
  color: #ff6060;
  margin-bottom: 8px;
}

.lobby-ready-btn { background: #00ff50; color: #080c10; }
.lobby-ready-btn:hover { background: #80ffb0; }
.lobby-ready-btn.on { background: transparent; border: 1px solid rgba(0,255,80,0.4); color: #00ff50; }
.lobby-ready-btn.on:hover { background: rgba(0,255,80,0.1); }

.lobby-start-btn { background: #ffcc00; color: #080c10; }
.lobby-start-btn:hover:not(:disabled) { background: #ffe066; }
.lobby-start-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.lobby-leave-btn { width: 100%; margin-top: 12px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter, .fade-leave-to { opacity: 0; }
.wave-fade-enter-active, .wave-fade-leave-active { transition: opacity 0.5s; }
.wave-fade-enter, .wave-fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .hud {
    padding: env(safe-area-inset-top) max(12px, env(safe-area-inset-right)) 0 max(12px, env(safe-area-inset-left));
    gap: 10px;
  }
  .hud-left, .hud-right {
    min-width: 0;
    gap: 8px;
    flex-shrink: 0;
  }
  .hud-center { min-width: 0; }
  .wave-countdown, .timer-display { white-space: nowrap; }
  .hp-bar { width: 90px; }
  .wave-num { font-size: 20px; }
  .wave-label { font-size: 9px; }
  .score-num { font-size: 15px; }
  .combo-display { padding: 4px 10px; margin-left: 8px; }
  .combo-num { font-size: 18px; }
  .combo-bonus { font-size: 9px; }
  .escape-btn, .sound-btn { width: 32px; height: 32px; font-size: 12px; }

  .mini-scoreboard {
    top: 64px;
    right: max(8px, env(safe-area-inset-right));
    min-width: 150px;
  }
  .sb-row { font-size: 10.5px; padding: 4px 8px; }
  .sb-kills { display: none; }

  .boss-bar {
    top: 62px;
    left: max(12px, env(safe-area-inset-left));
    right: calc(160px + env(safe-area-inset-right));
    width: auto;
    transform: none;
  }

  .wave-announce-inner { padding: 20px 32px; }
  .wave-announce-inner h2 { font-size: 32px; }
  .wa-tag { font-size: 10px; }

  .dead-box { padding: 28px 36px; }
  .dead-icon { font-size: 40px; }
  .dead-box h2 { font-size: 18px; }

  .downed-box { padding: 22px 26px; }
  .downed-icon { font-size: 34px; }
  .downed-box h2 { font-size: 17px; }

  .gameover-box {
    min-width: 0;
    width: 90vw;
    padding: 28px 24px;
  }
  .gameover-box h2 { font-size: 17px; }
  .lb-row, .lb-header { font-size: 11.5px; }
}

@media (max-width: 480px) {
  .combo-bonus { display: none; }
  .score-display { display: none; }
  .hud { min-height: 50px; padding: calc(5px + env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) 5px max(8px, env(safe-area-inset-left)); gap: 6px; }
  .hud-label { font-size: 7.5px; }
  .wave-display { align-items: center; }
  .timer-display { margin-top: 2px; padding: 1px 6px; }
  .hp-bar { width: 60px; height: 6px; }
  .hp-num { font-size: 11px; min-width: 22px; }
  .wave-num { font-size: 16px; }
  .wave-countdown, .timer-display { font-size: 10px; padding: 2px 8px; }
  .score-num { font-size: 12px; }
  .combo-display { padding: 3px 8px; margin-left: 4px; }
  .combo-num { font-size: 14px; }
  .escape-btn, .sound-btn { width: 28px; height: 28px; }

  .mini-scoreboard { min-width: 120px; top: 58px; }
  .sb-row { font-size: 9.5px; gap: 4px; padding: 3px 6px; }

  .wave-announce-inner { padding: 14px 20px; }
  .wave-announce-inner h2 { font-size: 24px; }

  .dead-box { padding: 20px 24px; }
  .dead-box h2 { font-size: 16px; }
  .dead-box p { font-size: 11px; }

  .downed-box { padding: 16px 18px; }
  .downed-icon { font-size: 30px; }
  .downed-box h2 { font-size: 15px; }
  .downed-box p { font-size: 11px; margin-bottom: 10px; }
  .bleed-track { width: 170px; }

  .gameover-box { width: 94vw; padding: 20px 16px; }
  .go-actions { flex-direction: column; }
  .go-btn { font-size: 11px; padding: 11px; }
}

@media (orientation: landscape) and (max-height: 460px) {
  .combo-bonus { display: none; }
  .hud { min-height: 40px; }
  .hud-label { font-size: 8px; }
  .hp-bar { width: 72px; }
  .hp-num { font-size: 11px; }
  .wave-display { align-items: center; }
  .wave-num { font-size: 15px; }
  .wave-label { font-size: 8px; }
  .wave-countdown, .timer-display { font-size: 9px; padding: 1px 6px; margin-top: 0; }
  .score-num { font-size: 12px; }
  .combo-display { padding: 2px 8px; }
  .combo-num { font-size: 14px; }
  .escape-btn, .sound-btn { width: 26px; height: 26px; }

  .joystick-pad { width: 112px; height: 112px; bottom: 12px; }
  .joystick-knob { width: 46px; height: 46px; }
  .reload-btn { right: 140px; bottom: 22px; width: 44px; height: 44px; font-size: 17px; }
  .dash-btn { right: 18px; bottom: 132px; width: 44px; height: 44px; font-size: 17px; }

  .mini-scoreboard { top: 44px; max-height: 56vh; }
  .upgrade-tags { top: 46px; }
  .boss-bar { top: 44px; }
}
</style>
