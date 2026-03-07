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
              :class="{ 'active': activeRoomId === room._id }"
              @click="goToRoom(room._id)"
            >
              <span class="channel-prefix">#</span>
              <span class="channel-name">{{ room.name }}</span>
              <div v-if="room.unreadCount" class="unread-badge">
                {{ room.unreadCount }}
              </div>
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
                  <b-dropdown-item style="font-size: 18px;" @click="viewFriendProfile(friend)">
                    <i class="fas fa-user" /> ดูโปรไฟล์
                  </b-dropdown-item>
                  <b-dropdown-item style="font-size: 18px;" @click="openDirectMessage(friend)">
                    <i class="fas fa-comments" /> ส่งข้อความ
                  </b-dropdown-item>
                  <b-dropdown-item style="font-size: 18px;" class="text-danger" @click="removeFriend(friend.friendId)">
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
              <div class="friend-actions" style="font-size: 18px;">
                <b-dropdown right variant="link" toggle-class="p-0" style="font-size: 18px;">
                  <template #button-content>
                    <i class="fas fa-ellipsis-v" />
                  </template>
                  <b-dropdown-item style="font-size: 18px;" @click="viewFriendProfile(friend)">
                    <i class="fas fa-user" /> ดูโปรไฟล์
                  </b-dropdown-item>
                  <b-dropdown-item style="font-size: 18px;" @click="openDirectMessage(friend)">
                    <i class="fas fa-comments" /> ส่งข้อความ
                  </b-dropdown-item>
                  <b-dropdown-item class="text-danger" style="font-size: 18px;" @click="removeFriend(friend.friendId)">
                    <i class="fas fa-trash" /> ลบเพื่อน
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </div>
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
        <div
          class="d-flex align-items-center w-100"
          style="
            background: linear-gradient(90deg, #ff6b9d, #c44cd8);
            border-radius: 8px 8px 0 0;
            padding: 12px 16px;
            color: white;
          "
        >
          <i class="fas fa-plus-circle mr-2" style="font-size: 20px;" />
          <h5 class="mb-0">
            สร้างห้องแชทใหม่
          </h5>
        </div>
      </template>

      <b-form
        class="create-room-form"
        style="font-size: 18px;"
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
            style="font-size: 16px;"
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
              :style="{
                background: gradient,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                border: newRoom.iconGradient === gradient ? '3px solid #007bff' : '2px solid #ccc',
                transition: '0.2s ease'
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
            style="background-color: #f5f5f5; color: #333; border: 1px solid #ccc;"
            @click="showCreateRoom = false"
          >
            ยกเลิก
          </b-button>
          <b-button type="submit" variant="primary">
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
            v-for="searchUser in searchResults"
            :key="searchUser._id"
            class="user-result"
          >
            <div class="user-avatar">
              <img v-if="searchUser.avatar" :src="searchUser.avatar" :alt="searchUser.fullname">
              <div v-else class="avatar-placeholder">
                {{ searchUser.initials }}
              </div>
            </div>
            <div class="user-info">
              <h4>{{ searchUser.fullname }}</h4>
              <p>{{ searchUser.email }}</p>
            </div>
            <b-button
              class="friend-action-btn"
              :variant="getFriendButtonClass(searchUser)"
              :disabled="searchUser.friendStatus === 'pending_sent' || sendingRequest === searchUser._id"
              @click="sendFriendRequest(searchUser)"
            >
              <i v-if="sendingRequest === searchUser._id" class="fas fa-spinner fa-spin" />
              <i v-else :class="getFriendButtonIcon(searchUser)" />
              {{ getFriendButtonText(searchUser) }}
            </b-button>
          </div>
        </div>

        <div v-else-if="userSearchQuery && !isSearching && searchResults.length === 0" class="empty-state">
          <i class="fas fa-user-slash" />
          <p style="color: black;">
            ไม่พบผู้ใช้ที่ค้นหา
          </p>
        </div>

        <div class="modal-actions">
          <b-button variant="secondary" @click="closeModal">
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
          <b-button variant="secondary" @click="showJoinPasswordModal = false">
            ยกเลิก
          </b-button>
          <b-button type="submit" variant="primary">
            เข้าร่วมห้อง
          </b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import SettingDialog from '~/components/setting.vue'

export default {
  name: 'CommunityChat',
  components: { SettingDialog },
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
        'linear-gradient(135deg, #ff6b6b, #f06595)',
        'linear-gradient(135deg, #00b4d8, #0077b6)',
        'linear-gradient(135deg, #f78fb3, #f8a5c2)',
        'linear-gradient(135deg, #6f42c1, #007bff)',
        'linear-gradient(135deg, #74b9ff, #a29bfe)',
        'linear-gradient(135deg, #6c757d, #adb5bd)'
      ],
      joinPassword: '',
      sidebarOpen: false,
      joinRoomIdPending: null
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
    async getProfile () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_USER_BY_ID)
        if (res.status === 'success') {
          this.profile = res.result
        }
      } catch (err) {
        console.error(err)
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
        console.error(err)
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
        console.error('Error getting rooms:', err)
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
        console.error('Error getting counts:', err)
        this.isLoading = false
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
        console.error(err)
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
        console.error(err)
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

    getInitials (username) {
      if (!username) { return '?' }
      return username.substring(0, 2).toUpperCase()
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
        console.error('Error loading friends:', err)
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

        // console.log('Pending friend requests:', this.friendRequests)
      } catch (err) {
        console.error('Error loading pending requests:', err)
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
        console.error(err)
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
        console.error(err)
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
        console.error(err)
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
        console.error(err)
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
        console.error(err)
        this.$swal({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'ไม่สามารถลบเพื่อนได้'
        })
      }
    },
    openDirectMessage (friend) {
      if (window.innerWidth <= 768) {
        this.closeSidebar()
      }
      this.$router.push({ path: '/chat/direct', query: { friendId: friend._id, friendName: friend.fullname, isOnline: friend.isOnline } })
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
* {
  box-sizing: border-box;
}

.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 101;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
  transition: all 0.3s;
}

.mobile-menu-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.6);
}

.mobile-menu-toggle:active {
  transform: scale(0.95);
}

.mobile-menu-toggle i {
  transition: transform 0.3s;
}

.mobile-menu-toggle.open i {
  transform: rotate(90deg);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.sidebar-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.friend-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: 18px;
}
.friend-actions .dropdown-toggle::after {
  display: none;
}

.community-chat-app {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

.community-chat-app::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.08) 0%, transparent 60%);
  animation: gradientShift 15s ease infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes gradientShift {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(5%, 5%) rotate(5deg); }
}

.sidebar {
  width: 280px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(168, 85, 247, 0.15);
  position: relative;
  z-index: 1;
  box-shadow: 4px 0 30px rgba(168, 85, 247, 0.1);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(51, 65, 85, 0.5);
}

.workspace-info {
  display: flex;
  align-items: center;
}

.workspace-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4); }
  50% { box-shadow: 0 4px 30px rgba(168, 85, 247, 0.6); }
}

.workspace-details h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #f1f5f9;
}

.workspace-members {
  font-size: 12px;
  color: #94a3b8;
}

.sidebar-toggle {
  background: rgba(148, 163, 184, 0.1);
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar-toggle:hover {
  background: rgba(168, 85, 247, 0.2);
  color: #ffffff;
  transform: scale(1.05);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  position: relative;
  background: rgb(255, 255, 255);
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  margin-bottom: 6px;
}

.section-header h6 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.add-channel-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.add-channel-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  transform: rotate(90deg);
}

.channels-list,
.friends-list {
  padding: 0 10px;
}

.channel-item,
.friend-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.channel-item:hover,
.friend-item:hover {
  background: rgba(148, 163, 184, 0.1);
  transform: translateX(4px);
}

.channel-item.active {
  background: rgba(168, 85, 247, 0.2);
  color: #ffffff;
}

.channel-prefix {
  color: #94a3b8;
  font-weight: 500;
  margin-right: 10px;
  font-size: 16px;
}

.channel-name,
.friend-name {
  font-size: 16px;
  flex: 1;
  font-weight: 500;
  color: #343a40;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.user-avatar img,
.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(168, 85, 247, 0.3);
}

.avatar-placeholder {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1e293b;
}

.status-indicator.online {
  background: #10b981;
}

.status-indicator.offline {
  background: #6b7280;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 15px;
  font-weight: 500;
  color: #212529f0;
  display: block;
}

.last-message {
  font-size: 12px;
  color: #64748b;
  display: block;
}

.friend-item.offline {
  opacity: 0.5;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.friend-requests {
  padding: 0 10px;
  margin-bottom: 16px;
}

.friend-request {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.request-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.request-actions {
  display: flex;
  gap: 6px;
}

.btn-accept,
.btn-reject {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-accept {
  color: #10b981;
}

.btn-accept:hover {
  background: rgba(16, 185, 129, 0.1);
}

.btn-reject {
  color: #ef4444;
}

.btn-reject:hover {
  background: rgba(239, 68, 68, 0.1);
}

.user-profile {
  padding: 16px;
  background: rgba(15, 23, 42, 0.9);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.user-details {
  margin-left: 12px;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  display: block;
}

.user-status {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: 6px;
}

.user-action-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.user-action-btn:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #e2e8f0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  position: relative;
  z-index: 1;
}

.main-header {
  padding: 24px 32px;
  background: rgb(58 30 59 / 80%);;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #f1f5f9;
}

.header-left p {
  margin: 0;
  font-size: 16px;
  color: #94a3b8;
}

.search-container {
  width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #64748b;
  font-size: 14px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 24px;
  color: #e2e8f0;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  background: rgba(51, 65, 85, 0.7);
  border-color: #a855f7;
}

.categories-filter {
  padding: 16px 32px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: #3f244a;
  margin-bottom: 0;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-tab {
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  padding: 10px 20px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tab:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: #a855f7;
  color: #ffffff;
}

.filter-tab.active {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: #ffffff;
  border-color: #a855f7;
}

.rooms-container {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #650072  0%, #334155 100%);
  padding: 24px 32px;
  margin-top: 0;
  margin-bottom: 0;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.room-card {
  background: #fff;
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.room-card::before {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(210, 161, 255, 0.178) 0%, transparent 70%);
  opacity: 0;
  color: white !important;
  transition: opacity 0.3s;
}

.room-card:hover {
  transform: translateY(-8px) scale(1.02);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%);
  border-color: #a855f7;
  box-shadow: 0 20px 40px rgba(168, 85, 247, 0.3), 0 0 0 1px rgba(168, 85, 247, 0.2);
}

.room-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.room-icon-wrapper {
  margin-right: 16px;
}

.room-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.room-title {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffd900;
}

.room-category {
  font-size: 12px;
  color: #a78bfa;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.room-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #10b981;
}

.status-dot.offline {
  background: #6b7280;
}

.room-description {
  margin-bottom: 16px;
}

.room-description p {
  margin: 0;
  font-size: 14px;
  color: #969494;
  line-height: 1.5;
}

.room-tags {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: rgba(168, 85, 247, 0.1);
  color: #a78bfa;
  padding: 6px 12px;
  border-radius: 24px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(168, 85, 247, 0.2);
  transition: all 0.2s;
}

.tag:hover {
  background: rgba(168, 85, 247, 0.2);
  border-color: #a855f7;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.join-btn {
  flex: 1;
  background: #FFC107;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.join-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #9333ea, #FFC107);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.4);
}

.join-btn:disabled,
.join-btn.disabled {
  background: rgba(107, 114, 128, 0.3);
  color: #6b7280;
  cursor: not-allowed;
}

.create-room-modal-body,
.add-friend-modal-body {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  color: #ffffff;
  border-radius: 12px;
}

.create-room-form,
.add-friend-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.form-input,
.form-select,
.form-textarea {
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  padding: 12px 16px;
  outline: none;
  transition: all 0.2s;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #64748b;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #a855f7;
  background: rgba(51, 65, 85, 0.7);
}

.form-actions,
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #9333ea, #db2777);
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.2);
}

.search-user-section {
  margin-bottom: 20px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-top: 2px solid #a855f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #64748b;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.user-result {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(51, 65, 85, 0.5);
  border-radius: 8px;
  gap: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  transition: all 0.2s;
}

.user-result:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: #a855f7;
}

.user-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
}

.user-info p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.friend-action-btn {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.friend-action-btn.primary {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: white;
}

.friend-action-btn.primary:hover {
  background: linear-gradient(135deg, #9333ea, #db2777);
}

.friend-action-btn.secondary {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.friend-action-btn.secondary:hover {
  background: rgba(148, 163, 184, 0.2);
}

.friend-action-btn.success {
  background: #10b981;
  color: white;
}

.friend-action-btn.success:hover {
  background: #059669;
}

.friend-action-btn.warning {
  background: #f59e0b;
  color: white;
}

.friend-action-btn.warning:hover {
  background: #d97706;
}

.friend-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
}

.community-hero {
  background: linear-gradient(135deg, #e944ff  0%, #334155 100%);
  text-align: center;
  padding: 14px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.community-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.community-content {
  position: relative;
  z-index: 2;
}

.community-icon-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border-radius: 50%;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.3);
}

.community-icon-large i {
  font-size: 24px;
  color: white;
}

.community-title {
  font-size: 36px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 12px;
}

.community-subtitle {
  font-size: 16px;
  color: #cbd5e1;
  line-height: 1.6;
}

.user-welcome-card {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 24px;
  padding: 10px 20px;
  margin-top: 16px;
  transition: all 0.2s;
}

.user-welcome-card:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: #a855f7;
}

.welcome-text {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 500;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 101;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
  transition: all 0.3s;
}

.mobile-menu-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.6);
}

.mobile-menu-toggle:active {
  transform: scale(0.95);
}

/* Sidebar Overlay for Mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .sidebar {
    width: 260px;
  }

  .rooms-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .main-header {
    padding: 20px 24px;
  }

  .rooms-container {
    padding: 20px 24px;
  }
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    width: 280px;
    z-index: 100;
    transition: left 0.3s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .main-content {
    width: 100%;
  }

  .main-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 16px 20px;
    padding-top: 72px;
  }

  .header-left h1 {
    font-size: 24px;
  }

  .header-left p {
    font-size: 14px;
  }

  .search-container {
    width: 100%;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .rooms-container {
    padding: 16px 20px;
  }

  .community-hero {
    padding: 20px 16px;
  }

  .community-title {
    font-size: 28px;
  }

  .community-subtitle {
    font-size: 14px;
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-tab {
    padding: 8px 16px;
    font-size: 13px;
  }

  .categories-filter {
    padding: 12px 20px;
  }
}

@media (max-width: 640px) {
  .workspace-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .workspace-details h4 {
    font-size: 15px;
  }

  .main-header {
    padding: 12px 16px;
  }

  .header-left h1 {
    font-size: 20px;
  }

  .rooms-container {
    padding: 12px 16px;
  }

  .room-card {
    padding: 20px;
  }

  .room-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .room-title {
    font-size: 16px;
  }

  .community-hero {
    padding: 16px 12px;
    border-radius: 0;
  }

  .community-title {
    font-size: 24px;
  }

  .community-icon-large {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  }

  .community-icon-large i {
    font-size: 20px;
  }

  .user-welcome-card {
    padding: 8px 16px;
    font-size: 14px;
  }

  .filter-tabs {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .filter-tab {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .categories-filter {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .room-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .room-icon-wrapper {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .room-stats {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .room-actions {
    flex-direction: column;
  }

  .join-btn {
    width: 100%;
  }

  .user-profile {
    padding: 12px;
  }

  .user-avatar img,
  .avatar-placeholder {
    width: 32px;
    height: 32px;
  }

  .user-name {
    font-size: 13px;
  }

  .user-status {
    font-size: 11px;
  }

  .sidebar-header {
    padding: 16px;
  }

  .section-header {
    padding: 8px 16px;
  }

  .channels-list,
  .friends-list {
    padding: 0 8px;
  }

  .friend-requests {
    padding: 0 8px;
  }
}
</style>
