<template>
  <div class="rpg-lobby">
    <div class="rpg-bg" />

    <header class="rpg-header">
      <nuxt-link to="/chat/chat" class="back-btn">
        <i class="fas fa-arrow-left" />
      </nuxt-link>
      <div class="title-block">
        <span class="title-tag">CO-OP ADVENTURE</span>
        <h1>ตำนานนักผจญภัย</h1>
        <p>รวมปาร์ตี้ ทอยเต๋าเดินบอร์ด ผจญภัยไปด้วยกัน</p>
      </div>
      <img src="~/assets/images/rpg/Male_4_Idle0.png" class="hero-mascot" alt="">
      <nuxt-link to="/rpg" class="other-game-link proto-link">
        <i class="fas fa-map-location-dot" /> <span>โหมดเดินสำรวจ (ใหม่)</span>
      </nuxt-link>
      <nuxt-link to="/game" class="other-game-link">
        <i class="fas fa-biohazard" /> <span>Zombie Strike</span>
      </nuxt-link>
      <div class="player-chip">
        <img v-if="avatarUrl && !avatarBroken" :src="avatarUrl" class="chip-avatar" @error="avatarBroken = true">
        <div v-else class="chip-avatar-placeholder">
          {{ initials }}
        </div>
        <span>{{ user?.username || user?.fullname || 'Guest' }}</span>
      </div>
    </header>

    <main class="rpg-body">
      <section class="create-panel">
        <h2><i class="fas fa-scroll" /> เปิดปาร์ตี้ใหม่</h2>
        <div class="create-form">
          <input
            v-model="newRoomName"
            type="text"
            placeholder="ชื่อปาร์ตี้ เช่น กลุ่มมังกรทอง..."
            maxlength="24"
            class="room-input"
            @keyup.enter="createRoom"
          >
          <button class="create-btn" :disabled="!newRoomName.trim()" @click="createRoom">
            <i class="fas fa-dice-d20" /> เปิดปาร์ตี้
          </button>
        </div>
      </section>

      <section class="rooms-panel">
        <div class="rooms-header">
          <h2><i class="fas fa-campground" /> ปาร์ตี้ที่เปิดอยู่</h2>
          <button class="refresh-btn" :class="{ spin: refreshing }" @click="loadRooms">
            <i class="fas fa-sync-alt" />
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="pulse-ring" />
          <span>กำลังค้นหาปาร์ตี้...</span>
        </div>

        <div v-else-if="rooms.length === 0" class="empty-state">
          <div class="empty-icon">
            🎲
          </div>
          <p>ยังไม่มีปาร์ตี้เปิดอยู่</p>
          <span>เปิดปาร์ตี้ใหม่เพื่อชวนเพื่อนผจญภัย</span>
        </div>

        <div v-else class="rooms-grid">
          <div
            v-for="room in rooms"
            :key="room.roomId"
            class="room-card"
            :class="{ 'room-over': room.gameOver || room.started || room.playerCount >= maxPlayers }"
            @click="canJoinRoom(room) && joinRoom(room.roomId)"
          >
            <div class="room-card-top">
              <span class="room-name">{{ room.roomId }}</span>
              <span class="room-badge" :class="roomBadgeClass(room)">
                {{ roomBadgeText(room) }}
              </span>
            </div>
            <div class="room-card-stats">
              <div class="stat">
                <i class="fas fa-users" />
                <span>{{ room.playerCount }}/{{ maxPlayers }} นักผจญภัย</span>
              </div>
            </div>
            <button v-if="canJoinRoom(room)" class="join-btn">
              เข้าร่วมปาร์ตี้ <i class="fas fa-chevron-right" />
            </button>
            <div v-else-if="room.gameOver" class="ended-label">
              จบการผจญภัยแล้ว
            </div>
            <div v-else-if="room.started" class="ended-label">
              ออกเดินทางไปแล้ว
            </div>
            <div v-else class="ended-label">
              ปาร์ตี้เต็ม ({{ maxPlayers }}/{{ maxPlayers }})
            </div>
          </div>
        </div>
      </section>

      <section class="howto-panel">
        <h2><i class="fas fa-book-open" /> วิธีเล่น</h2>
        <div class="howto-list">
          <div class="howto-item">
            <i class="fas fa-user-plus" />
            <span>เข้าห้อง เลือกคลาสตัวละคร แล้วกด "พร้อมแล้ว"</span>
          </div>
          <div class="howto-item">
            <i class="fas fa-dice-d20" />
            <span>ผลัดกันทอยเต๋าเดินไปบนกระดาน ตามเทิร์น</span>
          </div>
          <div class="howto-item">
            <i class="fas fa-scroll" />
            <span>เจอเหตุการณ์ให้เลือกทาง แล้วทอยเช็คสถิติตัวละคร</span>
          </div>
          <div class="howto-item">
            <i class="fas fa-dragon" />
            <span>ไปให้ถึงถ้ำมังกรและเอาชนะให้ได้เพื่อชนะภารกิจร่วมกัน</span>
          </div>
        </div>
      </section>

      <section class="leaderboard-panel">
        <h2><i class="fas fa-trophy" /> กระดานผู้กล้า</h2>

        <div v-if="myStats && myStats.runs" class="my-stats">
          <div class="ms-item">
            <span class="ms-val">{{ myStats.victories }}</span>
            <span class="ms-lbl">ชนะภารกิจ</span>
          </div>
          <div class="ms-item">
            <span class="ms-val">{{ myStats.bestScore }}</span>
            <span class="ms-lbl">คะแนนสูงสุด</span>
          </div>
          <div class="ms-item">
            <span class="ms-val">{{ myStats.runs }}</span>
            <span class="ms-lbl">ครั้งที่ผจญภัย</span>
          </div>
        </div>

        <div v-if="leaderboard.length === 0" class="lb-empty">
          ยังไม่มีสถิติ — ผจญภัยให้จบรอบเพื่อขึ้นกระดาน
        </div>
        <ol v-else class="lb-list">
          <li
            v-for="row in leaderboard"
            :key="row.userId"
            class="lb-item"
            :class="{ 'lb-me': user && String(row.userId) === String(user._id) }"
          >
            <span class="lb-rank">#{{ row.rank }}</span>
            <span class="lb-name">{{ row.username }}</span>
            <span class="lb-best">{{ row.bestScore }}</span>
            <span class="lb-wins">ชนะ {{ row.victories }}</span>
          </li>
        </ol>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'RpgLobby',
  middleware: ['middlewareAuth', 'legacyBoard'],
  data () {
    const stored = localStorage.getItem('userData')
    const user = stored ? JSON.parse(stored) : null
    return {
      user,
      newRoomName: '',
      rooms: [],
      loading: false,
      refreshing: false,
      pollInterval: null,
      leaderboard: [],
      myStats: null,
      avatarBroken: false,
      maxPlayers: 6
    }
  },
  computed: {
    initials () {
      const name = this.user?.username || this.user?.fullname || 'G'
      return name.substring(0, 2).toUpperCase()
    },
    avatarUrl () {
      const src = this.user?.avatar
      if (!src) { return null }
      return /^https?:\/\//.test(src) ? src : (process.env.API_FILE_BASE || '') + src
    }
  },
  mounted () {
    this.loadRooms()
    this.loadLeaderboard()
    this.$socket.emit('rpgRoomList')
    this.$socket.on('rpgRoomListResult', ({ rooms }) => {
      this.rooms = rooms || []
      this.loading = false
      this.refreshing = false
    })
    this.pollInterval = setInterval(() => {
      this.$socket.emit('rpgRoomList')
    }, 5000)
  },
  beforeDestroy () {
    clearInterval(this.pollInterval)
    this.$socket.off('rpgRoomListResult')
  },
  methods: {
    loadRooms () {
      this.loading = this.rooms.length === 0
      this.refreshing = true
      this.$socket.emit('rpgRoomList')
    },

    async loadLeaderboard () {
      try {
        const [lb, stats] = await Promise.all([
          this.$axios.$get(process.env.API_RPG_LEADERBOARD, { params: { limit: 10 } }),
          this.$axios.$get(process.env.API_RPG_MY_STATS)
        ])
        this.leaderboard = lb.result || []
        this.myStats = stats.result?.summary || null
      } catch (err) {
      }
    },

    createRoom () {
      const name = this.newRoomName.trim()
      if (!name) { return }
      const roomId = `${name}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      this.$router.push(`/rpg/board/${roomId}`)
    },

    joinRoom (roomId) {
      this.$router.push(`/rpg/board/${roomId}`)
    },

    canJoinRoom (room) {
      return !room.gameOver && !room.started && room.playerCount < this.maxPlayers
    },

    roomBadgeClass (room) {
      if (room.gameOver) { return 'badge-over' }
      if (room.started) { return 'badge-live' }
      return 'badge-waiting'
    },

    roomBadgeText (room) {
      if (room.gameOver) { return 'จบแล้ว' }
      if (room.started) { return 'ออกเดินทาง' }
      return 'รอนักผจญภัย'
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Kanit:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.rpg-lobby {
  min-height: 100vh; min-height: 100dvh;
  background: #140f1e;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.rpg-bg {
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(232, 179, 74, 0.06), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(124, 60, 168, 0.12), transparent 45%);
  pointer-events: none;
  z-index: 0;
}

.rpg-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: calc(24px + env(safe-area-inset-top)) 40px 24px;
  border-bottom: 1px solid rgba(232, 179, 74, 0.15);
  background: rgba(20, 15, 30, 0.9);
}

.back-btn {
  color: #e8b34a;
  font-size: 20px;
  text-decoration: none;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(232, 179, 74, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.back-btn:hover { background: rgba(232, 179, 74, 0.1); border-color: #e8b34a; }

.title-block { flex: 1; }
.title-tag {
  font-size: 11px;
  letter-spacing: 4px;
  color: #e8b34a;
  opacity: 0.8;
}
.title-block h1 {
  font-family: 'Cinzel', serif;
  font-size: 32px;
  font-weight: 900;
  margin: 2px 0 4px;
  color: #f4e9d0;
  text-shadow: 0 0 20px rgba(232, 179, 74, 0.25);
  letter-spacing: 1px;
}
.title-block p {
  font-size: 13px;
  color: rgba(237, 230, 214, 0.5);
  margin: 0;
}

.hero-mascot {
  height: 64px;
  width: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}

.other-game-link {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border: 1px solid rgba(111, 219, 160, 0.3);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 12px;
  color: #6fdba0;
  text-decoration: none;
  transition: all 0.2s;
}
.other-game-link:hover { background: rgba(111, 219, 160, 0.1); }
.proto-link { border-color: rgba(120, 170, 255, 0.35); color: #7fb0ff; }
.proto-link:hover { background: rgba(120, 170, 255, 0.1); }

.player-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(232, 179, 74, 0.2);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  color: #dcc9a0;
}
.chip-avatar, .chip-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.chip-avatar-placeholder {
  background: rgba(232, 179, 74, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #e8b34a;
  border: 1px solid rgba(232, 179, 74, 0.3);
}

.rpg-body {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 40px calc(36px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: 340px 1fr;
  grid-template-rows: auto auto;
  gap: 28px;
}

section h2 {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #e8b34a;
  margin: 0 0 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-panel, .rooms-panel, .howto-panel, .leaderboard-panel {
  background: rgba(232, 179, 74, 0.03);
  border: 1px solid rgba(232, 179, 74, 0.14);
  border-radius: 14px;
  padding: 28px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.room-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(232, 179, 74, 0.25);
  border-radius: 10px;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  font-size: 15px;
  padding: 14px 16px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.room-input::placeholder { color: rgba(237, 230, 214, 0.3); }
.room-input:focus { border-color: #e8b34a; box-shadow: 0 0 0 1px rgba(232, 179, 74, 0.2); }

.create-btn {
  background: #e8b34a;
  color: #140f1e;
  border: none;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.create-btn:hover:not(:disabled) { background: #f4cb72; box-shadow: 0 0 20px rgba(232, 179, 74, 0.3); }
.create-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.rooms-panel {
  grid-column: 2;
  grid-row: 1 / 3;
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
  border: 1px solid rgba(232, 179, 74, 0.2);
  border-radius: 8px;
  color: #e8b34a;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.refresh-btn:hover { background: rgba(232, 179, 74, 0.1); }
.refresh-btn.spin i { animation: rpg-spin 0.6s linear infinite; }
@keyframes rpg-spin { to { transform: rotate(360deg); } }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
  color: rgba(237, 230, 214, 0.4);
  font-size: 13px;
}
.pulse-ring {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(232, 179, 74, 0.3);
  border-top-color: #e8b34a;
  border-radius: 50%;
  animation: rpg-spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 52px 0;
  color: rgba(237, 230, 214, 0.3);
}
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.6; }
.empty-state p { font-family: 'Cinzel', serif; font-size: 14px; margin-bottom: 6px; color: rgba(237, 230, 214, 0.55); }
.empty-state span { font-size: 12px; }

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.room-card {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(232, 179, 74, 0.15);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.2s;
}
.room-card:hover:not(.room-over) {
  border-color: #e8b34a;
  background: rgba(232, 179, 74, 0.05);
  box-shadow: 0 0 16px rgba(232, 179, 74, 0.1);
}
.room-over { opacity: 0.45; cursor: default; }

.room-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}
.room-name { font-size: 13px; font-weight: 500; color: #f4e9d0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.room-badge {
  flex-shrink: 0;
  font-size: 10px;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 999px;
  font-family: 'Cinzel', serif;
}
.badge-live { background: rgba(90, 200, 140, 0.15); color: #6fdba0; border: 1px solid rgba(90, 200, 140, 0.3); }
.badge-over { background: rgba(255, 92, 92, 0.1); color: #ff8f8f; border: 1px solid rgba(255, 92, 92, 0.2); }
.badge-waiting { background: rgba(232, 179, 74, 0.12); color: #e8b34a; border: 1px solid rgba(232, 179, 74, 0.3); }

.room-card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  font-size: 12px;
  color: rgba(237, 230, 214, 0.5);
}
.stat { display: flex; align-items: center; gap: 6px; }

.join-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(232, 179, 74, 0.3);
  border-radius: 8px;
  color: #e8b34a;
  font-family: 'Kanit', sans-serif;
  font-size: 12px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.join-btn:hover { background: rgba(232, 179, 74, 0.1); border-color: #e8b34a; }
.ended-label { text-align: center; font-size: 12px; color: rgba(237, 230, 214, 0.3); }

.howto-list { display: flex; flex-direction: column; gap: 14px; }
.howto-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(237, 230, 214, 0.65);
}
.howto-item i { color: #e8b34a; width: 20px; text-align: center; flex-shrink: 0; }

.leaderboard-panel {
  grid-column: 1;
}

.my-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(232, 179, 74, 0.12);
}
.ms-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.ms-val { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #e8b34a; }
.ms-lbl { font-size: 10px; color: rgba(237, 230, 214, 0.45); text-align: center; }

.lb-empty { font-size: 12px; color: rgba(237, 230, 214, 0.4); text-align: center; padding: 20px 0; }

.lb-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.lb-item {
  display: grid;
  grid-template-columns: 30px 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 7px 10px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(232, 179, 74, 0.06);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(237, 230, 214, 0.6);
}
.lb-item.lb-me { border-color: rgba(232, 179, 74, 0.35); color: #ede6d6; }
.lb-rank { color: #e8b34a; font-family: 'Cinzel', serif; font-size: 11px; }
.lb-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lb-best { color: #e8b34a; font-family: 'Cinzel', serif; }
.lb-wins { color: #6fdba0; white-space: nowrap; }

@media (max-width: 900px) {
  .rpg-body {
    grid-template-columns: 1fr;
    padding: 24px 20px calc(24px + env(safe-area-inset-bottom));
  }
  .rooms-panel { grid-column: 1; grid-row: auto; }
  .leaderboard-panel { grid-column: 1; }
  .rpg-header { padding: calc(16px + env(safe-area-inset-top)) 20px 16px; gap: 16px; }
  .title-block h1 { font-size: 22px; }
  .hero-mascot { display: none; }
}

@media (max-width: 420px) {
  .rpg-body { padding: 20px 14px calc(20px + env(safe-area-inset-bottom)); }
  .create-panel, .rooms-panel, .howto-panel, .leaderboard-panel { padding: 20px 16px; }
  .title-block h1 { font-size: 19px; }
  .my-stats { gap: 10px; }
  .player-chip span { display: none; }
  .other-game-link span { display: none; }
}
</style>
