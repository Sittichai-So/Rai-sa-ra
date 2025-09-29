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
  width: 260px;
  background: linear-gradient(180deg, #2f3136 0%, #232428 100%);
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #dcddde;
  border-left: 1px solid #202225;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.4);
  font-family: "Segoe UI", sans-serif;
}
.search-container {
  padding: 16px;
  border-bottom: 1px solid #40444b;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
}

.search-box {
  background: rgba(64, 68, 75, 0.8);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  background: rgba(88, 101, 242, 0.15);
  box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.4);
}

.search-box i {
  color: #72767d;
  font-size: 14px;
}

.search-box input {
  background: none;
  border: none;
  color: #fff;
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

.category-header {
  font-size: 12px;
  font-weight: 700;
  color: #8e9297;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 8px 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: color 0.2s ease;
}

.category-header:hover {
  color: #fff;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.member-item:hover {
  background: rgba(88, 101, 242, 0.15);
  transform: translateX(4px);
}

.member-item.current-user {
  background: linear-gradient(90deg, #5865f2, #4752c4);
  color: #fff;
  box-shadow: 0 2px 10px rgba(88, 101, 242, 0.5);
}

.member-item.offline {
  opacity: 0.4;
  filter: grayscale(50%);
}

.member-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.member-avatar img,
.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease;
}

.member-item:hover .member-avatar img,
.member-item:hover .avatar-placeholder {
  transform: scale(1.05);
}

.avatar-placeholder {
  background: linear-gradient(135deg, #5865f2, #4752c4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 700;
}

.avatar-placeholder.offline {
  background: #72767d;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid #2f3136;
  transition: all 0.2s ease;
}

.status-indicator.online {
  background-color: #3ba55c;
  animation: pulse-online 2s infinite;
}

.status-indicator.offline {
  background-color: #747f8d;
}

@keyframes pulse-online {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 165, 92, 0.6);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 165, 92, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 165, 92, 0);
  }
}
.member-info {
  flex: 1;
  overflow: hidden;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.member-status-text {
  font-size: 12px;
  color: #b9bbbe;
}

.member-status-text.online {
  color: #3ba55c;
}

.member-status-text.offline {
  color: #747f8d;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #72767d;
  font-style: italic;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .discord-member-list {
    width: 200px;
  }

  .member-avatar img,
  .avatar-placeholder {
    width: 30px;
    height: 30px;
  }

  .status-indicator {
    width: 9px;
    height: 9px;
  }
}
</style>
