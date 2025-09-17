<template>
  <div class="discord-member-list">
    <div class="search-container">
      <div class="search-box">
        <i class="fas fa-search" />
        <input v-model="searchQuery" type="text" placeholder="ค้นหาสมาชิก">
      </div>
    </div>

    <div class="members-container">
      <!-- Activity Members -->
      <div v-if="filteredActivityMembers.length">
        <div class="category-header">
          กิจกรรม — {{ filteredActivityMembers.length }}
          <i class="fas fa-chevron-down" />
        </div>
        <div class="member-list">
          <div
            v-for="member in filteredActivityMembers"
            :key="member._id"
            class="member-item activity"
            :class="{ 'current-user': isCurrentUser(member) }"
            @click="$emit('member-click', member)"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar">
              <div v-else class="avatar-placeholder">
                {{ getInitials(member) }}
              </div>
              <div class="status-indicator" :class="member.status" />
            </div>
            <div class="member-info">
              <div class="member-name">
                {{ getMemberName(member) }}
                <span v-if="isCurrentUser(member)">(คุณ)</span>
              </div>
              <div class="member-activity">
                {{ member.activity || member.gameName }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Online Members -->
      <div v-if="filteredOnlineMembers.length">
        <div class="category-header">
          ออนไลน์ — {{ filteredOnlineMembers.length }}
          <i class="fas fa-chevron-down" />
        </div>
        <div class="member-list">
          <div
            v-for="member in filteredOnlineMembers"
            :key="member._id"
            class="member-item"
            :class="{ 'current-user': isCurrentUser(member) }"
            @click="$emit('member-click', member)"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar">
              <div class="avatar-placeholder">
                {{ getInitials(member) }}
              </div>
              <div class="status-indicator" :class="member.status" />
            </div>
            <div class="member-info">
              <div class="member-name">
                {{ getMemberName(member) }}
                <span v-if="isCurrentUser(member)">(คุณ)</span>
              </div>
              <div class="member-status-text online">
                ออนไลน์
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Offline Members -->
      <div v-if="filteredOfflineMembers.length">
        <div class="category-header">
          ออฟไลน์ — {{ filteredOfflineMembers.length }}
          <i class="fas fa-chevron-down" />
        </div>
        <div class="member-list">
          <div
            v-for="member in filteredOfflineMembers"
            :key="member._id"
            class="member-item offline"
            :class="{ 'current-user': isCurrentUser(member) }"
            @click="$emit('member-click', member)"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar">
              <div class="avatar-placeholder offline">
                {{ getInitials(member) }}
              </div>
              <div class="status-indicator offline" />
            </div>
            <div class="member-info">
              <div class="member-name">
                {{ getMemberName(member) }}
                <span v-if="isCurrentUser(member)">(คุณ)</span>
              </div>
              <div class="member-status-text offline">
                ออฟไลน์
                <span v-if="member.lastSeen"> - {{ formatLastSeen(member.lastSeen) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredMembers.length === 0" class="empty-state">
        <i class="fas fa-users-slash" /> <div>ไม่พบสมาชิก</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscordMemberList',
  props: {
    roomId: { type: String, required: true },
    currentUserId: { type: String, required: true }
  },
  data () {
    return {
      members: [],
      searchQuery: ''
    }
  },
  computed: {
    activityMembers () { return this.members.filter(m => this.isOnline(m) && (m.activity || m.gameName)) },
    onlineMembers () { return this.members.filter(m => this.isOnline(m) && !m.activity && !m.gameName) },
    offlineMembers () { return this.members.filter(m => !this.isOnline(m)) },
    filteredActivityMembers () { return this.filterMembers(this.activityMembers) },
    filteredOnlineMembers () { return this.filterMembers(this.onlineMembers) },
    filteredOfflineMembers () { return this.filterMembers(this.offlineMembers) },
    filteredMembers () { return [...this.filteredActivityMembers, ...this.filteredOnlineMembers, ...this.filteredOfflineMembers] }
  },
  watch: {
    roomId: { immediate: true, handler () { this.init() } }
  },
  methods: {
    async init () {
      await this.fetchMembers()
      this.setupSocket()
    },
    async fetchMembers () {
      const res = await this.$axios.$get(process.env.API_GET_ROOM_MEMBER.replace(':roomId', this.roomId))
      this.members = res.result.map(m => ({
        _id: m._id,
        fullname: m.fullname,
        avatar: m.avatar,
        status: m.status || 'offline',
        lastSeen: m.lastSeen || null
      }))
    },
    setupSocket () {
      if (!this.roomId) { return }

      this.$socket.emit('joinRoom', { roomId: this.roomId, user: { _id: this.currentUserId } })

      this.$socket.on('roomMembers', (members) => {
        this.members = members
      })

      this.$socket.on('statusChanged', ({ userId, status }) => {
        const member = this.members.find(m => m._id === userId)
        if (member) { member.status = status }
      })
      window.addEventListener('beforeunload', () => {
        if (this.$socket && this.currentUserId) {
          this.$socket.emit('statusChanged', { userId: this.currentUserId, status: 'offline' })
        }
      })
    },
    isCurrentUser (member) {
      return String(member._id) === String(this.currentUserId)
    },
    isOnline (member) {
      if (this.isCurrentUser(member)) {
        const me = this.members.find(m => m._id === this.currentUserId)
        return me?.status === 'online'
      }
      return member.status === 'online' ||
        (!member.status && member.lastSeen && ((new Date() - new Date(member.lastSeen)) / 1000 / 60 <= 5))
    },
    filterMembers (list) {
      if (!this.searchQuery.trim()) { return list }
      const q = this.searchQuery.toLowerCase()
      return list.filter(m => (m.fullname || m.displayName || m.username || '').toLowerCase().includes(q))
    },
    getMemberName (member) { return member.fullname || member.displayName || member.username || 'Unknown User' },
    getInitials (member) {
      const name = member.fullname || member.displayName || member.username || ''
      if (!name) { return '?' }
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    },
    formatLastSeen (lastSeen) {
      const diff = Math.floor((new Date() - new Date(lastSeen)) / 1000 / 60)
      if (diff < 1) { return 'เมื่อสักครู่' }
      if (diff < 60) { return `${diff} นาทีที่แล้ว` }
      const hours = Math.floor(diff / 60)
      if (hours < 24) { return `${hours} ชั่วโมงที่แล้ว` }
      const days = Math.floor(hours / 24)
      if (days < 7) { return `${days} วันที่แล้ว` }
      return new Date(lastSeen).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
    }
  }
}
</script>

<style scoped>
.discord-member-list {
  width: 240px;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #dcddde;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #40444b;
}

.search-box {
  background-color: #40444b;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box i {
  color: #72767d;
  font-size: 14px;
}

.search-box input {
  background: none;
  border: none;
  color: #dcddde;
  outline: none;
  flex: 1;
  font-size: 14px;
}

.search-box input::placeholder {
  color: #72767d;
}

.members-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.member-category {
  margin-bottom: 16px;
}

.category-header {
  font-size: 12px;
  font-weight: 600;
  color: #8e9297;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 8px 8px 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.category-header:hover {
  color: #dcddde;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.member-item:hover {
  background-color: #3c4043;
}

.member-item.current-user {
  background-color: #404eed;
}

.member-item.current-user:hover {
  background-color: #5865f2;
}

.member-item.offline {
  opacity: 0.3;
}

.member-item.offline:hover {
  opacity: 1;
}

.member-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.member-avatar img,
.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.avatar-placeholder {
  background-color: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.avatar-placeholder.offline {
  background-color: #72767d;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #2f3136;
}

.status-indicator.online {
  background-color: #3ba55c;
  box-shadow: 0 0 0 2px #2f3136, 0 0 4px rgba(59, 165, 92, 0.6);
}

.status-indicator.offline {
  background-color: #747f8d;
}

.member-info {
  flex: 1;
  overflow: hidden;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #dcddde;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.current-user-badge {
  font-size: 11px;
  color: #b9bbbe;
  font-weight: 400;
}

.member-status-text {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-status-text.online {
  color: #3ba55c;
}

.member-status-text.offline {
  color: #747f8d;
}

.status-icon {
  font-size: 8px;
}

.last-seen {
  color: #72767d;
  font-size: 11px;
}

.member-activity {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.game-icon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.activity-details {
  flex: 1;
  overflow: hidden;
}

.activity-name {
  font-size: 12px;
  color: #dcddde;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-detail {
  font-size: 11px;
  color: #b9bbbe;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #72767d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.status-summary {
  border-top: 1px solid #40444b;
  padding: 12px 16px;
  background-color: #36393f;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #b9bbbe;
  margin-bottom: 4px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background-color: #3ba55c;
  box-shadow: 0 0 4px rgba(59, 165, 92, 0.6);
}

.status-dot.offline {
  background-color: #747f8d;
}

.members-container::-webkit-scrollbar {
  width: 4px;
}

.members-container::-webkit-scrollbar-track {
  background: transparent;
}

.members-container::-webkit-scrollbar-thumb {
  background: #202225;
  border-radius: 4px;
}

.members-container::-webkit-scrollbar-thumb:hover {
  background: #1e2124;
}

@keyframes pulse-online {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 165, 92, 0.7), 0 0 0 2px #2f3136;
  }
  70% {
    box-shadow: 0 0 0 4px rgba(59, 165, 92, 0), 0 0 0 2px #2f3136;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 165, 92, 0), 0 0 0 2px #2f3136;
  }
}

.status-indicator.online {
  animation: pulse-online 2s infinite;
}

@media (max-width: 768px) {
  .discord-member-list {
    width: 200px;
  }

  .member-avatar img,
  .avatar-placeholder {
    width: 28px;
    height: 28px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
  }
}
</style>
