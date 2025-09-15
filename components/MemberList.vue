<template>
  <div class="discord-member-list">
    <!-- Search -->
    <div class="search-container">
      <div class="search-box">
        <i class="fas fa-search" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
        >
      </div>
    </div>

    <!-- Members List -->
    <div class="members-container">
      <!-- Activity Section -->
      <div v-if="filteredActivityMembers.length > 0" class="member-category">
        <div class="category-header">
          กิจกรรม — {{ filteredActivityMembers.length }}
          <i class="fas fa-chevron-down" />
        </div>
        <div class="member-list">
          <div
            v-for="member in filteredActivityMembers"
            :key="`activity-${member.userId}`"
            class="member-item activity"
            @click="$emit('member-click', member)"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar" :alt="member.fullname">
              <div v-else class="avatar-placeholder">
                {{ getInitials(member.fullname) }}
              </div>
              <div class="status-indicator online" />
            </div>
            <div class="member-info">
              <div class="member-name">
                {{ member.fullname }}
              </div>
              <div class="member-activity">
                <img v-if="member.gameIcon" :src="member.gameIcon" class="game-icon">
                <div class="activity-details">
                  <div class="activity-name">
                    {{ member.gameName || member.activity }}
                  </div>
                  <div v-if="member.gameDetails" class="activity-detail">
                    {{ member.gameDetails }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Online Section -->
      <div v-if="filteredOnlineMembers.length > 0" class="member-category">
        <div class="category-header">
          ออนไลน์ — {{ filteredOnlineMembers.length }}
          <i class="fas fa-chevron-down" />
        </div>
        <div class="member-list">
          <div
            v-for="member in filteredOnlineMembers"
            :key="`online-${member.userId}`"
            class="member-item"
            @click="$emit('member-click', member)"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar" :alt="member.fullname">
              <div v-else class="avatar-placeholder">
                {{ getInitials(member.fullname) }}
              </div>
              <div class="status-indicator online" />
            </div>
            <div class="member-info">
              <div class="member-name">
                {{ member.fullname }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Offline Section -->
      <div v-if="filteredOfflineMembers.length > 0" class="member-category">
        <div class="category-header">
          ออฟไลน์ — {{ filteredOfflineMembers.length }}
          <i class="fas fa-chevron-down" />
        </div>
        <div class="member-list">
          <div
            v-for="member in filteredOfflineMembers"
            :key="`offline-${member.userId}`"
            class="member-item offline"
            @click="$emit('member-click', member)"
          >
            <div class="member-avatar">
              <img v-if="member.avatar" :src="member.avatar" :alt="member.fullname">
              <div v-else class="avatar-placeholder offline">
                {{ getInitials(member.fullname) }}
              </div>
              <div class="status-indicator offline" />
            </div>
            <div class="member-info">
              <div class="member-name">
                {{ member.fullname }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredMembers.length === 0" class="empty-state">
        ไม่พบสมาชิก
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscordMemberList',
  props: {
    members: {
      type: Array,
      default: () => []
    },
    currentUserId: {
      type: String,
      required: true
    },
    serverName: {
      type: String,
      default: 'เซิร์ฟเวอร์'
    }
  },
  data () {
    return {
      searchQuery: ''
    }
  },
  computed: {
    searchPlaceholder () {
      return 'ค้นหาสมาชิก'
    },

    activityMembers () {
      return this.members.filter(member =>
        this.isOnline(member) && (member.activity || member.gameName)
      )
    },

    onlineMembers () {
      return this.members.filter(member =>
        this.isOnline(member) && !member.activity && !member.gameName
      )
    },

    offlineMembers () {
      return this.members.filter(member => !this.isOnline(member))
    },

    filteredActivityMembers () {
      if (!this.searchQuery) { return this.activityMembers }
      return this.activityMembers.filter(member =>
        member.fullname.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },

    filteredOnlineMembers () {
      if (!this.searchQuery) { return this.onlineMembers }
      return this.onlineMembers.filter(member =>
        member.fullname.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },

    filteredOfflineMembers () {
      if (!this.searchQuery) { return this.offlineMembers }
      return this.offlineMembers.filter(member =>
        member.fullname.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },

    filteredMembers () {
      return [...this.filteredActivityMembers, ...this.filteredOnlineMembers, ...this.filteredOfflineMembers]
    }
  },
  methods: {
    isOnline (member) {
      if (!member.lastSeen) { return false }
      const lastSeen = new Date(member.lastSeen)
      const now = new Date()
      const diffMinutes = (now - lastSeen) / (1000 * 60)
      return diffMinutes <= 5
    },

    getInitials (name) {
      if (!name) { return '?' }
      return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
  }
}
</script>

<style scoped>
.discord-member-list {
  background: #2f3136;
  color: #dcddde;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.search-container {
  padding: 16px 8px 0 16px;
  flex-shrink: 0;
}

.search-box {
  background: #202225;
  border-radius: 4px;
  padding: 0 12px;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  transition: background-color 0.2s ease;
}

.search-box:focus-within {
  background: #1e2124;
}

.search-box i {
  color: #72767d;
  font-size: 12px;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #dcddde;
  font-size: 14px;
  flex: 1;
}

.search-box input::placeholder {
  color: #72767d;
}

.members-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 16px;
}

.member-category {
  margin: 24px 0 8px;
}

.member-category:first-child {
  margin-top: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #8e9297;
  cursor: pointer;
  user-select: none;
}

.category-header i {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.category-header:hover {
  color: #dcddde;
}

.member-list {
  margin-top: 8px;
}

.member-item {
  display: flex;
  align-items: flex-start;
  padding: 1px 8px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.125s ease;
  min-height: 42px;
}

.member-item:hover {
  background: #393c43;
}

.member-item.offline {
  opacity: 0.3;
}

.member-item.activity {
  padding: 8px;
  min-height: 50px;
}

.member-avatar {
  position: relative;
  width: 32px;
  height: 32px;
  margin: 8px 12px 0 0;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #5865f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.avatar-placeholder.offline {
  background: #747f8d;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border: 3px solid #2f3136;
  border-radius: 50%;
}

.status-indicator.online {
  background: #3ba55c;
}

.status-indicator.offline {
  background: #747f8d;
}

.member-info {
  flex: 1;
  min-width: 0;
  padding-top: 8px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #dcddde;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-item.offline .member-name {
  color: #8e9297;
}

.member-activity {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 4px;
}

.game-icon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 1px;
}

.activity-details {
  flex: 1;
  min-width: 0;
}

.activity-name {
  font-size: 12px;
  font-weight: 600;
  color: #dcddde;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-detail {
  font-size: 12px;
  color: #b9bbbe;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #8e9297;
  font-size: 14px;
}

.members-container::-webkit-scrollbar {
  width: 8px;
}

.members-container::-webkit-scrollbar-track {
  background: transparent;
}

.members-container::-webkit-scrollbar-thumb {
  background: #202225;
  border-radius: 4px;
}

.members-container::-webkit-scrollbar-thumb:hover {
  background: #1a1d21;
}

@media (max-width: 768px) {
  .search-container {
    padding: 12px 8px 0 12px;
  }

  .members-container {
    padding: 0 4px 12px;
  }

  .member-item {
    padding: 1px 4px;
  }

  .member-item.activity {
    padding: 6px 4px;
  }

  .member-avatar {
    margin-right: 8px;
  }
}
</style>
