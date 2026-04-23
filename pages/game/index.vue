<template>
  <div class="game-lobby">
    <!-- bg grid -->
    <div class="grid-bg" />
    <div class="scanline" />

    <header class="lobby-header">
      <nuxt-link to="/chat/chat" class="back-btn">
        <i class="fas fa-arrow-left" />
      </nuxt-link>
      <div class="title-block">
        <span class="title-tag">MULTIPLAYER</span>
        <h1>ZOMBIE STRIKE</h1>
        <p>เอาตัวรอดให้นานที่สุด — เล่นกับเพื่อนทุกคน</p>
      </div>
      <div class="player-chip">
        <img v-if="user?.avatar" :src="user.avatar" class="chip-avatar">
        <div v-else class="chip-avatar-placeholder">
          {{ initials }}
        </div>
        <span>{{ user?.username || user?.fullname || 'Guest' }}</span>
      </div>
    </header>

    <main class="lobby-body">
      <!-- Create room -->
      <section class="create-panel">
        <h2><i class="fas fa-plus-circle" /> สร้างห้องใหม่</h2>
        <div class="create-form">
          <input
            v-model="newRoomName"
            type="text"
            placeholder="ชื่อห้อง เช่น Zone-7..."
            maxlength="24"
            class="room-input"
            @keyup.enter="createRoom"
          >
          <button class="create-btn" :disabled="!newRoomName.trim()" @click="createRoom">
            <i class="fas fa-radiation" /> เริ่มเกม
          </button>
        </div>
      </section>

      <!-- Active rooms -->
      <section class="rooms-panel">
        <div class="rooms-header">
          <h2><i class="fas fa-broadcast-tower" /> ห้องที่กำลังเล่น</h2>
          <button class="refresh-btn" :class="{ spin: refreshing }" @click="loadRooms">
            <i class="fas fa-sync-alt" />
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="pulse-ring" />
          <span>กำลังสแกนพื้นที่...</span>
        </div>

        <div v-else-if="rooms.length === 0" class="empty-state">
          <div class="empty-icon">
            ☣
          </div>
          <p>ไม่มีห้องที่กำลังเล่น</p>
          <span>สร้างห้องใหม่เพื่อเริ่มต้น</span>
        </div>

        <div v-else class="rooms-grid">
          <div
            v-for="room in rooms"
            :key="room.roomId"
            class="room-card"
            :class="{ 'room-over': room.gameOver }"
            @click="!room.gameOver && joinRoom(room.roomId)"
          >
            <div class="room-card-top">
              <span class="room-name">{{ room.roomId }}</span>
              <span class="room-badge" :class="room.gameOver ? 'badge-over' : 'badge-live'">
                {{ room.gameOver ? 'ENDED' : 'LIVE' }}
              </span>
            </div>
            <div class="room-card-stats">
              <div class="stat">
                <i class="fas fa-users" />
                <span>{{ room.playerCount }} ผู้เล่น</span>
              </div>
              <div class="stat">
                <i class="fas fa-skull-crossbones" />
                <span>Wave {{ room.wave }}</span>
              </div>
            </div>
            <button v-if="!room.gameOver" class="join-btn">
              เข้าร่วม <i class="fas fa-chevron-right" />
            </button>
            <div v-else class="ended-label">
              จบเกมแล้ว
            </div>
          </div>
        </div>
      </section>

      <!-- How to play -->
      <section class="howto-panel">
        <h2><i class="fas fa-gamepad" /> วิธีเล่น</h2>
        <div class="controls-grid">
          <div class="ctrl-item">
            <div class="ctrl-key">
              WASD
            </div>
            <span>เคลื่อนที่</span>
          </div>
          <div class="ctrl-item">
            <div class="ctrl-key">
              Mouse
            </div>
            <span>เล็ง</span>
          </div>
          <div class="ctrl-item">
            <div class="ctrl-key">
              Click
            </div>
            <span>ยิง</span>
          </div>
          <div class="ctrl-item">
            <div class="ctrl-key">
              ESC
            </div>
            <span>หยุดชั่วคราว</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'GameLobby',
  middleware: 'middlewareAuth',
  data () {
    const stored = localStorage.getItem('userData')
    const user = stored ? JSON.parse(stored) : null
    return {
      user,
      newRoomName: '',
      rooms: [],
      loading: false,
      refreshing: false,
      pollInterval: null
    }
  },
  computed: {
    initials () {
      const name = this.user?.username || this.user?.fullname || 'G'
      return name.substring(0, 2).toUpperCase()
    }
  },
  mounted () {
    this.loadRooms()
    // Listen for live room list from socket
    this.$socket.emit('gameRoomList')
    this.$socket.on('gameRoomListResult', ({ rooms }) => {
      this.rooms = rooms || []
      this.loading = false
      this.refreshing = false
    })
    // Poll every 5s
    this.pollInterval = setInterval(() => {
      this.$socket.emit('gameRoomList')
    }, 5000)
  },
  beforeDestroy () {
    clearInterval(this.pollInterval)
    this.$socket.off('gameRoomListResult')
  },
  methods: {
    loadRooms () {
      this.loading = this.rooms.length === 0
      this.refreshing = true
      this.$socket.emit('gameRoomList')
    },

    createRoom () {
      const name = this.newRoomName.trim()
      if (!name) { return }
      const roomId = `${name}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      this.$router.push(`/game/${roomId}`)
    },

    joinRoom (roomId) {
      this.$router.push(`/game/${roomId}`)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

* { box-sizing: border-box; }

.game-lobby {
  min-height: 100vh;
  background: #080c10;
  color: #e0f0e0;
  font-family: 'Share Tech Mono', monospace;
  position: relative;
  overflow-x: hidden;
}

.grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,255,80,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,80,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.scanline {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0,0,0,0.08) 3px,
    rgba(0,0,0,0.08) 4px
  );
  pointer-events: none;
  z-index: 0;
}

.lobby-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 40px;
  border-bottom: 1px solid rgba(0, 255, 80, 0.15);
  background: rgba(8, 12, 16, 0.9);
}

.back-btn {
  color: #00ff50;
  font-size: 20px;
  text-decoration: none;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(0,255,80,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.back-btn:hover { background: rgba(0,255,80,0.1); border-color: #00ff50; }

.title-block { flex: 1; }
.title-tag {
  font-size: 11px;
  letter-spacing: 4px;
  color: #00ff50;
  opacity: 0.7;
}
.title-block h1 {
  font-family: 'Orbitron', sans-serif;
  font-size: 36px;
  font-weight: 900;
  margin: 2px 0 4px;
  color: #fff;
  text-shadow: 0 0 20px rgba(0,255,80,0.4);
  letter-spacing: 2px;
}
.title-block p {
  font-size: 13px;
  color: rgba(224,240,224,0.5);
  margin: 0;
}

.player-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(0,255,80,0.2);
  padding: 8px 16px;
  font-size: 14px;
  color: #a0e0a0;
}
.chip-avatar, .chip-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.chip-avatar-placeholder {
  background: rgba(0,255,80,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #00ff50;
  border: 1px solid rgba(0,255,80,0.3);
}

.lobby-body {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 40px;
  display: grid;
  grid-template-columns: 340px 1fr;
  grid-template-rows: auto auto;
  gap: 28px;
}

section h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #00ff50;
  margin: 0 0 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Create panel */
.create-panel {
  background: rgba(0,255,80,0.03);
  border: 1px solid rgba(0,255,80,0.12);
  padding: 28px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.room-input {
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(0,255,80,0.25);
  color: #e0f0e0;
  font-family: 'Share Tech Mono', monospace;
  font-size: 16px;
  padding: 14px 16px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.room-input::placeholder { color: rgba(224,240,224,0.3); }
.room-input:focus { border-color: #00ff50; box-shadow: 0 0 0 1px rgba(0,255,80,0.2); }

.create-btn {
  background: #00ff50;
  color: #080c10;
  border: none;
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.create-btn:hover:not(:disabled) { background: #80ffb0; box-shadow: 0 0 20px rgba(0,255,80,0.3); }
.create-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Rooms panel */
.rooms-panel {
  grid-column: 2;
  grid-row: 1 / 3;
  background: rgba(0,255,80,0.03);
  border: 1px solid rgba(0,255,80,0.12);
  padding: 28px;
}

.rooms-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.rooms-header h2 { margin: 0; }

.refresh-btn {
  background: transparent;
  border: 1px solid rgba(0,255,80,0.2);
  color: #00ff50;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.refresh-btn:hover { background: rgba(0,255,80,0.1); }
.refresh-btn.spin i { animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
  color: rgba(224,240,224,0.4);
  font-size: 13px;
}
.pulse-ring {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(0,255,80,0.3);
  border-top-color: #00ff50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 52px 0;
  color: rgba(224,240,224,0.3);
}
.empty-icon { font-size: 52px; margin-bottom: 12px; opacity: 0.4; }
.empty-state p { font-family: 'Orbitron', sans-serif; font-size: 14px; margin-bottom: 6px; color: rgba(224,240,224,0.5); }
.empty-state span { font-size: 12px; }

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.room-card {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,255,80,0.15);
  padding: 18px;
  cursor: pointer;
  transition: all 0.2s;
}
.room-card:hover:not(.room-over) {
  border-color: #00ff50;
  background: rgba(0,255,80,0.05);
  box-shadow: 0 0 16px rgba(0,255,80,0.1);
}
.room-over { opacity: 0.4; cursor: default; }

.room-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.room-name { font-size: 13px; font-weight: 500; color: #fff; }
.room-badge {
  font-size: 10px;
  letter-spacing: 1px;
  padding: 3px 8px;
  font-family: 'Orbitron', sans-serif;
}
.badge-live { background: rgba(0,255,80,0.15); color: #00ff50; border: 1px solid rgba(0,255,80,0.3); }
.badge-over { background: rgba(255,60,60,0.1); color: #ff6060; border: 1px solid rgba(255,60,60,0.2); }

.room-card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  font-size: 12px;
  color: rgba(224,240,224,0.5);
}
.stat { display: flex; align-items: center; gap: 6px; }

.join-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(0,255,80,0.3);
  color: #00ff50;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 1px;
}
.join-btn:hover { background: rgba(0,255,80,0.1); border-color: #00ff50; }
.ended-label { text-align: center; font-size: 12px; color: rgba(224,240,224,0.3); }

/* How to play */
.howto-panel {
  background: rgba(0,255,80,0.03);
  border: 1px solid rgba(0,255,80,0.12);
  padding: 28px;
}

.controls-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.ctrl-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(224,240,224,0.6);
}
.ctrl-key {
  background: rgba(0,255,80,0.08);
  border: 1px solid rgba(0,255,80,0.25);
  color: #00ff50;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  padding: 6px 10px;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .lobby-body {
    grid-template-columns: 1fr;
    padding: 24px 20px;
  }
  .rooms-panel { grid-column: 1; grid-row: auto; }
  .lobby-header { padding: 16px 20px; }
  .title-block h1 { font-size: 24px; }
}
</style>
