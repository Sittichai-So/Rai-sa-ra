// components/MemberList.vue
<template>
  <div class="discord-member-list" :data-theme="chatTheme">
    <div class="search-container">
      <div class="search-box">
        <i class="fas fa-search" />
        <input v-model="searchQuery" type="text" placeholder="ค้นหาสมาชิก">
      </div>
    </div>

    <div class="members-container">
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
              <div class="member-status-text online">
                ออนไลน์
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <div v-else class="avatar-placeholder offline">
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
    currentUserId: { type: String, required: true },
    chatTheme: { type: String, default: 'default' }
  },
  data () {
    return {
      members: [],
      searchQuery: '',
      socketListenersSetup: false
    }
  },
  computed: {
    activityMembers () {
      return this.members.filter(m => this.isOnline(m) && (m.activity || m.gameName))
    },
    onlineMembers () {
      return this.members.filter(m => this.isOnline(m) && !m.activity && !m.gameName)
    },
    offlineMembers () {
      return this.members.filter(m => !this.isOnline(m))
    },
    filteredActivityMembers () {
      return this.filterMembers(this.activityMembers)
    },
    filteredOnlineMembers () {
      return this.filterMembers(this.onlineMembers)
    },
    filteredOfflineMembers () {
      return this.filterMembers(this.offlineMembers)
    },
    filteredMembers () {
      return [...this.filteredActivityMembers, ...this.filteredOnlineMembers, ...this.filteredOfflineMembers]
    }
  },
  watch: {
    roomId: {
      immediate: true,
      async handler (newVal, oldVal) {
        // ถ้า roomId เปลี่ยน ให้ cleanup socket listeners เก่า
        if (oldVal && oldVal !== newVal) {
          this.cleanupSocket()
        }
        if (newVal) {
          await this.init()
        }
      }
    }
  },
  beforeDestroy () {
    this.cleanupSocket()
    // ลบ beforeunload listener
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
    }
  },
  methods: {
    async init () {
      await this.fetchMembers()
      this.setupSocket()
    },

    async fetchMembers () {
      try {
        const res = await this.$axios.$get(
          process.env.API_GET_ROOM_MEMBER.replace(':roomId', this.roomId)
        )
        this.members = (res.result || []).map(m => ({
          _id: m._id,
          fullname: m.fullname || m.displayName || m.username,
          avatar: m.avatar,
          status: m.status || 'offline',
          lastSeen: m.lastSeen || null,
          activity: m.activity || null,
          gameName: m.gameName || null
        }))
      } catch (err) {
        console.error('Error fetching members:', err)
        this.members = []
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

    getInitials (member) {
      const name = member.fullname || member.displayName || member.username || ''
      if (!name) { return '?' }
      const parts = name.split(' ').filter(p => p.length > 0)
      if (parts.length === 0) { return '?' }
      if (parts.length === 1) { return parts[0][0].toUpperCase() }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
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
.discord-member-list {
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

/* Minimal Theme */
[data-theme="minimal"] .discord-member-list {
  background: #ffffff;
  color: #1e293b;
  border-left: 1px solid #e2e8f0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

[data-theme="minimal"] .search-container {
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

[data-theme="minimal"] .search-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

[data-theme="minimal"] .search-box:focus-within {
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

[data-theme="minimal"] .search-box i {
  color: #64748b;
}

[data-theme="minimal"] .search-box input {
  color: #1e293b;
}

[data-theme="minimal"] .search-box input::placeholder {
  color: #94a3b8;
}

[data-theme="minimal"] .category-header {
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

[data-theme="minimal"] .category-header:hover {
  color: #2563eb;
}

[data-theme="minimal"] .member-item:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

[data-theme="minimal"] .member-item.current-user {
  background: #dbeafe;
  color: #1e293b;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

[data-theme="minimal"] .member-name {
  color: #1e293b;
}

[data-theme="minimal"] .member-status-text {
  color: #64748b;
}

[data-theme="minimal"] .member-status-text.online {
  color: #10b981;
}

[data-theme="minimal"] .member-status-text.offline {
  color: #94a3b8;
}

[data-theme="minimal"] .empty-state {
  color: #94a3b8;
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
