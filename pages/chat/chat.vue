<template>
  <div class="community-chat-app">
    <button class="mobile-menu-toggle" :class="{ open: sidebarOpen }" @click="toggleSidebar">
      <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'" />
    </button>

    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar" />

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="workspace-info">
          <div class="workspace-icon">
            <i class="fas fa-comments" />
          </div>
          <div class="workspace-details">
            <h4>Community</h4>
            <span class="workspace-members">{{ profile.firstName }} {{ profile.lastName }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-content">
        <div class="section">
          <div class="section-header">
            <h6>ช่องแชทรวมของฉัน</h6>
            <button class="add-channel-btn" @click="showCreateRoom = true">
              <i class="fas fa-plus" />
            </button>
          </div>
          <div class="channels-list">
            <div
              v-for="room in joinedRooms"
              :key="room._id"
              class="channel-item"
              :class="{ active: activeRoomId === room._id }"
            >
              <!-- ส่วนกดเข้าห้อง -->
              <div
                class="channel-main"
                @click="goToRoom(room._id)"
              >
                <span class="channel-prefix">#</span>

                <span class="channel-name">
                  {{ room.name }}
                </span>

                <div
                  v-if="room.unreadCount"
                  class="unread-badge"
                >
                  {{ room.unreadCount }}
                </div>
              </div>

              <b-btn
                variant="danger"
                size="sm"
                class="leave-channel-btn"
                @click="removeJoinRoom(room._id)"
              >
                <i class="fas fa-sign-out-alt" />
              </b-btn>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h6>เพื่อนของฉัน</h6>
            <button class="add-channel-btn" @click="showAddFriend = true">
              <i class="fas fa-user-plus" />
            </button>
          </div>

          <div v-if="friendRequests.length > 0" class="friend-requests">
            <div
              v-for="request in friendRequests"
              :key="request._id"
              class="friend-request"
            >
              <div class="user-avatar">
                <img v-if="request.avatar" :src="request.avatar" :alt="request.userName">
                <div v-else class="avatar-placeholder">
                  {{ request.userInitials }}
                </div>
              </div>
              <div class="request-info">
                <span class="user-name">{{ request.userName }}</span>
                <div class="request-actions">
                  <button class="btn-accept" @click="acceptFriend(request._id)">
                    <i class="fas fa-check" />
                  </button>
                  <button class="btn-reject" @click="rejectFriend(request._id)">
                    <i class="fas fa-times" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="friends-list">
            <div
              v-for="friend in onlineFriends"
              :key="friend.friendId"
              class="friend-item online"
            >
              <div class="user-avatar" @click="openDirectMessage(friend)">
                <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.displayName">
                <div v-else class="avatar-placeholder">
                  {{ getInitials(friend.displayName) }}
                </div>
                <div class="status-indicator online" />
              </div>
              <div class="friend-info" @click="openDirectMessage(friend)">
                <span class="friend-name">{{ friend.displayName }}</span>
                <span v-if="friend.lastMessage" class="last-message">{{ friend.lastMessage }}</span>
              </div>
              <div v-if="friend.unreadCount" class="unread-badge">
                {{ friend.unreadCount }}
              </div>
              <div class="friend-actions">
                <b-dropdown right variant="link" toggle-class="p-0">
                  <template #button-content>
                    <i class="fas fa-ellipsis-v" />
                  </template>
                  <b-dropdown-item @click="viewFriendProfile(friend)">
                    <i class="fas fa-user" /> ดูโปรไฟล์
                  </b-dropdown-item>
                  <b-dropdown-item @click="openDirectMessage(friend)">
                    <i class="fas fa-comments" /> ส่งข้อความ
                  </b-dropdown-item>
                  <b-dropdown-item class="text-danger" @click="removeFriend(friend.friendId)">
                    <i class="fas fa-trash" /> ลบเพื่อน
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>

            <div
              v-for="friend in offlineFriends"
              :key="friend.friendId"
              class="friend-item offline"
              @click="openDirectMessage(friend)"
            >
              <div class="user-avatar">
                <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.displayName">
                <div v-else class="avatar-placeholder">
                  {{ getInitials(friend.displayName) }}
                </div>
                <div class="status-indicator offline" />
              </div>
              <div class="friend-info">
                <span class="friend-name">{{ friend.displayName }}</span>
              </div>
              <div v-if="friend.unreadCount" class="unread-badge">
                {{ friend.unreadCount }}
              </div>
              <div class="friend-actions">
                <b-dropdown right variant="link" toggle-class="p-0">
                  <template #button-content>
                    <i class="fas fa-ellipsis-v" />
                  </template>
                  <b-dropdown-item @click="viewFriendProfile(friend)">
                    <i class="fas fa-user" /> ดูโปรไฟล์
                  </b-dropdown-item>
                  <b-dropdown-item @click="openDirectMessage(friend)">
                    <i class="fas fa-comments" /> ส่งข้อความ
                  </b-dropdown-item>
                  <b-dropdown-item class="text-danger" @click="removeFriend(friend.friendId)">
                    <i class="fas fa-trash" /> ลบเพื่อน
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- Direct Messages Section -->
        <div class="section">
          <div class="section-header">
            <h6>ข้อความส่วนตัว</h6>
          </div>
          <div class="dm-list">
            <!-- TODO: Show active DM conversations here -->
            <div v-if="activeDMs.length === 0" class="empty-dm">
              <i class="fas fa-comments" />
              <span>ยังไม่มีข้อความส่วนตัว</span>
            </div>
            <div
              v-for="dm in activeDMs"
              :key="dm.friendId"
              class="dm-item"
              :class="{ active: selectedFriend && selectedFriend.friendId === dm.friendId }"
              @click="openDirectMessage(dm)"
            >
              <div class="dm-avatar">
                <img v-if="dm.avatar" :src="dm.avatar" :alt="dm.displayName">
                <div v-else class="avatar-placeholder">
                  {{ getInitials(dm.displayName) }}
                </div>
                <div v-if="dm.unreadCount" class="dm-unread-badge">
                  {{ dm.unreadCount }}
                </div>
              </div>
              <div class="dm-info">
                <span class="dm-name">{{ dm.displayName }}</span>
                <span class="dm-last-message">{{ dm.lastMessage || 'เริ่มการสนทนา...' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h6>มินิเกม</h6>
          </div>
          <div style="padding: 0 12px;">
            <nuxt-link to="/game" class="game-sidebar-btn">
              <span class="game-btn-icon">☣</span>
              <div class="game-btn-text">
                <span class="game-btn-title">Zombie Strike</span>
                <span class="game-btn-sub">Multiplayer Co-op</span>
              </div>
              <i class="fas fa-chevron-right game-btn-arrow" />
            </nuxt-link>
          </div>
        </div>
      </div>

      <div class="user-profile">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="user?.avatar" :src="user.avatar" :alt="userName">
            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>
            <div class="status-indicator online" />
          </div>
          <div class="user-details">
            <span class="user-name">{{ profile.displayName }}</span>
            <span class="user-status">ออนไลน์</span>
          </div>
        </div>
        <div class="user-actions">
          <button class="user-action-btn" @click="setting">
            <i class="fas fa-cog" />
          </button>
          <button class="user-action-btn" @click="logout">
            <i class="fas fa-sign-out-alt" />
          </button>
        </div>
        <SettingDialog ref="SettingDialog" />
      </div>
    </aside>

    <main class="main-content">
      <header class="main-header">
        <div class="header-left">
          <span class="eyebrow">Community</span>
          <h1>ชุมชนสำหรับคุณ</h1>
          <p>เลือกช่องทางที่คุณสนใจเพื่อเริ่มการสนทนา</p>
        </div>
        <div class="header-right">
          <div class="search-container">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาช่องทาง..."
                class="search-input"
              >
            </div>
          </div>
        </div>
      </header>

      <div class="community-hero">
        <div class="community-content">
          <i class="community-icon-large fas fa-comments" />
          <h3 class="community-title">
            Community Chat
          </h3>
          <p class="community-subtitle">
            เลือกห้องแชทที่ตรงกับความสนใจของคุณและเริ่มต้นการสนทนาที่น่าสนใจ
          </p>
        </div>
      </div>

      <div class="categories-filter">
        <div class="filter-tabs">
          <button
            v-for="category in categories"
            :key="category.key"
            class="filter-tab"
            :class="{ 'active': activeCategory === category.key }"
            @click="activeCategory = category.key"
          >
            <i :class="`fas fa-${category.icon}`" />
            {{ category.name }}
          </button>
        </div>
      </div>

      <div class="rooms-container">
        <div class="rooms-grid">
          <div
            v-for="room in filteredUnjoinedRooms"
            :key="room._id"
            class="room-card"
          >
            <div class="room-card-header">
              <div class="room-icon-wrapper">
                <div
                  class="room-icon"
                  :style="{ background: room.iconGradient }"
                >
                  <i :class="`fas fa-${room.icon}`" />
                </div>
              </div>
              <div class="room-meta">
                <h3 class="room-title">
                  {{ room.name }}
                </h3>
                <span class="room-category">{{ room.categoryName }}</span>
              </div>
            </div>

            <div class="room-stats">
              <div class="stat-item">
                <i class="fas fa-users" />
                <span>{{ room.memberCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-comments" />
                <span>{{ room.messageCount || 0 }}</span>
              </div>
              <div class="stat-item status">
                <div class="status-dot" :class="room.status === 'ออนไลน์' ? 'online' : 'offline'" />
                <span>{{ room.status }}</span>
              </div>
            </div>

            <div class="room-description">
              <p>{{ room.description }}</p>
            </div>

            <div class="room-tags">
              <span
                v-for="tag in room.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="room-actions">
              <button
                v-if="room.status === 'ออนไลน์'"
                class="join-btn"
                :disabled="joiningRoom === room._id || isUserInRoom(room._id)"
                @click="joinRoom(room._id)"
              >
                <i v-if="joiningRoom === room._id" class="fas fa-spinner fa-spin" />
                <i v-else :class="room.type === 'private' ? 'fas fa-lock' : 'fas fa-sign-in-alt'" />
                {{ joiningRoom === room._id ? 'กำลังเข้าร่วม...' : (room.type === 'private' ? 'เข้าร่วม (Private)' : 'เข้าร่วม') }}
              </button>
              <button v-else class="join-btn disabled" disabled>
                <i class="fas fa-lock" />
                ไม่พร้อมใช้งาน
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <b-modal
      v-model="showCreateRoom"
      hide-footer
      size="lg"
    >
      <template #modal-header>
        <div class="modal-header-bar">
          <i class="fas fa-plus-circle mr-2" />
          <h5 class="mb-0">
            สร้างห้องแชทใหม่
          </h5>
        </div>
      </template>

      <b-form
        class="create-room-form"
        @submit.stop.prevent="createRoom"
      >
        <b-form-group label="ชื่อช่องทาง" label-for="roomName">
          <b-form-input
            id="roomName"
            v-model="newRoom.name"
            type="text"
            placeholder="ระบุชื่อช่องทาง"
            required
          />
        </b-form-group>

        <b-form-group label="หมวดหมู่" label-for="roomCategory">
          <b-form-select
            id="roomCategory"
            v-model="newRoom.category"
            :options="categoryOptions"
            required
          />
        </b-form-group>

        <b-form-group label="ประเภทห้อง" label-for="roomType">
          <b-form-radio-group
            id="roomType"
            v-model="newRoom.type"
            :options="[
              { text: 'สาธารณะ (Public)', value: 'public' },
              { text: 'ส่วนตัว (Private)', value: 'private' }
            ]"
          />
        </b-form-group>

        <b-form-group
          v-if="newRoom.type === 'private'"
          label="รหัสผ่านห้อง"
          label-for="roomPassword"
        >
          <b-form-input
            id="roomPassword"
            v-model="newRoom.password"
            type="password"
            placeholder="กรอกรหัสผ่านสำหรับห้อง"
            required
          />
        </b-form-group>

        <div class="mb-3">
          <label for="tags-limit">เพิ่ม Tags</label>
          <b-form-tags
            v-model="newRoom.tags"
            input-id="tags-limit"
            :limit="limit"
            remove-on-delete
            placeholder="เพิ่ม tags"
          />
        </div>

        <b-form-group label="คำอธิบาย" label-for="roomDescription">
          <b-form-textarea
            id="roomDescription"
            v-model="newRoom.description"
            placeholder="อธิบายเกี่ยวกับช่องทางนี้"
            rows="3"
          />
        </b-form-group>

        <b-form-group label="สีไอคอน">
          <div class="d-flex flex-wrap" style="gap: 10px;">
            <div
              v-for="(gradient, index) in gradients"
              :key="index"
              class="swatch"
              :style="{
                background: gradient,
                border: newRoom.iconGradient === gradient ? '3px solid #FF5A45' : '2px solid rgba(255,255,255,0.18)'
              }"
              @click="newRoom.iconGradient = gradient"
            />
          </div>
          <small class="text-muted">
            เลือกสีพื้นหลังของไอคอน หรือปล่อยว่างให้ระบบกำหนดอัตโนมัติ
          </small>
        </b-form-group>

        <div class="d-flex justify-content-end" style="gap: 15px;">
          <b-button
            class="btn-secondary"
            @click="showCreateRoom = false"
          >
            ยกเลิก
          </b-button>
          <b-button type="submit" class="btn-primary">
            สร้างช่องทาง
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <!-- Add Friend Modal -->
    <b-modal
      v-model="showAddFriend"
      title="เพิ่มเพื่อน"
      centered
      hide-footer
      body-class="add-friend-modal-body"
    >
      <div class="add-friend-form">
        <div class="search-user-section">
          <validation-observer ref="observer" v-slot="{ handleSubmit }">
            <b-form @submit.stop.prevent="handleSubmit(searchUsers)">
              <validation-provider
                v-slot="validationContext"
                name="searchUser"
                :rules="{ required: true }"
              >
                <b-form-group label="ค้นหาชื่อผู้ใช้หรืออีเมล" label-for="searchUser">
                  <b-input-group>
                    <b-form-input
                      id="searchUser"
                      v-model="userSearchQuery"
                      :state="getValidationState(validationContext)"
                      placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล..."
                    />
                    <b-input-group-append>
                      <b-button variant="primary" type="submit">
                        <i class="fas fa-search" />
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                  <b-form-invalid-feedback>
                    {{ validationContext.errors[0] }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </validation-provider>
            </b-form>
          </validation-observer>
        </div>

        <div v-if="isSearching" class="loading-state">
          <div class="spinner" />
          <span>กำลังค้นหา...</span>
        </div>

        <div v-else-if="searchResults.length > 0" class="search-results">
          <div
            v-for="resultUser in searchResults"
            :key="resultUser._id"
            class="user-result"
          >
            <div class="user-avatar">
              <img v-if="resultUser.avatar" :src="resultUser.avatar" :alt="resultUser.fullname">
              <div v-else class="avatar-placeholder">
                {{ resultUser.initials }}
              </div>
            </div>
            <div class="user-info">
              <h4>{{ resultUser.fullname }}</h4>
              <p>{{ resultUser.email }}</p>
            </div>
            <b-button
              class="friend-action-btn"
              :variant="getFriendButtonClass(resultUser)"
              :disabled="resultUser.friendStatus === 'pending_sent' || sendingRequest === resultUser._id"
              @click="sendFriendRequest(resultUser)"
            >
              <i v-if="sendingRequest === resultUser._id" class="fas fa-spinner fa-spin" />
              <i v-else :class="getFriendButtonIcon(resultUser)" />
              {{ getFriendButtonText(resultUser) }}
            </b-button>
          </div>
        </div>

        <div v-else-if="userSearchQuery && !isSearching && searchResults.length === 0" class="empty-state">
          <i class="fas fa-user-slash" />
          <p>
            ไม่พบผู้ใช้ที่ค้นหา
          </p>
        </div>

        <div class="modal-actions">
          <b-button class="btn-secondary" @click="closeModal">
            ปิด
          </b-button>
        </div>
      </div>
    </b-modal>

    <b-modal
      v-model="showJoinPasswordModal"
      title="เข้าร่วมห้องส่วนตัว"
      centered
      hide-footer
    >
      <b-form @submit.stop.prevent="confirmJoinPrivateRoom">
        <b-form-group label="กรุณากรอกรหัสผ่าน" label-for="joinPassword">
          <b-form-input
            id="joinPassword"
            v-model="joinPassword"
            type="password"
            placeholder="รหัสผ่านห้อง"
            required
          />
        </b-form-group>
        <div class="form-actions">
          <b-button class="btn-secondary" @click="showJoinPasswordModal = false">
            ยกเลิก
          </b-button>
          <b-button type="submit" class="btn-primary">
            เข้าร่วมห้อง
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <!-- Direct Message Modal -->
    <DirectMessageModal
      ref="dmModal"
      :friend="selectedFriend"
      :current-user-id="user?._id"
    />
  </div>
</template>

<script>
import SettingDialog from '~/components/setting.vue'
import DirectMessageModal from '~/components/DirectMessageModal.vue'

export default {
  name: 'CommunityChat',
  components: { SettingDialog, DirectMessageModal },
  middleware: 'middlewareAuth',
  data () {
    const storedUser = localStorage.getItem('userData')
    const parsedUser = storedUser ? JSON.parse(storedUser) : null
    return {
      loginData: null,
      isLogin: false,
      token: null,
      user: parsedUser,
      userName: parsedUser ? parsedUser.fullname : 'Guest',
      searchQuery: '',
      activeCategory: 'all',
      activeRoomId: null,
      joiningRoom: null,
      sidebarCollapsed: false,
      showCreateRoom: false,
      showAddFriend: false,
      searchUser: '',
      categories: [],
      rooms: [],
      profile: [],
      friendRequests: [],
      friends: [],
      onlineFriends: [],
      offlineFriends: [],
      userSearchQuery: '',
      searchResults: [],
      isSearching: false,
      sendingRequest: null,
      showJoinPasswordModal: false,
      limit: 5,
      newRoom: { name: '', category: 'gaming', description: '', type: 'public', password: '', tags: [], iconGradient: '' },
      gradients: [
        'linear-gradient(135deg, #FF5A45, #FF3B30)',
        'linear-gradient(135deg, #FFC94D, #FF9F1C)',
        'linear-gradient(135deg, #7C6CF5, #5B4CDB)',
        'linear-gradient(135deg, #37C871, #1E9E56)',
        'linear-gradient(135deg, #4DB8FF, #2E86DE)',
        'linear-gradient(135deg, #9A94A6, #6B6577)'
      ],
      joinPassword: '',
      sidebarOpen: false,
      joinRoomIdPending: null,
      selectedFriend: null
    }
  },
  computed: {
    userStatus () {
      const user = JSON.parse(localStorage.getItem('userData') || '{}')
      return user.status || 'offline'
    },
    joinedRooms () {
      return this.rooms.filter(room => this.isUserInRoom(room._id))
    },
    unjoinedRooms () {
      return this.rooms.filter(room => !this.isUserInRoom(room._id))
    },
    userInitials () {
      return this.userName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
    },
    categoryOptions () {
      return this.categories
        .filter(cat => cat.key !== 'all')
        .map(cat => ({
          value: cat.key,
          text: cat.name
        }))
    },
    filteredUnjoinedRooms () {
      return this.unjoinedRooms.filter((room) => {
        if (this.activeCategory !== 'all' && room.category !== this.activeCategory) { return false }
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase()
          return (
            room.name.toLowerCase().includes(q) ||
            room.description.toLowerCase().includes(q) ||
            room.tags?.some(tag => tag.toLowerCase().includes(q))
          )
        }
        return true
      })
    },
    activeDMs () {
      // TODO: Get from store or API - for now return friends who have conversations
      return this.friends.filter(friend => friend.hasConversation).slice(0, 5) // Limit to 5 for UI
    }
  },
  async mounted () {
    this.initialize()
    this.startSessionTimeout()
    await this.getCategories()
    await this.getProfile()
    await this.getRoom()

    await this.loadFriends()

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.sidebarOpen) {
        this.closeSidebar()
      }
    })

    this.$socket.on('friendStatusUpdate', ({ friendId, status, lastSeen }) => {
      const friend = this.friends.find(f => f.friendId === friendId)
      if (friend) {
        friend.status = status
        friend.isOnline = status === 'online'
        friend.lastActive = lastSeen
        this.updateFriendLists()
      }
    })

    await this.loadFriendRequests()
    this.setupNotifications()

    const userData = localStorage.getItem('userData')
    if (userData) {
      this.user = JSON.parse(userData)
    }

    this.messageInterval = setInterval(() => {
      this.rooms.forEach((room) => {
        if (Math.random() > 0.95) {
          room.messages += Math.floor(Math.random() * 3) + 1
        }
      })
    }, 10000)
  },
  beforeDestroy () {
    if (this.messageInterval) {
      clearInterval(this.messageInterval)
    }
    document.body.style.overflow = ''
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    toggleSidebar () {
      this.sidebarOpen = !this.sidebarOpen
      if (this.sidebarOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },

    closeSidebar () {
      this.sidebarOpen = false
      document.body.style.overflow = ''
    },
    openDirectMessage (friend) {
      this.selectedFriend = friend
      this.$nextTick(() => {
        if (this.$refs.dmModal) {
          this.$refs.dmModal.open()
        }
      })
    },
    getInitials (name) {
      return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
    },
    async getProfile () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_USER_BY_ID)
        if (res.status === 'success') {
          this.profile = res.result
        }
      } catch (err) {
        this.isLoading = false
      }
    },

    setting () {
      this.$refs.SettingDialog.open()
    },

    formatNumber (num) {
      return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString()
    },

    async getCategories () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_CATEGORIES_ROOM)
        if (res.status === 'success') { this.categories = res.result }
      } catch (err) {
        this.isLoading = false
      }
    },

    async getRoom () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_ROOM)
        if (res.status === 'success') {
          this.rooms = res.result
          await this.getCountMessages()
          // console.log('Rooms loaded:', this.rooms)
        }
      } catch (err) {
        this.isLoading = false
      }
    },

    async getCountMessages () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_COUNT_ALL_CHAT_MESSAGES)
        if (res.status === 'success') {
          const counts = res.result || []
          this.rooms = this.rooms.map((room) => {
            const found = counts.find(c => c.roomId === room._id)
            return { ...room, messageCount: found ? found.count : 0 }
          })
        }
      } catch (err) {
        this.isLoading = false
      }
    },
    async removeJoinRoom (roomId) {
      try {
        const token = localStorage.getItem('token')

        await this.$axios.$post(
          process.env.API_LEAVE_ROOM_USERS,
          {
            roomId,
            userId: this.user._id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        await this.getRoom()

        if (this.activeRoomId === roomId) {
          this.activeRoomId = null
        }

        await this.$swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'ออกจากห้องเรียบร้อย'
        })
      } catch (err) {
        await this.$swal({
          icon: 'error',
          title: 'ผิดพลาด',
          text:
        err.response?.data?.message ||
        'ไม่สามารถออกจากห้องได้'
        })
      } finally {
        this.joiningRoom = null
      }
    },

    goToRoom (roomId) {
      this.activeRoomId = roomId
      if (window.innerWidth <= 768) {
        this.closeSidebar()
      }
      const roomData = this.rooms.find(r => r._id === roomId)
      if (!roomData) { return }
      this.$router.push({
        path: '/chat/room',
        query: {
          id: roomId,
          name: roomData.name,
          category: roomData.category || '',
          description: roomData.description || '',
          memberCount: roomData.memberCount || 0,
          tags: roomData.tags ? JSON.stringify(roomData.tags) : '[]',
          status: roomData.status || 'online',
          type: roomData.type || ''
        }
      })
    },

    async joinRoom (roomId) {
      const currentRoom = this.rooms.find(r => r._id === roomId)
      if (!currentRoom) { return }

      if (currentRoom.type === 'private') {
        this.joinRoomIdPending = roomId
        this.showJoinPasswordModal = true
        return
      }

      await this.joinRoomRequest(roomId)
    },

    async confirmJoinPrivateRoom () {
      if (!this.joinPassword.trim()) {
        return this.$swal({ icon: 'warning', title: 'แจ้งเตือน', text: 'กรุณากรอกรหัสผ่านก่อนเข้าห้อง' })
      }
      await this.joinRoomRequest(this.joinRoomIdPending, this.joinPassword)
      this.showJoinPasswordModal = false
      this.joinPassword = ''
    },

    async joinRoomRequest (roomId, password = null) {
      const token = localStorage.getItem('token')
      try {
        this.joiningRoom = roomId
        const roomData = this.rooms.find(r => r._id === roomId)

        const payload = {
          roomId,
          userId: this.user._id,
          fullname: this.user.fullname,
          avatar: this.user.avatar || '',
          type: roomData?.type || ''
        }

        if (password) {
          payload.password = password
        }

        const result = await this.$axios.$post(process.env.API_JOIN_ROOM_USERS, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (result.status === 'success') {
          await this.$swal({ icon: 'success', title: 'สำเร็จ', text: 'เข้าร่วมห้องสำเร็จ!' })
          await this.getRoom()
        } else {
          await this.$swal({ icon: 'error', title: 'ผิดพลาด', text: result.message })
        }
      } catch (err) {
        await this.$swal({ icon: 'error', title: 'ผิดพลาด', text: err.response?.data?.message || 'เข้าร่วมไม่สำเร็จ' })
      } finally {
        this.joiningRoom = null
      }
    },

    isUserInRoom (roomId) {
      const room = this.rooms?.find(r => r._id === roomId)
      return !!room?.members?.some(m => m.userId === this.user._id)
    },

    async createRoom () {
      if (!this.newRoom.name.trim()) {
        return this.$swal({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'กรุณาระบุชื่อห้อง'
        })
      }

      try {
        const token = localStorage.getItem('token')

        const selectedCategory = this.categories.find(cat => cat.key === this.newRoom.category)
        const categoryName = selectedCategory ? selectedCategory.name : ''
        const payload = { ...this.newRoom, categoryName }
        const response = await this.$axios.$post(process.env.API_CREATE_ROOM, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.status === 'success') {
          await this.$swal({
            icon: 'success',
            title: '🎉 สำเร็จ',
            text: `สร้างห้อง "${payload.name}" สำเร็จ!`
          })
        }
        await this.getRoom()
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ผิดพลาด',
          text: err.response?.data?.message || 'สร้างห้องไม่สำเร็จ'
        })
      } finally {
        this.showCreateRoom = false
        this.newRoom = { name: '', category: 'gaming', description: '', type: 'public', password: '', tags: [], iconGradient: '' }
      }
    },

    initialize () {
      const storedLoginData = JSON.parse(localStorage.getItem('userData'))
      if (storedLoginData) {
        this.loginData = storedLoginData
        this.isLogin = true
      }
    },

    async logout () {
      try {
        const result = await this.$swal({ title: 'ยืนยันการออกจากระบบ', text: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d', confirmButtonText: 'ออกจากระบบ', cancelButtonText: 'ยกเลิก' })
        if (result.isConfirmed) {
          this.$socket?.emit('statusChanged', { userId: this.user._id, status: 'offline' });
          ['authPayrollToken', 'token', 'userData', 'userStatus'].forEach(key => localStorage.removeItem(key))
          this.$router.push('/')
        }
      } catch (err) {
        await this.$swal({ icon: 'error', title: 'ไม่สามารถออกจากระบบได้', text: 'เกิดข้อผิดพลาดขณะพยายามออกจากระบบ' })
      }
    },

    startSessionTimeout () {
      setTimeout(() => {
        ['token', 'userData'].forEach((key) => { localStorage.removeItem(key); sessionStorage.removeItem(key) })
        this.$swal({ icon: 'warning', title: 'เซสชันหมดอายุ', text: 'กรุณาเข้าสู่ระบบใหม่' }).then(() => this.$router.push('/'))
      }, 30 * 60 * 1000)
    },

    async loadFriends () {
      try {
        const res = await this.$axios.get(process.env.API_GET_ALL_FRIENDSHIP_ID)
        const friendsData = res.data.friends || []
        const currentUserId = this.$store.state.user?._id || localStorage.getItem('userId')
        const filteredFriends = friendsData.filter(friend => friend.friendId !== currentUserId)

        this.friends = filteredFriends.map(friend => ({
          ...friend,
          avatar: friend.avatar ? `${process.env.API_BASE_URL}${friend.avatar}` : null,
          isOnline: friend.isOnline || false,
          lastMessage: friend.lastMessage || null,
          unreadCount: friend.unreadCount || 0
        }))

        this.onlineFriends = this.friends.filter(f => f.isOnline)
        this.offlineFriends = this.friends.filter(f => !f.isOnline)
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดรายชื่อเพื่อนได้'
        })
      }
    },

    async loadFriendRequests () {
      try {
        const res = await this.$axios.get(process.env.API_PENDING_FRIEND)
        this.friendRequests = (res.data.requests || []).map((r) => {
          const requester = r.requester
          const displayName = requester.displayName || `${requester.firstName || ''} ${requester.lastName || ''}`.trim() || requester.username || 'Unknown'
          return {
            _id: r._id,
            userName: displayName,
            avatar: requester.avatar,
            requestedAt: r.requestedAt
          }
        })
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดคำขอเป็นเพื่อนได้'
        })
      }
    },
    async searchUsers () {
      if (!this.userSearchQuery.trim()) {
        this.searchResults = []
        return
      }
      this.isSearching = true
      try {
        const { data } = await this.$axios.get(process.env.API_SEARCH_FRIEND, {
          params: { q: this.userSearchQuery }
        })

        const users = data.users || []
        this.searchResults = users.map(u => ({
          ...u,
          friendStatus: u.friendStatus || 'none'
        }))
      } catch (err) {
        this.searchResults = [] || this.searchResults === null
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถค้นหาผู้ใช้ได้'
        })
      } finally {
        this.isSearching = false
      }
    },

    resetSearch () {
      this.isSearching = false
      this.userSearchQuery = ''
      this.searchResults = []
    },
    closeModal () {
      this.showAddFriend = false
      this.resetSearch()
    },

    getFriendButtonClass (user) {
      const base = 'friend-action-btn'
      switch (user.friendStatus) {
        case 'friends': return `${base} success`
        case 'pending_sent': return `${base} secondary`
        case 'pending_received': return `${base} warning`
        default: return `${base} primary`
      }
    },

    getFriendButtonIcon (user) {
      switch (user.friendStatus) {
        case 'friends': return 'fas fa-check'
        case 'pending_sent': return 'fas fa-clock'
        case 'pending_received': return 'fas fa-user-plus'
        default: return 'fas fa-user-plus'
      }
    },

    getFriendButtonText (user) {
      switch (user.friendStatus) {
        case 'friends': return 'เพื่อนแล้ว'
        case 'pending_sent': return 'ส่งคำขอแล้ว'
        case 'pending_received': return 'ตอบรับ'
        default: return 'เพิ่มเพื่อน'
      }
    },

    async sendFriendRequest (targetUser) {
      if (targetUser.friendStatus !== 'none') { return }
      this.sendingRequest = targetUser._id
      try {
        await this.$axios.post(process.env.API_SEND_FRIEND, {
          recipientId: targetUser._id
        })
        targetUser.friendStatus = 'pending_sent'
        this.$swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: `ส่งคำขอเป็นเพื่อนให้ ${targetUser.displayName} แล้ว`
        })
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถส่งคำขอเป็นเพื่อนได้'
        })
      } finally {
        this.sendingRequest = null
      }
    },

    async acceptFriend (requestId) {
      try {
        await this.$axios.post(process.env.API_POST_ACCEPT_FRIENDSHIP_ID.replace(':friendshipId', requestId))
        const request = this.friendRequests.find(r => r._id === requestId)
        if (request) {
          this.onlineFriends.push({
            _id: request._id,
            fullname: request.userName,
            initials: request.userInitials,
            isOnline: true,
            lastMessage: '',
            unreadCount: 0
          })
          this.friendRequests = this.friendRequests.filter(r => r._id !== requestId)
        }
        this.$swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: `ตอบรับคำขอเป็นเพื่อนกับ ${request.userName} แล้ว`
        })
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถตอบรับคำขอเป็นเพื่อนได้'
        })
      }
    },

    async rejectFriend (requestId) {
      try {
        const confirmResult = await this.$swal({
          title: 'ยืนยันการปฏิเสธคำขอ',
          text: 'ยืนยันปฏิเสธคำขอใช่หรือไม่',
          icon: 'question',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          showCancelButton: true,
          confirmButtonColor: '#28a745'
        })

        if (confirmResult.isConfirmed) {
          const response = await this.$axios.post(process.env.API_POST_REJECT_FRIENDSHIP_ID.replace(':friendshipId', requestId))
          this.friendRequests = this.friendRequests.filter(r => r._id !== requestId)

          if (response.status === 'success') {
            await this.$swal({
              title: 'สำเร็จ!',
              text: 'คุณได้ทำการปฏิเสธคำขอเรียบร้อย',
              icon: 'success'
            })
            window.location.reload()
          }
        }
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถปฏิเสธคำขอได้'
        })
      }
    },

    async removeFriend (friendId) {
      try {
        const confirmResult = await this.$swal({
          title: 'ยืนยันการลบเพื่อน',
          text: 'ยืนยันลบเพื่อนของคุณออกใช่หรือไม่',
          icon: 'question',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          showCancelButton: true,
          confirmButtonColor: '#28a745'
        })
        if (confirmResult.isConfirmed) {
          const response = await this.$axios.delete(process.env.API_DELETE_REMOVE_FRIENDSHIP_ID.replace(':friendId', friendId))
          this.onlineFriends = this.onlineFriends.filter(f => f._id !== friendId)
          this.offlineFriends = this.offlineFriends.filter(f => f._id !== friendId)
          if (response.status === 'success') {
            await this.$swal({
              title: 'สำเร็จ!',
              text: 'คุณได้ทำการลบเพื่อนของคุณเรียบร้อย',
              icon: 'success'
            })
            window.location.reload()
          }
        }
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถลบเพื่อนได้'
        })
      }
    },

    setupNotifications () {
      if (Notification.permission === 'default') { Notification.requestPermission() }
    },

    showNotification (title, body) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' })
        setTimeout(() => notification.close(), 5000)
      }
    }
  }

}
</script>

<style scoped>
/* ============================================================
   DESIGN TOKENS — bold "sticker card" system, inspired by the
   reference dashboard: near-black chrome, punchy flat color
   blocks (coral / amber / violet), chunky confident type.
   ============================================================ */
.community-chat-app {
  --bg-app: #0C0B10;
  --bg-panel: #17151D;
  --bg-panel-raised: #1D1B25;
  --border-hair: rgba(255, 255, 255, 0.08);

  --coral: #FF5A45;
  --coral-dark: #E8412F;
  --amber: #FFC94D;
  --violet: #7C6CF5;
  --violet-dark: #5B4CDB;
  --green: #37C871;
  --grey: #6b7280;

  --text-cream: #F6F1E7;
  --text-body: #C9C4D6;
  --text-muted: #8B879C;

  /* Type scale — one scale, used everywhere. Nothing above 26px. */
  --fs-display: 26px;   /* hero titles */
  --fs-h1: 21px;        /* page headers */
  --fs-h2: 16px;        /* card titles */
  --fs-h3: 14px;        /* sub headers / workspace name */
  --fs-body: 14px;      /* default copy */
  --fs-small: 12.5px;   /* meta text */
  --fs-eyebrow: 10.5px; /* uppercase labels */

  --fw-black: 800;
  --fw-bold: 700;
  --fw-semibold: 600;
  --fw-medium: 500;

  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --radius-pill: 999px;

  --shadow-card: 0 14px 34px rgba(0, 0, 0, 0.35);
}

* { box-sizing: border-box; }

.community-chat-app {
  display: flex;
  height: 100vh;
  background: var(--bg-app);
  color: var(--text-cream);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: var(--fs-body);
  line-height: 1.5;
  position: relative;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  height: 100vh;
  background: var(--bg-panel);
  display: flex;
  overflow: hidden;
  flex-direction: column;
  border-right: 1px solid var(--border-hair);
  position: relative;
  z-index: 1;
}

.sidebar-header {
  padding: 22px 20px;
  border-bottom: 1px solid var(--border-hair);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workspace-info {
  display: flex;
  align-items: center;
}

.workspace-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, var(--coral), var(--violet));
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 18px;
  box-shadow: 0 8px 20px rgba(255, 90, 69, 0.28);
}

.workspace-details h4 {
  margin: 0;
  font-size: var(--fs-h3);
  font-weight: var(--fw-black);
  color: var(--text-cream);
  letter-spacing: -0.01em;
}

.workspace-members {
  font-size: var(--fs-small);
  color: var(--text-muted);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 16px 0;
}

.section {
  margin-bottom: 22px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 20px 12px;
}

.section-header h6 {
  margin: 0;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.add-channel-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-hair);
  color: var(--text-body);
  cursor: pointer;
  padding: 7px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  transition: all 0.2s ease;
}

.add-channel-btn:hover {
  background: var(--coral);
  border-color: var(--coral);
  color: #fff;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.channel-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.channel-item.active {
  background: rgba(124, 108, 245, 0.22);
}

.channel-main {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  cursor: pointer;
}

.channel-prefix {
  color: var(--violet);
  font-weight: var(--fw-black);
  margin-right: 4px;
  font-size: var(--fs-body);
}

.channel-name {
  color: var(--text-cream);
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
}

.unread-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--coral);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-black);
}

.leave-channel-btn {
  opacity: 0;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.channel-item:hover .leave-channel-btn {
  opacity: 1;
}

.channels-list,
.friends-list {
  padding: 0 12px;
}

.channel-item,
.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.18s ease;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
}

.channel-item:hover,
.friend-item:hover {
  background: rgba(124, 108, 245, 0.14);
  transform: translateX(2px);
}

.channel-item.active {
  background: rgba(124, 108, 245, 0.26);
  border-color: rgba(124, 108, 245, 0.4);
}

.channel-name,
.friend-name {
  font-size: var(--fs-body);
  flex: 1;
  font-weight: var(--fw-semibold);
  color: var(--text-cream);
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.user-avatar img,
.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 90, 69, 0.3);
}

.avatar-placeholder {
  background: linear-gradient(135deg, var(--coral), var(--violet));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid var(--bg-panel);
}

.status-indicator.online { background: var(--green); }
.status-indicator.offline { background: var(--grey); }

.friend-info { flex: 1; min-width: 0; }

.last-message {
  font-size: var(--fs-small);
  color: var(--text-muted);
  display: block;
  margin-top: 3px;
}

.friend-item.offline { opacity: 0.8; }

.friend-requests {
  padding: 0 10px;
  margin-bottom: 14px;
}

.friend-request {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--bg-panel-raised);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  border: 1px solid var(--border-hair);
}

.request-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-name {
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
}

.request-actions { display: flex; gap: 6px; }

.btn-accept,
.btn-reject {
  background: transparent;
  border: none;
  padding: 7px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-accept { color: var(--green); }
.btn-accept:hover { background: rgba(55, 200, 113, 0.14); }
.btn-reject { color: var(--coral); }
.btn-reject:hover { background: rgba(255, 90, 69, 0.14); }

.user-profile {
  padding: 16px 18px;
  background: var(--bg-panel);
  border-top: 1px solid var(--border-hair);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-info { display: flex; align-items: center; flex: 1; min-width: 0; }
.user-details { margin-left: 12px; min-width: 0; }

.user-details .user-name {
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
  color: var(--text-cream);
  display: block;
}

.user-status {
  font-size: var(--fs-eyebrow);
  color: var(--green);
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.user-actions { display: flex; gap: 8px; }

.user-action-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-hair);
  color: var(--text-body);
  cursor: pointer;
  padding: 9px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  transition: all 0.2s ease;
}

.user-action-btn:hover {
  background: var(--violet);
  border-color: var(--violet);
  color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
  overflow-y: auto;
  z-index: 1;
}

.main-header {
  padding: 24px 32px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border-hair);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
}

.header-left .eyebrow {
  display: block;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-bold);
  color: var(--coral);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.header-left h1 {
  margin: 0 0 6px;
  font-size: var(--fs-display);
  font-weight: var(--fw-black);
  color: var(--text-cream);
  letter-spacing: -0.01em;
}

.header-left p {
  margin: 0;
  font-size: var(--fs-body);
  color: var(--text-muted);
}

.search-container { width: 400px; min-width: 220px; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  font-size: 13px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 13px 18px 13px 44px;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: var(--radius-pill);
  color: var(--text-cream);
  font-size: var(--fs-body);
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder { color: var(--text-muted); }

.search-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--coral);
}

.categories-filter {
  padding: 16px 32px;
  border-bottom: 1px solid var(--border-hair);
  background: var(--bg-panel);
}

.filter-tabs { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

.filter-tab {
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  color: var(--text-body);
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: var(--fs-small);
  font-weight: var(--fw-bold);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.filter-tab:hover {
  border-color: rgba(255, 90, 69, 0.4);
  color: #fff;
}

.filter-tab.active {
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  color: #ffffff;
  border-color: var(--coral);
}

.rooms-container { flex: 1; overflow-y: auto; padding: 24px 32px 32px; }

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  width: min(100%, 1420px);
  margin: 0 auto;
}

/* "sticker card" — flat color, offset shadow, no gimmicky glow */
.room-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-hair);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.room-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 90, 69, 0.35);
}

.room-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.room-icon-wrapper { margin-right: 2px; }

.room-icon {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.3);
}

.room-title {
  margin: 0 0 4px;
  font-size: var(--fs-h2);
  font-weight: var(--fw-black);
  color: #ffffff;
  letter-spacing: -0.01em;
}

.room-category {
  font-size: var(--fs-eyebrow);
  color: var(--violet);
  text-transform: uppercase;
  font-weight: var(--fw-bold);
  letter-spacing: 0.06em;
}

.room-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--border-hair);
  border-bottom: 1px solid var(--border-hair);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--fs-small);
  color: var(--text-muted);
  font-weight: var(--fw-semibold);
}

.room-description p {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--text-body);
  line-height: 1.65;
}

.room-tags { margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 8px; }

.tag {
  background: rgba(124, 108, 245, 0.14);
  color: #C7BDFF;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-bold);
  border: 1px solid rgba(124, 108, 245, 0.2);
}

.room-actions { display: flex; gap: 12px; }

.join-btn {
  flex: 1;
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  color: white;
  border: none;
  padding: 13px 22px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(255, 90, 69, 0.3);
}

.join-btn:disabled,
.join-btn.disabled {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  cursor: not-allowed;
}

/* ---------- Modals ---------- */
.modal-header-bar {
  display: flex;
  align-items: center;
  width: 100%;
  background: linear-gradient(90deg, var(--coral), var(--violet));
  border-radius: 8px 8px 0 0;
  padding: 14px 18px;
  color: white;
}

.modal-header-bar i { font-size: 18px; margin-right: 10px; }
.modal-header-bar h5 { font-size: var(--fs-h2); font-weight: var(--fw-black); }

.create-room-modal-body,
.add-friend-modal-body {
  background: var(--bg-panel);
  color: var(--text-cream);
  border-radius: 16px;
}

.create-room-form,
.add-friend-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: var(--fs-body);
}

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: var(--fs-small); font-weight: var(--fw-bold); color: var(--text-cream); }

.form-input,
.form-select,
.form-textarea {
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: 14px;
  color: var(--text-cream);
  font-size: var(--fs-body);
  padding: 13px 15px;
  outline: none;
  transition: all 0.2s ease;
}

.form-input::placeholder,
.form-textarea::placeholder { color: var(--text-muted); }

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--coral);
  background: rgba(255, 255, 255, 0.08);
}

.swatch {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s ease;
}

.form-actions,
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }

.btn-primary,
.btn-secondary {
  padding: 11px 22px;
  border-radius: 14px;
  font-size: var(--fs-small);
  font-weight: var(--fw-black);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  color: white;
}
.btn-primary:hover { background: linear-gradient(135deg, var(--coral-dark), #C82E1F); }

.btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-body);
  border: 1px solid var(--border-hair);
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  color: var(--text-muted);
}

.empty-state p { color: var(--text-muted); font-size: var(--fs-body); margin-top: 8px; }

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top: 3px solid var(--coral);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-state i { font-size: 40px; margin-bottom: 14px; color: var(--text-muted); }

.search-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.user-result {
  display: flex;
  align-items: center;
  padding: 14px;
  background: var(--bg-panel-raised);
  border-radius: var(--radius-md);
  gap: 14px;
  border: 1px solid var(--border-hair);
  transition: all 0.2s ease;
}

.user-result:hover { border-color: rgba(255, 90, 69, 0.3); }

.user-info h4 { margin: 0 0 4px 0; font-size: var(--fs-h3); font-weight: var(--fw-black); color: var(--text-cream); }
.user-info p { margin: 0; font-size: var(--fs-small); color: var(--text-muted); }

.friend-action-btn {
  padding: 9px 15px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: var(--fs-eyebrow);
  font-weight: var(--fw-black);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.friend-action-btn.primary { background: linear-gradient(135deg, var(--coral), var(--coral-dark)); color: white; }
.friend-action-btn.secondary { background: rgba(255, 255, 255, 0.06); color: var(--text-body); border: 1px solid var(--border-hair); }
.friend-action-btn.success { background: var(--green); color: white; }
.friend-action-btn.warning { background: var(--amber); color: #2a1c00; }
.friend-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
::-webkit-scrollbar-thumb { background: rgba(255, 90, 69, 0.4); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 90, 69, 0.6); }

/* ---------- Hero block: flat coral card, big bold headline ---------- */
.community-hero {
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  text-align: center;
  padding: 30px 26px;
  margin: 0 32px;
  border-radius: var(--radius-lg);
  box-shadow: 0 18px 40px rgba(255, 90, 69, 0.22);
  position: relative;
  overflow: hidden;
}

.community-content { position: relative; z-index: 1; }

.community-icon-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  margin-bottom: 16px;
}

.community-icon-large i { font-size: 22px; color: white; }

.community-title {
  font-size: var(--fs-display);
  font-weight: var(--fw-black);
  color: #ffffff;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.community-subtitle {
  font-size: var(--fs-body);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.65;
  max-width: 520px;
  margin: 0 auto;
}

.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 101;
  background: linear-gradient(135deg, var(--coral), var(--coral-dark));
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(255, 90, 69, 0.4);
  transition: all 0.3s;
}

.mobile-menu-toggle:hover { transform: scale(1.05); }
.mobile-menu-toggle:active { transform: scale(0.95); }

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.active { opacity: 1; }

@media (max-width: 1024px) {
  .sidebar { width: 280px; }
  .rooms-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .main-header { padding: 20px 24px; }
  .rooms-container { padding: 20px 24px; }
  .community-hero { margin: 0 24px; }
}

@media (max-width: 768px) {
  .mobile-menu-toggle { display: flex; }
  .sidebar-overlay { display: block; }
  .sidebar { position: fixed; left: -320px; top: 0; bottom: 0; width: 320px; z-index: 100; transition: left 0.3s ease; }
  .sidebar.open { left: 0; }
  .main-content { width: 100%; }
  .main-header { flex-direction: column; gap: 14px; align-items: stretch; padding: 16px 18px; padding-top: 80px; }
  .header-left h1 { font-size: 22px; }
  .header-left p { font-size: var(--fs-small); }
  .search-container { width: 100%; }
  .rooms-grid { grid-template-columns: 1fr; gap: 16px; }
  .rooms-container { padding: 16px 18px; }
  .community-hero { padding: 22px 18px; border-radius: 20px; margin: 0 16px; }
  .community-title { font-size: 22px; }
  .community-subtitle { font-size: var(--fs-small); }
  .filter-tabs { gap: 8px; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 6px; }
  .filter-tab { padding: 9px 16px; font-size: 12px; }
  .categories-filter { padding: 12px 18px; }
}

@media (max-width: 640px) {
  .workspace-icon { width: 38px; height: 38px; font-size: 16px; }
  .workspace-details h4 { font-size: 14px; }
  .main-header { padding: 14px 16px; }
  .header-left h1 { font-size: 20px; }
  .rooms-container { padding: 12px 14px; }
  .room-card { padding: 20px; }
  .room-icon { width: 48px; height: 48px; font-size: 18px; }
  .room-title { font-size: 15px; }
  .community-hero { padding: 18px 16px; }
  .community-title { font-size: 20px; }
  .community-icon-large { width: 48px; height: 48px; margin-bottom: 12px; }
  .community-icon-large i { font-size: 18px; }
  .filter-tabs { justify-content: flex-start; }
  .filter-tab { white-space: nowrap; flex-shrink: 0; }
  .categories-filter { padding: 10px 14px; }
}

@media (max-width: 480px) {
  .room-card-header { flex-direction: column; align-items: flex-start; }
  .room-icon-wrapper { margin-right: 0; margin-bottom: 10px; }
  .room-stats { flex-direction: column; gap: 8px; align-items: flex-start; }
  .room-actions { flex-direction: column; }
  .join-btn { width: 100%; }
  .user-profile { padding: 12px; }
  .user-avatar img,
  .avatar-placeholder { width: 32px; height: 32px; }
  .user-details .user-name { font-size: 12px; }
  .user-status { font-size: 10px; }
  .sidebar-header { padding: 14px; }
  .section-header { padding: 6px 14px; }
  .channels-list,
  .friends-list { padding: 0 8px; }
  .friend-requests { padding: 0 8px; }
}

.game-sidebar-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: rgba(55, 200, 113, 0.06);
  border: 1px solid rgba(55, 200, 113, 0.18);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.game-sidebar-btn:hover {
  background: rgba(55, 200, 113, 0.14);
  border-color: rgba(55, 200, 113, 0.4);
  transform: translateX(2px);
}

.game-btn-icon {
  font-size: 20px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(55, 200, 113, 0.12);
  border-radius: 10px;
  flex-shrink: 0;
}

.game-btn-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.game-btn-title { font-size: var(--fs-small); font-weight: var(--fw-bold); color: var(--text-cream); }
.game-btn-sub { font-size: var(--fs-eyebrow); color: rgba(55, 200, 113, 0.75); text-transform: uppercase; letter-spacing: 0.04em; }
.game-btn-arrow { color: rgba(55, 200, 113, 0.5); font-size: 11px; }

.friend-actions { display: flex; align-items: center; justify-content: center; }

.friend-actions .btn-link {
  color: var(--text-muted);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background 0.2s ease, color 0.2s ease;
}

.friend-actions .btn-link:hover,
.friend-actions .btn-link:focus {
  color: #ffffff;
  background: rgba(124, 108, 245, 0.22);
  box-shadow: none;
  outline: none;
}

.friend-actions .dropdown-menu {
  background: var(--bg-panel-raised);
  border: 1px solid var(--border-hair);
  border-radius: var(--radius-md);
  padding: 6px;
  min-width: 170px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.friend-actions .dropdown-item {
  color: var(--text-cream);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: var(--fs-small) !important;
  font-weight: var(--fw-medium);
  display: flex;
  align-items: center;
  gap: 9px;
  transition: background 0.15s ease, color 0.15s ease;
}

.friend-actions .dropdown-item:hover { background: rgba(124, 108, 245, 0.18); color: #ffffff; }
.friend-actions .dropdown-item i { width: 15px; text-align: center; font-size: 13px; opacity: 0.8; }
.friend-actions .dropdown-item.text-danger { color: var(--coral) !important; }
.friend-actions .dropdown-item.text-danger:hover { background: rgba(255, 90, 69, 0.16); color: #ff8a76 !important; }

.dm-list { padding: 0 12px; }

.empty-dm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px 12px;
  color: var(--text-muted);
  font-size: var(--fs-body);
  text-align: center;
}

.empty-dm i { font-size: 22px; margin-bottom: 8px; opacity: 0.6; }

.dm-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dm-item:hover { background: rgba(255, 255, 255, 0.06); }
.dm-item.active { background: rgba(124, 108, 245, 0.2); }

.dm-avatar {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 10px;
}

.dm-avatar img { width: 100%; height: 100%; object-fit: cover; }

.dm-unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--coral);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: var(--fw-black);
  min-width: 16px;
  text-align: center;
}

.dm-info { flex: 1; min-width: 0; }

.dm-name {
  display: block;
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dm-last-message {
  display: block;
  font-size: var(--fs-small);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
</style>
