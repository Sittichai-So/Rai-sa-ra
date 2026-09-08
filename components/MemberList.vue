<template>
  <div class="member-list-container" :data-theme="chatTheme">
    <div class="member-list-header">
      <h3 class="member-list-title">
        <i class="fas fa-users" />
        <span>สมาชิก ({{ totalMembers }})</span>
      </h3>
      <button class="close-sidebar-btn" @click="$emit('close')">
        <i class="fas fa-times" />
      </button>
    </div>

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

    <div class="member-list-body">
      <div v-if="loading" class="member-status-panel">
        <b-spinner small class="mr-2" />
        <span>กำลังโหลดสมาชิก...</span>
      </div>

      <div v-else-if="error" class="member-status-panel error">
        <i class="fas fa-exclamation-circle" />
        <span>โหลดรายชื่อสมาชิกไม่สำเร็จ</span>
        <button class="retry-btn" @click="fetchMembers">
          ลองใหม่
        </button>
      </div>

      <template v-else>
        <div v-if="onlineMembers.length" class="member-section">
          <div class="section-header">
            <span class="section-title">ออนไลน์</span>
            <span class="section-count">{{ onlineMembers.length }}</span>
          </div>
          <div class="members-grid">
            <div
              v-for="member in onlineMembers"
              :key="member._id"
              :class="['member-item', { 'is-you': member.isYou, 'active': member.isActive }]"
              @click="$emit('select-member', member)"
            >
              <div class="member-avatar-wrapper">
                <div class="member-avatar">
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.username" @error="member.avatar = null">
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
                <button
                  v-if="showKick(member)"
                  class="member-action-btn kick"
                  title="เตะออกจากห้อง"
                  @click.stop="$emit('kick-member', member)"
                >
                  <i class="fas fa-user-slash" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="offlineMembers.length" class="member-section">
          <div class="section-header">
            <span class="section-title">ออฟไลน์</span>
            <span class="section-count">{{ offlineMembers.length }}</span>
          </div>
          <div class="members-grid">
            <div
              v-for="member in offlineMembers"
              :key="member._id"
              :class="['member-item', { 'is-you': member.isYou, 'active': member.isActive }]"
              @click="$emit('select-member', member)"
            >
              <div class="member-avatar-wrapper">
                <div class="member-avatar offline">
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.username" @error="member.avatar = null">
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
                  <span>{{ member.lastSeen ? formatLastSeen(member.lastSeen) : 'ออฟไลน์' }}</span>
                </div>
              </div>
              <div class="member-actions">
                <button class="member-action-btn" title="ส่งข้อความ" @click.stop="$emit('message-member', member)">
                  <i class="fas fa-comment" />
                </button>
                <button
                  v-if="showKick(member)"
                  class="member-action-btn kick"
                  title="เตะออกจากห้อง"
                  @click.stop="$emit('kick-member', member)"
                >
                  <i class="fas fa-user-slash" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="members.length === 0" class="no-members">
          <div class="no-members-icon">
            <i class="fas fa-user-slash" />
          </div>
          <p>{{ searchQuery ? 'ไม่พบสมาชิกที่ค้นหา' : 'ยังไม่มีสมาชิกในห้องนี้' }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberList',
  props: {
    roomId: { type: String, required: true },
    currentUserId: { type: String, required: true },
    chatTheme: { type: String, default: 'default' },
    ownerId: { type: String, default: '' },
    canKick: { type: Boolean, default: false }
  },
  data () {
    return {
      members: [],
      searchQuery: '',
      loading: false,
      error: false,
      socketListenersSetup: false,
      beforeUnloadHandler: null
    }
  },
  computed: {
    totalMembers () {
      return this.members.length
    },

    sortedMembers () {
      return [...this.members].sort((a, b) => {
        if (a.isYou !== b.isYou) {
          return a.isYou ? -1 : 1
        }
        if (a.online !== b.online) {
          return a.online ? -1 : 1
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
    roomId () {
      this.cleanupSocket()
      this.fetchMembers()
      this.setupSocket()
    }
  },
  mounted () {
    this.fetchMembers()
    this.setupSocket()
  },
  beforeDestroy () {
    this.cleanupSocket()
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
    }
  },
  methods: {
    normalizeMember (m) {
      const id = m._id || m.id || m.userId
      return {
        _id: id,
        username: m.username || m.fullname || m.displayName || m.name || 'Unknown',
        avatar: this.resolveAsset(m.avatar),
        online: m.online === true || m.status === 'online' || m.isOnline === true,
        lastSeen: m.lastSeen || null,
        isYou: String(id) === String(this.currentUserId)
      }
    },

    resolveAsset (url) {
      if (!url) { return null }
      return /^https?:\/\//.test(url) ? url : (process.env.API_FILE_BASE || '') + url
    },

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

    showKick (member) {
      return this.canKick &&
        !member.isYou &&
        String(member._id) !== String(this.ownerId)
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

        this.members = data.map(member => this.normalizeMember(member))

        const me = this.members.find(m => m.isYou)
        if (me) {
          me.online = true
        }
      } catch (err) {
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

      this.cleanupSocket()

      this.$socket.on('roomMembers', this.handleRoomMembers)
      this.$socket.on('statusChanged', this.handleStatusChanged)
      this.$socket.on('memberJoined', this.handleMemberJoined)
      this.$socket.on('memberLeft', this.handleMemberLeft)

      this.socketListenersSetup = true

      this.$socket.emit('statusChanged', {
        userId: this.currentUserId,
        status: 'online',
        roomId: this.roomId
      })

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

      this.$socket.off('roomMembers', this.handleRoomMembers)
      this.$socket.off('statusChanged', this.handleStatusChanged)
      this.$socket.off('memberJoined', this.handleMemberJoined)
      this.$socket.off('memberLeft', this.handleMemberLeft)

      this.socketListenersSetup = false
    },

    handleRoomMembers (members) {
      if (!Array.isArray(members)) { return }

      this.members = members.map(m => this.normalizeMember(m))

      const me = this.members.find(m => m.isYou)
      if (me) {
        me.online = true
      }
    },

    handleStatusChanged ({ userId, status }) {
      const member = this.members.find(m => String(m._id) === String(userId))
      if (member) {
        member.online = status === 'online'
        if (status === 'offline') {
          member.lastSeen = new Date()
        } else {
          member.lastSeen = null
        }
      }
    },

    handleMemberJoined (member) {
      const normalized = this.normalizeMember(member)
      const exists = this.members.find(m => m._id === normalized._id)
      if (!exists) {
        normalized.online = true
        this.members.push(normalized)
      } else {
        exists.online = true
        exists.lastSeen = null
      }
    },

    handleMemberLeft ({ userId }) {
      const member = this.members.find(m => String(m._id) === String(userId))
      if (member) {
        member.online = false
        member.lastSeen = new Date()
      }
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
  width: 100%;
  overflow: hidden;
}

.member-list-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
}

.member-list-body > .member-section { flex-shrink: 0; }
.member-list-body > .member-status-panel,
.member-list-body > .no-members { flex: 1 0 auto; }

.member-list-body::-webkit-scrollbar { width: 6px; }
.member-list-body::-webkit-scrollbar-track { background: transparent; }
.member-list-body::-webkit-scrollbar-thumb { background: var(--surface-raised); border-radius: 3px; }

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
  margin-bottom: 0;
  padding-bottom: 4px;
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
  width: 100%;
  max-width: 100%;
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

.member-avatar img { width: 100%; height: 100%; object-fit: cover; color: transparent; font-size: 0; }

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

.member-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.member-name-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  overflow: hidden;
}

.member-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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

.member-actions { flex-shrink: 0; display: flex; gap: 6px; }

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

.member-action-btn.kick { color: var(--coral); }
.member-action-btn.kick:hover { background: rgba(255, 107, 91, 0.22); }

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

@media (max-width: 768px) {
  .member-list-container { width: 100%; }
  .member-list-header { padding: 14px 16px; }
  .member-list-title { font-size: 1rem; gap: 8px; }
  .member-search-wrapper { padding: 12px 16px; }
  .member-search-input { font-size: 13px; padding: 9px 36px 9px 38px; }
  .search-icon { width: 32px; font-size: 0.85rem; }
  .section-header { padding: 10px 16px 8px; }
  .section-title { font-size: 0.8rem; }
  .section-count { font-size: 0.7rem; padding: 2px 8px; }
  .member-item { padding: 10px 16px; gap: 10px; }
  .member-avatar-wrapper { width: 38px; height: 38px; }
  .member-avatar { width: 38px; height: 38px; font-size: 14px; }
  .member-name { font-size: 0.85rem; }
  .you-badge { font-size: 0.6rem; padding: 2px 6px; }
  .member-status-text { font-size: 0.7rem; gap: 5px; }
  .status-dot { width: 6px; height: 6px; }
  .member-action-btn { width: 28px; height: 28px; font-size: 0.75rem; }
}

@media (max-width: 640px) {
  .member-list-header { padding: 12px 14px; }
  .member-list-title { font-size: 0.95rem; }
  .member-search-wrapper { padding: 10px 14px; }
  .member-search-input { font-size: 13px; padding: 8px 34px 8px 36px; }
  .search-icon { width: 30px; font-size: 0.8rem; }
  .section-header { padding: 8px 14px 6px; }
  .section-title { font-size: 0.75rem; }
  .section-count { font-size: 0.65rem; padding: 2px 6px; }
  .member-item { padding: 8px 14px; gap: 8px; }
  .member-avatar-wrapper { width: 36px; height: 36px; }
  .member-avatar { width: 36px; height: 36px; font-size: 13px; }
  .online-status { width: 9px; height: 9px; bottom: -2px; right: -2px; }
  .member-name { font-size: 0.8rem; }
  .you-badge { font-size: 0.55rem; padding: 1px 5px; }
  .member-status-text { font-size: 0.65rem; }
  .status-dot { width: 5px; height: 5px; }
  .member-action-btn { width: 26px; height: 26px; font-size: 0.7rem; }
}

@media (max-width: 480px) {
  .member-list-header { padding: 10px 12px; }
  .member-list-title { font-size: 0.9rem; gap: 6px; }
  .close-sidebar-btn { width: 28px; height: 28px; font-size: 0.8rem; }
  .member-search-wrapper { padding: 8px 12px; }
  .member-search-input { font-size: 13px; padding: 7px 32px 7px 34px; }
  .search-icon { width: 28px; font-size: 0.75rem; }
  .clear-search-btn { width: 26px; height: 26px; font-size: 0.7rem; }
  .section-header { padding: 6px 12px 4px; }
  .section-title { font-size: 0.7rem; }
  .section-count { font-size: 0.6rem; padding: 1px 5px; }
  .member-item { padding: 7px 12px; gap: 7px; }
  .member-avatar-wrapper { width: 34px; height: 34px; }
  .member-avatar { width: 34px; height: 34px; font-size: 12px; }
  .online-status { width: 8px; height: 8px; bottom: -1px; right: -1px; border-width: 1px; }
  .member-name { font-size: 0.75rem; }
  .you-badge { font-size: 0.5rem; padding: 1px 4px; }
  .member-status-text { font-size: 0.6rem; gap: 4px; }
  .status-dot { width: 5px; height: 5px; }
  .member-action-btn { width: 24px; height: 24px; font-size: 0.65rem; }
  .members-grid { gap: 4px; }
}

@media (max-width: 360px) {
  .member-list-header { padding: 8px 10px; }
  .member-list-title { font-size: 0.85rem; }
  .member-search-wrapper { padding: 6px 10px; }
  .member-search-input { font-size: 12px; padding: 6px 30px 6px 32px; }
  .search-icon { width: 26px; font-size: 0.7rem; }
  .section-header { padding: 5px 10px 3px; }
  .section-title { font-size: 0.65rem; }
  .section-count { font-size: 0.55rem; padding: 1px 4px; }
  .member-item { padding: 6px 10px; gap: 6px; }
  .member-avatar-wrapper { width: 32px; height: 32px; }
  .member-avatar { width: 32px; height: 32px; font-size: 11px; }
  .online-status { width: 7px; height: 7px; }
  .member-name { font-size: 0.7rem; }
  .you-badge { font-size: 0.45rem; }
  .member-status-text { font-size: 0.55rem; }
  .status-dot { width: 4px; height: 4px; }
  .member-action-btn { width: 22px; height: 22px; font-size: 0.6rem; }
}
</style>
