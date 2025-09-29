<template>
  <div class="community-chat-app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="workspace-info">
          <div class="workspace-icon">
            <i class="fas fa-comments" />
          </div>
          <div class="workspace-details">
            <h4>Community</h4>
            <span class="workspace-members">{{ userName }}</span>
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
              @click="openDirectMessage(friend)"
            >
              <div class="user-avatar">
                <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.displayName">
                <div v-else class="avatar-placeholder">
                  {{ getInitials(friend.displayName) }}
                </div>
                <div class="status-indicator online" />
              </div>
              <div class="friend-info">
                <span class="friend-name">{{ friend.displayName }}</span>
                <span v-if="friend.lastMessage" class="last-message">{{ friend.lastMessage }}</span>
              </div>
              <div v-if="friend.unreadCount" class="unread-badge">
                {{ friend.unreadCount }}
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
            <span class="user-name">{{ userName }}</span>
            <span class="user-status">ออนไลน์</span>
          </div>
        </div>
        <div class="user-actions">
          <SettingDialog />
          <button class="user-action-btn" @click="setting">
            <i class="fas fa-cog" />
          </button>
          <button class="user-action-btn" @click="logout">
            <i class="fas fa-sign-out-alt" />
          </button>
        </div>
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
                <i v-else class="fas fa-sign-in-alt" />
                {{ joiningRoom === room._id ? 'กำลังเข้าร่วม...' : 'เข้าร่วม' }}
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
      title="สร้างช่องทางใหม่"
      centered
      hide-footer
      body-class="create-room-modal-body"
    >
      <b-form class="create-room-form" @submit.stop.prevent="createRoom">
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

        <b-form-group label="คำอธิบาย" label-for="roomDescription">
          <b-form-textarea
            id="roomDescription"
            v-model="newRoom.description"
            placeholder="อธิบายเกี่ยวกับช่องทางนี้"
            rows="3"
          />
        </b-form-group>

        <div class="form-actions">
          <b-button variant="secondary" @click="showCreateRoom = false">
            ยกเลิก
          </b-button>
          <b-button type="submit" variant="primary">
            สร้างช่องทาง
          </b-button>
        </div>
      </b-form>
    </b-modal>

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
      newRoom: {
        name: '',
        category: 'gaming',
        description: ''
      },
      categories: [],
      rooms: [],

      friendRequests: [],
      friends: [],
      onlineFriends: [],
      offlineFriends: [],
      userSearchQuery: '',
      searchResults: [],
      isSearching: false,
      sendingRequest: null
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
    await this.getRoom()

    await this.loadFriends()

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
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },

    setting () {
      this.$swal({ icon: 'warning', title: 'setting naaa', text: 'จะไป setting หรือจ้ะ ไม่ให้หรอก' })
      this.$refs.DialogSettingLeaveType.open()
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
          console.log('Rooms loaded:', this.rooms)
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
      const roomData = this.rooms.find(r => r._id === roomId)
      if (!roomData) { return }
      this.$router.push({
        path: '/chat/room',
        query: {
          id: roomId,
          name: roomData.name || '',
          category: roomData.category || '',
          description: roomData.description || '',
          memberCount: roomData.memberCount || 0,
          tags: roomData.tags ? JSON.stringify(roomData.tags) : '[]',
          status: roomData.status || 'online'
        }
      })
    },

    async joinRoom (roomId) {
      if (!this.user) {
        return this.$swal({ icon: 'warning', title: 'ยังไม่ได้ล็อกอิน', text: 'กรุณาเข้าสู่ระบบก่อนเข้าร่วมห้อง' })
      }

      const token = localStorage.getItem('token')
      if (!token) { return }

      const currentRoom = this.rooms.find(r => r._id === roomId)
      if (currentRoom?.members?.some(m => m.userId === this.user._id)) {
        return this.$swal({ icon: 'info', title: 'แจ้งเตือน', text: 'คุณได้เข้าร่วมห้องนี้แล้ว' })
      }

      this.joiningRoom = roomId

      try {
        const payload = { roomId, userId: this.user._id, fullname: this.user.fullname, avatar: this.user.avatar || '' }
        const result = await this.$axios.$post(process.env.API_JOIN_ROOM_USERS, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })

        this.currentRoom = result
        const roomIndex = this.rooms.findIndex(r => r._id === roomId)
        if (roomIndex !== -1) {
          this.rooms[roomIndex].memberCount = result.memberCount
          this.rooms[roomIndex].members = result.members || []
          this.$set(this.rooms, roomIndex, { ...this.rooms[roomIndex] })
        }

        if (result.status === 'success') {
          this.$router.push({
            path: '/chat/room',
            query: {
              id: roomId,
              name: result.name,
              category: result.category || '',
              description: result.description || '',
              memberCount: result.memberCount || 1,
              tags: result.tags ? JSON.stringify(result.tags) : '[]',
              status: result.status || 'online',
              justJoined: 'true'
            }
          })
        }

        await this.$swal({ icon: 'success', title: 'สำเร็จ', text: `เข้าร่วมห้อง ${result.name} สำเร็จ!`, timer: 2000, showConfirmButton: false })
        await this.getRoom()
      } catch (err) {
        console.error('error joinRoom', err)
        await this.$swal({ icon: 'error', title: 'ข้อผิดพลาด', text: err.response?.data?.message || 'เข้าร่วมไม่สำเร็จ กรุณาลองใหม่' })
      } finally {
        this.joiningRoom = null
      }
    },

    isUserInRoom (roomId) {
      const room = this.rooms?.find(r => r._id === roomId)
      return !!room?.members?.some(m => m.userId === this.user._id)
    },

    createRoom () {
      if (!this.newRoom.name.trim()) {
        return this.$bvToast.toast('กรุณาระบุชื่อห้อง', { title: 'ข้อผิดพลาด', variant: 'danger', solid: true })
      }

      const categoryObj = this.categories.find(c => c.key === this.newRoom.category) || {}
      const newRoomData = {
        id: `room-${Date.now()}`,
        name: this.newRoom.name,
        category: this.newRoom.category,
        categoryName: categoryObj.name || '',
        description: this.newRoom.description || 'ห้องแชทใหม่',
        members: 1,
        messages: 0,
        status: 'ออนไลน์',
        tags: ['ใหม่'],
        icon: categoryObj.icon || 'chat',
        iconGradient: 'linear-gradient(135deg, #ffc107, #fd7e14)',
        online: true,
        featured: false,
        badge: '',
        isFavorite: false
      }

      this.rooms.unshift(newRoomData)
      this.newRoom = { name: '', category: 'gaming', description: '' }
      this.$bvModal.hide('create-room-modal')
      this.$bvToast.toast(`สร้างห้อง "${newRoomData.name}" สำเร็จ!`, { title: '🎉 สำเร็จ', variant: 'success', solid: true, autoHideDelay: 3000 })
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

        console.log('All friends loaded:', this.friends)
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

        console.log('Pending friend requests:', this.friendRequests)
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
        await this.$axios.post(process.env.API_POST_REJECT_FRIENDSHIP_ID.replace(':friendshipId', requestId))
        this.friendRequests = this.friendRequests.filter(r => r._id !== requestId)
        this.$swal({
          icon: 'info',
          title: 'แจ้งเตือน',
          text: 'ปฏิเสธคำขอเป็นเพื่อนแล้ว'
        })
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
        await this.$axios.delete(process.env.API_DELETE_REMOVE_FRIENDSHIP_ID.replace(':friendId', friendId))
        this.onlineFriends = this.onlineFriends.filter(f => f._id !== friendId)
        this.offlineFriends = this.offlineFriends.filter(f => f._id !== friendId)
        this.$swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'ลบเพื่อนสำเร็จ'
        })
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

.community-chat-app {
  display: flex;
  height: 100vh;
  background-image: radial-gradient(circle farthest-corner at 10% 20%, rgba(117,86,204,1) 0%, rgba(213,105,167,1) 90%);
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
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 60% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 30%);
  animation: float 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-10px, -15px) rotate(1deg); }
  50% { transform: translate(15px, -10px) rotate(-1deg); }
  75% { transform: translate(-5px, 10px) rotate(0.5deg); }
}

.sidebar {
  width: 280px;
  background: rgba(47, 49, 54, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.2), rgba(114, 137, 218, 0.1));
}

.workspace-info {
  display: flex;
  align-items: center;
}

.workspace-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff6b9d, #c44cd8, #5865f2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
  position: relative;
  overflow: hidden;
}

.workspace-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.workspace-details h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.workspace-members {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.sidebar-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  position: relative;
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 4px;
}

.section-header h6 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: linear-gradient(45deg, #ff6b9d, #c44cd8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.add-channel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.add-channel-btn:hover {
  background: linear-gradient(45deg, #ff6b9d, #c44cd8);
  color: #ffffff;
  transform: scale(1.1) rotate(90deg);
}

.channels-list,
.friends-list {
  padding: 0 8px;
}

.channel-item,
.friend-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(10px);
}

.channel-item:hover,
.friend-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.channel-item.active {
  background: linear-gradient(135deg, #ff6b9d, #c44cd8);
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(196, 76, 216, 0.4);
}

.channel-prefix {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin-right: 8px;
  font-size: 16px;
}

.channel-name,
.friend-name {
  font-size: 14px;
  flex: 1;
  font-weight: 500;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.user-avatar img,
.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar-placeholder {
  background: linear-gradient(135deg, #ff6b9d, #c44cd8, #5865f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(47, 49, 54, 0.95);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.status-indicator.online {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.status-indicator.offline {
  background: #747f8d;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  display: block;
}

.last-message {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: block;
}

.friend-item.offline {
  opacity: 0.6;
}

.unread-badge {
  background: linear-gradient(135deg, #ff4757, #ff3742);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.friend-requests {
  padding: 0 8px;
  margin-bottom: 16px;
}

.friend-request {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.btn-accept {
  color: #00ff88;
}

.btn-accept:hover {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: white;
  transform: scale(1.1);
}

.btn-reject {
  color: #ff4757;
}

.btn-reject:hover {
  background: linear-gradient(135deg, #ff4757, #ff3742);
  color: white;
  transform: scale(1.1);
}

.user-profile {
  padding: 12px;
  background: rgba(41, 43, 47, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.user-profile::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff6b9d, #c44cd8, transparent);
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
  color: #ffffff;
  display: block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-status {
  font-size: 12px;
  color: #00ff88;
}

.user-actions {
  display: flex;
  gap: 6px;
}

.user-action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.user-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: scale(1.1) rotate(5deg);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(54, 57, 63, 0.9);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
}

.main-header {
  padding: 24px 32px;
  background: rgba(54, 57, 63, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.main-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff6b9d, #c44cd8, transparent);
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff, #ff6b9d, #c44cd8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.header-left p {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
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
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid #ff6b9d;
  box-shadow: 0 0 20px rgba(255, 107, 157, 0.3);
  transform: translateY(-1px);
}

.categories-filter {
  padding: 20px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(54, 57, 63, 0.5);
}

.filter-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 10px 18px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.filter-tab.active {
  background: linear-gradient(135deg, #ff6b9d, #c44cd8);
  color: #ffffff;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(196, 76, 216, 0.4);
}

.rooms-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.room-card {
  background: rgba(47, 49, 54, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.room-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: all 0.5s;
}

.room-card:hover::before {
  left: 100%;
}

.room-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: #ff6b9d;
  background: rgba(47, 49, 54, 0.95);
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
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.room-title {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.room-category {
  font-size: 12px;
  background: linear-gradient(45deg, #ff6b9d, #c44cd8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.room-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.stat-item.status {
  color: rgba(255, 255, 255, 0.8);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.status-dot.online {
  background: #00ff88;
  animation: glow 2s infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 6px #00ff88; }
  50% { box-shadow: 0 0 12px #00ff88, 0 0 18px #00ff88; }
}

.status-dot.offline {
  background: #747f8d;
}

.room-description {
  margin-bottom: 16px;
}

.room-description p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.room-tags {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.room-actions {
  display: flex;
  gap: 8px;
}

.join-btn {
  flex: 1;
  background: linear-gradient(135deg, #ff6b9d, #c44cd8);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(196, 76, 216, 0.4);
}

.join-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s;
}

.join-btn:hover:not(:disabled)::before {
  left: 100%;
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(196, 76, 216, 0.6);
}

.join-btn:disabled,
.join-btn.disabled {
  background: rgba(116, 127, 141, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  box-shadow: none;
}

/* Modal Styles */
.create-room-modal-body,
.add-friend-modal-body {
  background: linear-gradient(135deg, rgba(54, 57, 63, 0.95), rgba(47, 49, 54, 0.95));
  backdrop-filter: blur(20px);
  color: #ffffff;
  border-radius: 16px;
}

.create-room-form,
.add-friend-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(45deg, #ff6b9d, #c44cd8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-input,
.form-select,
.form-textarea {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  padding: 12px 16px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #ff6b9d;
  box-shadow: 0 0 20px rgba(255, 107, 157, 0.3);
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
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
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d, #c44cd8);
  color: white;
  box-shadow: 0 4px 15px rgba(196, 76, 216, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(196, 76, 216, 0.6);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-1px);
}

/* Search Results */
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
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid #ff6b9d;
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
  background: linear-gradient(45deg, #ff6b9d, #c44cd8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  background: rgba(255, 197, 197, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-result:hover {
  background: rgba(255, 85, 179, 0.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h4 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #000000;
}

.user-info p {
  margin: 0;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.6);
}

.friend-action-btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}

.friend-action-btn.primary {
  background: linear-gradient(135deg, #ff6b9d, #c44cd8);
  color: white;
  box-shadow: 0 4px 15px rgba(196, 76, 216, 0.4);
}

.friend-action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(196, 76, 216, 0.6);
}

.friend-action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.friend-action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.friend-action-btn.success {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
}

.friend-action-btn.success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 136, 0.6);
}

.friend-action-btn.warning {
  background: linear-gradient(135deg, #ffa726, #ff9800);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 167, 38, 0.4);
}

.friend-action-btn.warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 167, 38, 0.6);
}

.friend-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ff6b9d, #c44cd8);
  border-radius: 4px;
  border: 2px solid transparent;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ff5a8a, #b33bc5);
}

/* Additional cute animations */
.workspace-icon:hover {
  animation: wiggle 0.5s ease-in-out;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

.room-icon:hover {
  animation: heartbeat 0.6s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }

  .main-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .search-container {
    width: 100%;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-tab {
    padding: 8px 14px;
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  .community-chat-app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .main-content {
    height: calc(100vh - 200px);
  }

  .main-header {
    padding: 16px 20px;
  }

  .header-left h1 {
    font-size: 24px;
  }

  .rooms-container {
    padding: 16px 20px;
  }

  .categories-filter {
    padding: 12px 20px;
  }
}

.room-card:nth-child(3n+1):hover {
  animation: rainbow 2s infinite;
}

@keyframes rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

.community-chat-app::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255, 107, 157, 0.4), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(196, 76, 216, 0.3), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(2px 2px at 160px 30px, rgba(255, 107, 157, 0.2), transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: sparkle 20s linear infinite;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

@keyframes sparkle {
  0% { transform: translateY(0px) translateX(0px); }
  100% { transform: translateY(-200px) translateX(100px); }
}

.community-hero {
  background: linear-gradient(135deg, #8B5DFF 0%, #6B46C1 50%, #9333EA 100%);
  text-align: center;
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
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.community-content {
  position: relative;
  z-index: 2;
  margin: 0 auto;
  margin-top: 15px !important;
  margin-bottom: 15px !important;
}

.community-icon-large {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(255, 193, 7, 0.9);
  border-radius: 50%;
  margin-bottom: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
}

.community-icon-large i {
  font-size: 24px;
  color: white;
}

.community-title {
  font-size: 40px;
  font-weight: 600;
  color: #FFC107;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.community-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.user-welcome-card {
  display: inline-flex;
  align-items: center;
  gap: 0px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 10px 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: default;
}

.user-welcome-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.user-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

.welcome-text {
  color: white;
  font-size: 20px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.categories-filter {
  margin-bottom: 20px;
  /* margin: 2rem 0; */
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  padding: 0 1rem;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(5px);
}

.filter-tab:hover {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.4);
  transform: translateY(-2px);
}

.filter-tab.active {
  background: linear-gradient(135deg, #FFC107, #FF8F00);
  border-color: #FFC107;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.filter-tab i {
  margin-right: 0.5rem;
}

.rooms-container {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 0 1rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.room-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.room-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {

  .community-icon-large {
    width: 60px;
    height: 60px;
  }

  .community-icon-large i {
    font-size: 28px;
  }

  .community-title {
    font-size: 2rem;
  }

  .community-subtitle {
    font-size: 1rem;
  }

  .user-welcome-card {
    padding: 10px 16px;
  }

  .filter-tabs {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .filter-tab {
    flex-shrink: 0;
    padding: 0.6rem 1.2rem;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .community-hero {
    padding: 1.5rem 0.75rem;
  }

  .community-title {
    font-size: 1.75rem;
  }

  .community-subtitle {
    font-size: 0.95rem;
  }
}
</style>
