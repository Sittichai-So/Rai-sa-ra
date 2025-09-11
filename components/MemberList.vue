<template>
  <div class="member-list-container">
    <!-- Header -->
    <div class="member-list-header">
      <h6 class="mb-0">
        <i class="fas fa-users mr-2" />
        สมาชิกออนไลน์ ({{ onlineCount }})
      </h6>
      <b-button
        v-if="$slots.default"
        variant="link"
        size="sm"
        class="toggle-btn"
        @click="isCollapsed = !isCollapsed"
      >
        <i :class="`fas fa-chevron-${isCollapsed ? 'down' : 'up'}`" />
      </b-button>
    </div>

    <!-- Search bar (for large member lists) -->
    <div v-if="members.length > 10" class="member-search">
      <b-form-input
        v-model="searchQuery"
        size="sm"
        placeholder="ค้นหาสมาชิก..."
        class="search-input"
      >
        <template #prepend>
          <b-input-group-text class="bg-transparent border-right-0">
            <i class="fas fa-search text-muted" style="font-size: 0.8rem;" />
          </b-input-group-text>
        </template>
      </b-form-input>
    </div>

    <!-- Member List -->
    <div
      v-show="!isCollapsed"
      class="member-list"
      :class="{ 'scrollable': members.length > 8 }"
    >
      <!-- Online Members -->
      <div v-if="onlineMembers.length" class="member-section">
        <div class="section-divider">
          <small class="text-success font-weight-bold">
            <i class="fas fa-circle mr-1" style="font-size: 0.6rem;" />
            ออนไลน์
          </small>
        </div>

        <div
          v-for="member in filteredOnlineMembers"
          :key="`online-${member.userId}`"
          class="member-item online"
          @click="openMemberProfile(member)"
        >
          <div class="member-avatar-wrapper">
            <b-avatar
              :text="getInitials(member.fullname)"
              :src="member.avatar"
              size="32"
              variant="success"
            />
            <div class="online-indicator" />
          </div>

          <div class="member-info">
            <div class="member-name">
              {{ member.fullname }}
            </div>
            <div class="member-status">
              <i class="fas fa-circle text-success mr-1" style="font-size: 0.5rem;" />
              {{ getLastSeen(member.lastSeen) }}
            </div>
          </div>

          <div class="member-actions">
            <b-dropdown
              variant="link"
              size="sm"
              no-caret
              right
              boundary="viewport"
            >
              <template #button-content>
                <i class="fas fa-ellipsis-v" />
              </template>

              <b-dropdown-item @click="sendDirectMessage(member)">
                <i class="fas fa-comment mr-2" />
                ส่งข้อความส่วนตัว
              </b-dropdown-item>

              <b-dropdown-item @click="viewProfile(member)">
                <i class="fas fa-user mr-2" />
                ดูโปรไฟล์
              </b-dropdown-item>

              <!-- Admin actions (if current user is admin) -->
              <template v-if="isAdmin && member.userId !== currentUserId">
                <b-dropdown-divider />
                <b-dropdown-item @click="kickMember(member)">
                  <i class="fas fa-user-times mr-2 text-warning" />
                  นำออกจากห้อง
                </b-dropdown-item>
                <b-dropdown-item @click="banMember(member)">
                  <i class="fas fa-ban mr-2 text-danger" />
                  แบน
                </b-dropdown-item>
              </template>
            </b-dropdown>
          </div>
        </div>
      </div>

      <!-- Offline Members -->
      <div v-if="offlineMembers.length" class="member-section">
        <div class="section-divider">
          <small class="text-muted font-weight-bold">
            <i class="fas fa-circle mr-1" style="font-size: 0.6rem;" />
            ออฟไลน์
          </small>
        </div>

        <div
          v-for="member in filteredOfflineMembers"
          :key="`offline-${member.userId}`"
          class="member-item offline"
          @click="openMemberProfile(member)"
        >
          <div class="member-avatar-wrapper">
            <b-avatar
              :text="getInitials(member.fullname)"
              :src="member.avatar"
              size="32"
              variant="secondary"
            />
          </div>

          <div class="member-info">
            <div class="member-name">
              {{ member.fullname }}
            </div>
            <div class="member-status text-muted">
              <i class="fas fa-circle mr-1" style="font-size: 0.5rem;" />
              {{ getLastSeen(member.lastSeen) }}
            </div>
          </div>

          <div class="member-actions">
            <b-dropdown
              variant="link"
              size="sm"
              no-caret
              right
              boundary="viewport"
            >
              <template #button-content>
                <i class="fas fa-ellipsis-v" />
              </template>

              <b-dropdown-item @click="sendDirectMessage(member)">
                <i class="fas fa-comment mr-2" />
                ส่งข้อความส่วนตัว
              </b-dropdown-item>

              <b-dropdown-item @click="viewProfile(member)">
                <i class="fas fa-user mr-2" />
                ดูโปรไฟล์
              </b-dropdown-item>

              <!-- Admin actions -->
              <template v-if="isAdmin && member.userId !== currentUserId">
                <b-dropdown-divider />
                <b-dropdown-item @click="kickMember(member)">
                  <i class="fas fa-user-times mr-2 text-warning" />
                  นำออกจากห้อง
                </b-dropdown-item>
                <b-dropdown-item @click="banMember(member)">
                  <i class="fas fa-ban mr-2 text-danger" />
                  แบน
                </b-dropdown-item>
              </template>
            </b-dropdown>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredMembers.length === 0" class="empty-state text-center py-4">
        <i class="fas fa-users text-muted mb-2" style="font-size: 2rem;" />
        <div class="text-muted">
          ไม่พบสมาชิกที่ตรงกับการค้นหา
        </div>
      </div>
    </div>

    <!-- Member Profile Modal -->
    <b-modal
      id="member-profile-modal"
      v-model="showProfileModal"
      :title="selectedMember?.fullname"
      size="md"
      centered
      hide-footer
    >
      <div v-if="selectedMember" class="member-profile">
        <div class="text-center mb-4">
          <b-avatar
            :text="getInitials(selectedMember.fullname)"
            :src="selectedMember.avatar"
            size="80"
            :variant="isOnline(selectedMember) ? 'success' : 'secondary'"
            class="mb-3"
          />
          <h5>{{ selectedMember.fullname }}</h5>
          <div class="member-status-badge">
            <b-badge
              :variant="isOnline(selectedMember) ? 'success' : 'secondary'"
              class="px-3 py-2"
            >
              <i class="fas fa-circle mr-1" style="font-size: 0.6rem;" />
              {{ isOnline(selectedMember) ? 'ออนไลน์' : 'ออฟไลน์' }}
            </b-badge>
          </div>
        </div>

        <div class="member-details">
          <div class="detail-item">
            <strong>เข้าร่วมเมื่อ:</strong>
            <span>{{ formatJoinDate(selectedMember.joinedAt) }}</span>
          </div>
          <div class="detail-item">
            <strong>กิจกรรมล่าสุด:</strong>
            <span>{{ getLastSeen(selectedMember.lastSeen) }}</span>
          </div>
          <div class="detail-item">
            <strong>ข้อความทั้งหมด:</strong>
            <span>{{ selectedMember.messageCount || 0 }} ข้อความ</span>
          </div>
        </div>

        <div class="profile-actions mt-4">
          <b-button
            variant="primary"
            block
            @click="sendDirectMessage(selectedMember)"
          >
            <i class="fas fa-comment mr-2" />
            ส่งข้อความส่วนตัว
          </b-button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns'
import { th } from 'date-fns/locale'

export default {
  name: 'MemberList',
  props: {
    members: {
      type: Array,
      default: () => []
    },
    currentUserId: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    roomId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      searchQuery: '',
      isCollapsed: false,
      showProfileModal: false,
      selectedMember: null
    }
  },
  computed: {
    onlineMembers () {
      return this.members.filter(member => this.isOnline(member))
    },

    offlineMembers () {
      return this.members.filter(member => !this.isOnline(member))
    },

    onlineCount () {
      return this.onlineMembers.length
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
      return [...this.filteredOnlineMembers, ...this.filteredOfflineMembers]
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
    },

    getLastSeen (lastSeenString) {
      if (!lastSeenString) { return 'ไม่ทราบ' }

      const lastSeen = parseISO(lastSeenString)
      // eslint-disable-next-line no-unused-vars
      const now = new Date()

      if (this.isOnline({ lastSeen: lastSeenString })) {
        return 'ออนไลน์อยู่'
      }

      if (isToday(lastSeen)) {
        return `เห็นครั้งสุดท้าย ${format(lastSeen, 'HH:mm')}`
      }

      if (isYesterday(lastSeen)) {
        return `เห็นครั้งสุดท้าย เมื่อวาน ${format(lastSeen, 'HH:mm')}`
      }

      return `เห็นครั้งสุดท้าย ${formatDistanceToNow(lastSeen, {
        addSuffix: true,
        locale: th
      })}`
    },

    formatJoinDate (dateString) {
      if (!dateString) { return 'ไม่ทราบ' }
      const date = parseISO(dateString)
      return format(date, 'dd MMMM yyyy', { locale: th })
    },

    openMemberProfile (member) {
      this.selectedMember = member
      this.showProfileModal = true
    },

    viewProfile (member) {
      this.openMemberProfile(member)
    },

    sendDirectMessage (member) {
      this.$emit('send-direct-message', member)
      this.showProfileModal = false
    },

    async kickMember (member) {
      const confirmed = await this.$bvModal.msgBoxConfirm(
        `คุณต้องการนำ ${member.fullname} ออกจากห้องนี้หรือไม่?`,
        {
          title: 'ยืนยันการนำออก',
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'warning',
          okTitle: 'นำออก',
          cancelTitle: 'ยกเลิก',
          centered: true
        }
      )

      if (confirmed) {
        this.$emit('kick-member', member)
      }
    },

    async banMember (member) {
      const confirmed = await this.$bvModal.msgBoxConfirm(
        `คุณต้องการแบน ${member.fullname} จากห้องนี้หรือไม่?\nผู้ใช้ที่ถูกแบนจะไม่สามารถเข้าร่วมห้องได้อีก`,
        {
          title: 'ยืนยันการแบน',
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'แบน',
          cancelTitle: 'ยกเลิก',
          centered: true
        }
      )

      if (confirmed) {
        this.$emit('ban-member', member)
      }
    }
  }
}
</script>

<style scoped>
.member-list-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.member-list-header {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-btn {
  color: white;
  padding: 4px 8px;
}

.toggle-btn:hover {
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.1);
}

.member-search {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

.search-input {
  border-radius: 20px;
  border: 1px solid #dee2e6;
}

.member-list {
  max-height: 400px;
}

.member-list.scrollable {
  overflow-y: auto;
}

.member-section {
  padding: 8px 0;
}

.section-divider {
  padding: 8px 16px 4px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.member-item:hover {
  background: #f8f9fa;
}

.member-item.online:hover {
  background: rgba(40, 167, 69, 0.05);
}

.member-avatar-wrapper {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #28a745;
  border: 2px solid white;
  border-radius: 50%;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-status {
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.member-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.member-item:hover .member-actions {
  opacity: 1;
}

.empty-state {
  padding: 32px 16px;
}

/* Member Profile Modal */
.member-profile {
  text-align: left;
}

.member-status-badge {
  margin-bottom: 16px;
}

.member-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.profile-actions {
  text-align: center;
}

/* Scrollbar styling */
.member-list::-webkit-scrollbar {
  width: 6px;
}

.member-list::-webkit-scrollbar-track {
  background: transparent;
}

.member-list::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 3px;
}

.member-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .member-list-container {
    margin-bottom: 16px;
  }

  .member-item {
    padding: 8px 12px;
  }

  .member-name {
    font-size: 0.9rem;
  }

  .member-status {
    font-size: 0.75rem;
  }
}

@keyframes online-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.online-indicator {
  animation: online-pulse 2s infinite;
}
</style>
