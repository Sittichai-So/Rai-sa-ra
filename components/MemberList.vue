<template>
  <div class="member-list-container" :data-theme="chatTheme">
    <!-- Header -->
    <div class="member-list-header">
      <h3 class="member-list-title">
        <i class="fas fa-users" />
        <span>สมาชิก ({{ totalMembers }})</span>
      </h3>
      <button class="close-sidebar-btn" @click="$emit('close')">
        <i class="fas fa-times" />
      </button>
    </div>

    <!-- Search Box -->
    <div class="member-search-wrapper">
      <div class="search-icon">
        <i class="fas fa-search" />
      </div>
      <input
        v-model="searchQuery"
        type="text"
        class="member-search-input"
        placeholder="ค้นหาสมาชิก..."
      >
      <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
        <i class="fas fa-times" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="member-status-panel">
      <b-spinner small class="mr-2" />
      <span>กำลังโหลดสมาชิก...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="member-status-panel error">
      <i class="fas fa-exclamation-circle" />
      <span>โหลดรายชื่อสมาชิกไม่สำเร็จ</span>
      <button class="retry-btn" @click="fetchMembers">
        ลองใหม่
      </button>
    </div>

    <template v-else>
      <!-- Online Members Section -->
      <div v-if="onlineMembers.length" class="member-section">
        <div class="section-header">
          <span class="section-title">ออนไลน์</span>
          <span class="section-count">{{ onlineMembers.length }}</span>
        </div>
        <div class="members-grid">
          <div
            v-for="member in onlineMembers"
            :key="member._id || member.id"
            :class="['member-item', { 'is-you': member.isYou, 'active': member.isActive }]"
            @click="$emit('select-member', member)"
          >
            <div class="member-avatar-wrapper">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.username">
                <span v-else>{{ getInitials(member.username) }}</span>
              </div>
              <span class="online-status" />
            </div>
            <div class="member-info">
              <div class="member-name-wrapper">
                <span class="member-name">{{ member.username }}</span>
                <span v-if="member.isYou" class="you-badge">คุณ</span>
              </div>
              <div class="member-status-text">
                <span class="status-dot online" />
                <span>ออนไลน์</span>
              </div>
            </div>
            <div class="member-actions">
              <button class="member-action-btn" title="ส่งข้อความ" @click.stop="$emit('message-member', member)">
                <i class="fas fa-comment" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Offline Members Section -->
      <div v-if="offlineMembers.length" class="member-section">
        <div class="section-header">
          <span class="section-title">ออฟไลน์</span>
          <span class="section-count">{{ offlineMembers.length }}</span>
        </div>
        <div class="members-grid">
          <div
            v-for="member in offlineMembers"
            :key="member._id || member.id"
            :class="['member-item', { 'is-you': member.isYou, 'active': member.isActive }]"
            @click="$emit('select-member', member)"
          >
            <div class="member-avatar-wrapper">
              <div class="member-avatar offline">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.username">
                <span v-else>{{ getInitials(member.username) }}</span>
              </div>
            </div>
            <div class="member-info">
              <div class="member-name-wrapper">
                <span class="member-name">{{ member.username }}</span>
                <span v-if="member.isYou" class="you-badge">คุณ</span>
              </div>
              <div class="member-status-text">
                <span class="status-dot offline" />
                <span>ออฟไลน์</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="members.length === 0" class="no-members">
        <div class="no-members-icon">
          <i class="fas fa-user-slash" />
        </div>
        <p>{{ searchQuery ? 'ไม่พบสมาชิกที่ค้นหา' : 'ยังไม่มีสมาชิกในห้องนี้' }}</p>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'MemberList',
  props: {
    roomId: { type: String, required: true },
    currentUserId: { type: String, required: true },
    chatTheme: { type: String, default: 'default' }
  },
  data () {
    return {
      members: [],
      searchQuery: '',
      loading: false,
      error: false,
      socketListenersSetup: false
    }
  },
  computed: {
    totalMembers () {
      return this.members.length
    },

    sortedMembers () {
      return [...this.members].sort((a, b) => {
        // Sort by online status first
        if (a.online && !b.online) {
          return -1
        }
        if (!a.online && b.online) {
          return 1
        }

        return (a.username || '').localeCompare(b.username || '')
      })
    },

    filteredMembers () {
      if (!this.searchQuery.trim()) {
        return this.sortedMembers
      }

      const query = this.searchQuery.toLowerCase().trim()
      return this.sortedMembers.filter((member) => {
        const username = (member.username || '').toLowerCase()
        return username.includes(query)
      })
    },

    onlineMembers () {
      return this.filteredMembers.filter(m => m.online)
    },

    offlineMembers () {
      return this.filteredMembers.filter(m => !m.online)
    }
  },
  watch: {
    // Re-fetch if the user switches rooms while this sidebar stays mounted —
    // previously roomId changes were ignored after the initial mount.
    roomId () {
      this.fetchMembers()
    }
  },
  mounted () {
    this.fetchMembers()
  },
  methods: {
    getInitials (username) {
      if (!username) {
        return '?'
      }
      return username
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    },

    clearSearch () {
      this.searchQuery = ''
    },
    async fetchMembers () {
      this.loading = true
      this.error = false
      try {
        const res = await this.$axios.$get(
          process.env.API_GET_ROOM_MEMBER.replace(':roomId', this.roomId)
        )

        const data = Array.isArray(res)
          ? res
          : (res?.result ?? res?.members ?? res?.data ?? res?.items ?? [])

        if (!Array.isArray(data)) {
          throw new TypeError(`Unexpected members response shape: ${typeof data}`)
        }

        this.members = data.map(member => ({
          ...member,
          username: member.username || member.fullname || member.name || 'Unknown',
          online: member.online === true || member.status === 'online' || member.isOnline === true,
          isYou: member._id === this.currentUserId || member.id === this.currentUserId
        }))
      } catch (err) {
        console.error('Failed to fetch members:', err)
        this.members = []
        this.error = true
      } finally {
        this.loading = false
      }
    },

    setupSocket () {
      if (!this.roomId || !this.$socket || this.socketListenersSetup) {
        return
      }

      // ลบ listeners เก่าก่อน (ถ้ามี)
      this.cleanupSocket()

      // ไม่ต้อง emit joinRoom ที่นี่ เพราะ room.vue จัดการแล้ว
      // เพียงแค่รอรับ event จาก server

      // ตั้งค่า socket listeners
      this.$socket.on('roomMembers', this.handleRoomMembers)
      this.$socket.on('statusChanged', this.handleStatusChanged)
      this.$socket.on('memberJoined', this.handleMemberJoined)
      this.$socket.on('memberLeft', this.handleMemberLeft)

      this.socketListenersSetup = true

      // จัดการ beforeunload
      this.beforeUnloadHandler = () => {
        if (this.$socket && this.currentUserId) {
          this.$socket.emit('statusChanged', {
            userId: this.currentUserId,
            status: 'offline',
            roomId: this.roomId
          })
        }
      }
      window.addEventListener('beforeunload', this.beforeUnloadHandler)
    },

    cleanupSocket () {
      if (!this.$socket) { return }

      // ลบ listeners ทั้งหมด
      this.$socket.off('roomMembers', this.handleRoomMembers)
      this.$socket.off('statusChanged', this.handleStatusChanged)
      this.$socket.off('memberJoined', this.handleMemberJoined)
      this.$socket.off('memberLeft', this.handleMemberLeft)

      this.socketListenersSetup = false
    },

    // Socket event handlers (แยกออกมาเป็น methods เพื่อง่ายต่อการ cleanup)
    handleRoomMembers (members) {
      if (!Array.isArray(members)) { return }

      this.members = members.map(m => ({
        _id: m._id,
        fullname: m.fullname || m.displayName || m.username,
        avatar: m.avatar,
        status: m.status || 'offline',
        lastSeen: m.lastSeen || null,
        activity: m.activity || null,
        gameName: m.gameName || null
      }))
    },

    handleStatusChanged ({ userId, status, activity, gameName }) {
      const member = this.members.find(m => m._id === userId)
      if (member) {
        member.status = status
        if (activity !== undefined) { member.activity = activity }
        if (gameName !== undefined) { member.gameName = gameName }
        if (status === 'offline') {
          member.lastSeen = new Date()
        }
        // Force update
        this.$forceUpdate()
      }
    },

    handleMemberJoined (member) {
      const exists = this.members.find(m => m._id === member._id)
      if (!exists) {
        this.members.push({
          _id: member._id,
          fullname: member.fullname || member.displayName || member.username,
          avatar: member.avatar,
          status: member.status || 'online',
          lastSeen: member.lastSeen || null,
          activity: member.activity || null,
          gameName: member.gameName || null
        })
      }
    },

    handleMemberLeft ({ userId }) {
      const index = this.members.findIndex(m => m._id === userId)
      if (index !== -1) {
        this.members[index].status = 'offline'
        this.members[index].lastSeen = new Date()
        this.$forceUpdate()
      }
    },

    isCurrentUser (member) {
      return String(member._id) === String(this.currentUserId)
    },

    isOnline (member) {
      if (!member) { return false }

      // ถ้าเป็นตัวเอง ให้ดูจาก status ที่เก็บไว้
      if (this.isCurrentUser(member)) {
        return member.status === 'online'
      }

      // ถ้ามี status เป็น online
      if (member.status === 'online') {
        return true
      }

      // ถ้าไม่มี status แต่มี lastSeen ภายใน 5 นาที
      if (!member.status && member.lastSeen) {
        const diff = (new Date() - new Date(member.lastSeen)) / 1000 / 60
        return diff <= 5
      }

      return false
    },

    filterMembers (list) {
      if (!this.searchQuery.trim()) { return list }
      const q = this.searchQuery.toLowerCase()
      return list.filter((m) => {
        const name = (m.fullname || m.displayName || m.username || '').toLowerCase()
        return name.includes(q)
      })
    },

    getMemberName (member) {
      return member.fullname || member.displayName || member.username || 'Unknown User'
    },

    formatLastSeen (lastSeen) {
      if (!lastSeen) { return '' }

      const diff = Math.floor((new Date() - new Date(lastSeen)) / 1000 / 60)
      if (diff < 1) { return 'เมื่อสักครู่' }
      if (diff < 60) { return `${diff} นาทีที่แล้ว` }

      const hours = Math.floor(diff / 60)
      if (hours < 24) { return `${hours} ชั่วโมงที่แล้ว` }

      const days = Math.floor(hours / 24)
      if (days < 7) { return `${days} วันที่แล้ว` }

      return new Date(lastSeen).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short'
      })
    }
  }
}
</script>

<style scoped>
/*
  Same token system as MessageList.vue: one dark ink surface, violet as
  the single accent, coral/mint reserved for status meaning only. The
  cream-and-yellow brutalist sidebar previously clashed with the dark
  chat pane it sits next to; this brings both into one visual family.
*/
.member-list-container {
  --bg: #121218;
  --surface: #1c1c26;
  --surface-raised: #262636;
  --ink: #0d0d12;
  --text: #f3f1ec;
  --text-muted: rgba(243, 241, 236, 0.56);
  --violet: #8b7ffb;
  --violet-deep: #6a5cf0;
  --coral: #ff6b5b;
  --mint: #34d9a6;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --radius-lg: 18px;
  --radius-md: 14px;
  --radius-pill: 999px;
  --font-display: 'Space Grotesk', 'Noto Sans Thai', sans-serif;

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--bg);
  color: var(--text);
}

.member-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.member-list-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-list-title .fa-users { color: var(--violet); }

.close-sidebar-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--surface-raised);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease;
}

.close-sidebar-btn:hover { transform: rotate(90deg); color: var(--coral); }

.member-search-wrapper {
  position: relative;
  margin: 14px 16px 6px;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.85rem;
  pointer-events: none;
}

.member-search-input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  padding: 9px 34px;
  font-size: 0.85rem;
  color: var(--text);
}

.member-search-input::placeholder { color: var(--text-muted); }

.member-search-input:focus {
  outline: none;
  border-color: var(--violet);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--coral);
  color: #ffffff;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.member-status-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 24px;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
}

.member-status-panel.error .fa-exclamation-circle {
  font-size: 1.3rem;
  color: var(--coral);
}

.retry-btn {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  color: var(--text);
  border-radius: var(--radius-pill);
  padding: 6px 16px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.12s ease;
}

.retry-btn:hover { background: rgba(139, 127, 251, 0.25); }

.member-section {
  padding: 10px 16px 4px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.section-count {
  background: var(--surface-raised);
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: var(--radius-pill);
}

.members-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 6px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 4px 6px;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
}

.member-item:hover {
  background: var(--surface-raised);
  border-color: var(--border-subtle);
}

.member-item.is-you { border-color: rgba(139, 127, 251, 0.4); }

.member-avatar-wrapper { position: relative; flex-shrink: 0; }

.member-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--violet);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.member-avatar img { width: 100%; height: 100%; object-fit: cover; }

.member-avatar.offline { background: var(--surface-raised); color: var(--text-muted); }

.online-status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--mint);
  border: 2px solid var(--bg);
}

.member-info { flex: 1; min-width: 0; }

.member-name-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.member-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.you-badge {
  background: var(--violet);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  flex-shrink: 0;
}

.member-status-text {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-dot.online { background: var(--mint); }
.status-dot.offline { background: var(--text-muted); }

.member-actions { flex-shrink: 0; }

.member-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--surface-raised);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s ease;
}

.member-action-btn:hover { background: rgba(139, 127, 251, 0.3); }

.no-members {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  padding: 24px;
}

.no-members-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px dashed var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: var(--text-muted);
}

.no-members p { margin: 0; font-size: 0.85rem; font-weight: 600; }

@media (max-width: 992px) {
  .members-grid { flex-direction: row; flex-wrap: wrap; }
  .member-item { flex: 1 1 220px; }
}
</style>
