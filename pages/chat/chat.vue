<template>
  <div class="community-chat-app">
    <!-- Sidebar -->
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
        <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          <i class="fas fa-bars" />
        </button>
      </div>

      <div class="sidebar-content">
        <!-- My Rooms Section -->
        <div class="section">
          <div class="section-header">
            <h6>ช่องทางของคุณ</h6>
            <button class="add-channel-btn" @click="$bvModal.show('create-room-modal')">
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

        <!-- Friends Section -->
        <div class="section">
          <div class="section-header">
            <h6>ข้อความส่วนตัว</h6>
            <button class="add-channel-btn" @click="showAddFriend = true">
              <i class="fas fa-user-plus" />
            </button>
          </div>

          <!-- Friend Requests -->
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

          <!-- Online Friends -->
          <div class="friends-list">
            <div
              v-for="friend in onlineFriends"
              :key="friend._id"
              class="friend-item online"
              @click="openDirectMessage(friend)"
            >
              <div class="user-avatar">
                <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.fullname">
                <div v-else class="avatar-placeholder">
                  {{ friend.initials }}
                </div>
                <div class="status-indicator online" />
              </div>
              <div class="friend-info">
                <span class="friend-name">{{ friend.fullname }}</span>
                <span v-if="friend.lastMessage" class="last-message">{{ friend.lastMessage }}</span>
              </div>
              <div v-if="friend.unreadCount" class="unread-badge">
                {{ friend.unreadCount }}
              </div>
            </div>

            <!-- Offline Friends -->
            <div
              v-for="friend in offlineFriends"
              :key="friend._id"
              class="friend-item offline"
              @click="openDirectMessage(friend)"
            >
              <div class="user-avatar">
                <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.fullname">
                <div v-else class="avatar-placeholder">
                  {{ friend.initials }}
                </div>
                <div class="status-indicator offline" />
              </div>
              <div class="friend-info">
                <span class="friend-name">{{ friend.fullname }}</span>
              </div>
              <div v-if="friend.unreadCount" class="unread-badge">
                {{ friend.unreadCount }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profile -->
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
          <button class="user-action-btn" @click="setting">
            <i class="fas fa-cog" />
          </button>
          <button class="user-action-btn" @click="logout">
            <i class="fas fa-sign-out-alt" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="main-header">
        <div class="header-left">
          <h1>ค้นพบชุมชน</h1>
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

      <!-- Categories Filter -->
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

      <!-- Rooms Grid -->
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

    <!-- Modals -->
    <b-modal
      id="create-room-modal"
      title="สร้างช่องทางใหม่"
      centered
      hide-footer
      body-class="create-room-modal-body"
    >
      <form class="create-room-form" @submit.prevent="createRoom">
        <div class="form-group">
          <label>ชื่อช่องทาง</label>
          <input
            v-model="newRoom.name"
            type="text"
            placeholder="ระบุชื่อช่องทาง"
            class="form-input"
            required
          >
        </div>

        <div class="form-group">
          <label>หมวดหมู่</label>
          <select v-model="newRoom.category" class="form-select" required>
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>คำอธิบาย</label>
          <textarea
            v-model="newRoom.description"
            placeholder="อธิบายเกี่ยวกับช่องทางนี้"
            class="form-textarea"
            rows="3"
          />
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="$bvModal.hide('create-room-modal')">
            ยกเลิก
          </button>
          <button type="submit" class="btn-primary">
            สร้างช่องทาง
          </button>
        </div>
      </form>
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
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon" />
            <input
              v-model="userSearchQuery"
              type="text"
              placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
              class="search-input"
              @input="searchUsers"
            >
          </div>
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
            <button
              class="friend-action-btn"
              :class="getFriendButtonClass(searchUser)"
              :disabled="searchUser.friendStatus === 'pending_sent' || sendingRequest === searchUser._id"
              @click="sendFriendRequest(searchUser)"
            >
              <i v-if="sendingRequest === searchUser._id" class="fas fa-spinner fa-spin" />
              <i v-else :class="getFriendButtonIcon(searchUser)" />
              {{ getFriendButtonText(searchUser) }}
            </button>
          </div>
        </div>

        <div v-else-if="userSearchQuery && !isSearching" class="empty-state">
          <i class="fas fa-user-slash" />
          <p>ไม่พบผู้ใช้ที่ค้นหา</p>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="showAddFriend = false">
            ปิด
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'CommunityChat',
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
      newRoom: {
        name: '',
        category: 'gaming',
        description: ''
      },
      categories: [],
      rooms: [],

      // Friend System Properties
      friendRequests: [],
      friends: [],
      onlineFriends: [],
      offlineFriends: [],
      showAddFriend: false,
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

    // เรียก Friend System functions
    await this.loadFriends()
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
    // เดิม methods...
    setting () {
      console.log('setting naaa')
    },
    formatNumber (num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    },
    async getCategories () {
      try {
        const response = await this.$axios.$get(process.env.API_GET_CATEGORIES_ROOM)
        if (response.status === 'success') {
          this.categories = response.result
        }
      } catch (err) {
        this.isLoading = false
        console.error(err)
      }
    },
    async getRoom () {
      try {
        const response = await this.$axios.$get(process.env.API_GET_ROOM)
        if (response.status === 'success') {
          this.rooms = response.result
          await this.getCountMessages()
          console.log('Rooms loaded:', this.rooms)
        }
      } catch (err) {
        this.isLoading = false
        console.error('Error getting rooms:', err)
      }
    },
    async getCountMessages () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_COUNT_ALL_CHAT_MESSAGES)
        if (res.status === 'success') {
          const counts = res.result || []
          console.log('counts:', counts)
          this.rooms = this.rooms.map((room) => {
            const found = counts.find(c => c.roomId === room._id)
            return {
              ...room,
              messageCount: found ? found.count : 0
            }
          })
        }
      } catch (err) {
        this.isLoading = false
        console.error('Error getting rooms:', err)
      }
    },
    goToRoom (roomId) {
      this.activeRoomId = roomId
      const roomData = this.rooms.find(room => room._id === roomId)

      if (roomData) {
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
      }
    },
    async joinRoom (roomId) {
      if (!this.user) {
        return this.$swal({
          icon: 'warning',
          title: 'ยังไม่ได้ล็อกอิน',
          text: 'กรุณาเข้าสู่ระบบก่อนเข้าร่วมห้อง'
        })
      }

      const currentRoom = this.rooms.find(room => room._id === roomId)
      if (currentRoom && currentRoom.members) {
        const isAlreadyMember = currentRoom.members.some(member => member.userId === this.user._id)
        if (isAlreadyMember) {
          return this.$swal({
            icon: 'info',
            title: 'แจ้งเตือน',
            text: 'คุณได้เข้าร่วมห้องนี้แล้ว'
          })
        }
      }

      this.joiningRoom = roomId

      try {
        const payload = {
          roomId,
          userId: this.user._id,
          fullname: this.user.fullname,
          avatar: this.user.avatar || ''
        }

        const result = await this.$axios.$post(process.env.API_JOIN_ROOM_USERS, payload)
        this.currentRoom = result
        const roomIndex = this.rooms.findIndex(room => room._id === roomId)
        if (roomIndex !== -1) {
          this.rooms[roomIndex].memberCount = result.memberCount
          this.rooms[roomIndex].members = result.members || []
          this.$set(this.rooms, roomIndex, { ...this.rooms[roomIndex] })
        }

        if (result && result.status === 'success') {
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

        await this.$swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: `เข้าร่วมห้อง ${result.name} สำเร็จ! (คนในห้อง: ${result.memberCount} คน)`,
          timer: 2000,
          showConfirmButton: false
        })
        await this.getRoom()
      } catch (err) {
        console.error('error joinRoom', err)
        await this.$swal({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: err.response?.data?.message || 'เข้าร่วมไม่สำเร็จ กรุณาลองใหม่'
        })
      } finally {
        this.joiningRoom = null
      }
    },
    isUserInRoom (roomId) {
      if (!this.user || !this.rooms) { return false }
      const room = this.rooms.find(room => room._id === roomId)
      if (!room || !room.members) { return false }
      return room.members.some(member => member.userId === this.user._id)
    },
    createRoom () {
      if (!this.newRoom.name.trim()) {
        this.$bvToast.toast('กรุณาระบุชื่อห้อง', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
        return
      }
      const newRoomData = {
        id: `room-${Date.now()}`,
        name: this.newRoom.name,
        category: this.newRoom.category,
        categoryName: this.categories.find(c => c.key === this.newRoom.category)?.name || '',
        description: this.newRoom.description || 'ห้องแชทใหม่',
        members: 1,
        messages: 0,
        status: 'ออนไลน์',
        tags: ['ใหม่'],
        icon: this.categories.find(c => c.key === this.newRoom.category)?.icon || 'chat',
        iconGradient: 'linear-gradient(135deg, #ffc107, #fd7e14)',
        online: true,
        featured: false,
        badge: '',
        isFavorite: false
      }

      this.rooms.unshift(newRoomData)
      this.newRoom = { name: '', category: 'gaming', description: '' }
      this.$bvModal.hide('create-room-modal')

      this.$bvToast.toast(`สร้างห้อง "${newRoomData.name}" สำเร็จ!`, {
        title: '🎉 สำเร็จ',
        variant: 'success',
        solid: true,
        autoHideDelay: 3000
      })
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
        const result = await this.$swal({
          title: 'ยืนยันการออกจากระบบ',
          text: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'ออกจากระบบ',
          cancelButtonText: 'ยกเลิก'
        })

        if (result.isConfirmed) {
          if (this.$socket && this.user?._id) {
            this.$socket.emit('statusChanged', { userId: this.user._id, status: 'offline' })
          }

          localStorage.removeItem('authPayrollToken')
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
          localStorage.removeItem('userStatus')
          this.$router.push('/')
        }
      } catch (err) {
        await this.$swal({
          icon: 'error',
          title: 'ไม่สามารถออกจากระบบได้',
          text: 'เกิดข้อผิดพลาดขณะพยายามออกจากระบบ'
        })
      }
    },
    startSessionTimeout () {
      setTimeout(() => {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        localStorage.removeItem('userData')

        this.$swal({
          icon: 'warning',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่'
        }).then(() => {
          this.$router.push('/')
        })
      }, 30 * 60 * 1000)
    },

    loadFriends () {
      try {
        const mockFriends = [
          {
            _id: 'friend1',
            fullname: 'สมชาย ใจดี',
            initials: 'สช',
            isOnline: true,
            lastMessage: 'สวัสดีครับ',
            unreadCount: 2,
            lastSeen: new Date()
          },
          {
            _id: 'friend2',
            fullname: 'สมศรี สวยงาม',
            initials: 'สส',
            isOnline: false,
            lastMessage: 'ไว้คุยกันนะ',
            unreadCount: 0,
            lastSeen: new Date(Date.now() - 3600000)
          }
        ]

        this.onlineFriends = mockFriends.filter(friend => friend.isOnline)
        this.offlineFriends = mockFriends.filter(friend => !friend.isOnline)
        this.friends = mockFriends
      } catch (err) {
        console.error('Error loading friends:', err)
      }
    },

    loadFriendRequests () {
      try {
        const mockRequests = [
          {
            _id: 'req1',
            userName: 'นายทดสอบ',
            userInitials: 'นท',
            requestedAt: new Date()
          }
        ]
        this.friendRequests = mockRequests
      } catch (err) {
        console.error('Error loading friend requests:', err)
      }
    },

    searchUsers () {
      if (!this.userSearchQuery.trim()) {
        this.searchResults = []
        return
      }

      this.isSearching = true
      try {
        const mockUsers = [
          {
            _id: 'user1',
            fullname: 'ผู้ใช้ทดสอบ 1',
            email: 'test1@example.com',
            initials: 'ผท',
            friendStatus: 'none'
          },
          {
            _id: 'user2',
            fullname: 'ผู้ใช้ทดสอบ 2',
            email: 'test2@example.com',
            initials: 'ผท',
            friendStatus: 'pending_sent'
          }
        ]

        this.searchResults = mockUsers.filter(user =>
          user.fullname.toLowerCase().includes(this.userSearchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.userSearchQuery.toLowerCase())
        )
      } catch (err) {
        console.error('Error searching users:', err)
        this.searchResults = []
      } finally {
        this.isSearching = false
      }
    },

    getFriendButtonClass (user) {
      const baseClass = 'friend-action-btn'
      switch (user.friendStatus) {
        case 'friends':
          return `${baseClass} success`
        case 'pending_sent':
          return `${baseClass} secondary`
        case 'pending_received':
          return `${baseClass} warning`
        default:
          return `${baseClass} primary`
      }
    },

    getFriendButtonIcon (user) {
      switch (user.friendStatus) {
        case 'friends':
          return 'fas fa-check'
        case 'pending_sent':
          return 'fas fa-clock'
        case 'pending_received':
          return 'fas fa-user-plus'
        default:
          return 'fas fa-user-plus'
      }
    },

    getFriendButtonText (user) {
      switch (user.friendStatus) {
        case 'friends':
          return 'เพื่อนแล้ว'
        case 'pending_sent':
          return 'ส่งคำขอแล้ว'
        case 'pending_received':
          return 'ตอบรับ'
        default:
          return 'เพิ่มเพื่อน'
      }
    },

    async sendFriendRequest (targetUser) {
      if (targetUser.friendStatus !== 'none') { return }

      this.sendingRequest = targetUser._id
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        targetUser.friendStatus = 'pending_sent'
        this.$bvToast.toast(`ส่งคำขอเป็นเพื่อนให้ ${targetUser.fullname} แล้ว`, {
          title: 'สำเร็จ',
          variant: 'success',
          solid: true
        })
      } catch (err) {
        console.error('Error sending friend request:', err)
        this.$bvToast.toast('ไม่สามารถส่งคำขอเป็นเพื่อนได้', {
          title: 'ข้อผิดพลาด',
          variant: 'danger',
          solid: true
        })
      } finally {
        this.sendingRequest = null
      }
    },

    acceptFriend (requestId) {
      try {
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

          this.$bvToast.toast(`ตอบรับคำขอเป็นเพื่อนกับ ${request.userName} แล้ว`, {
            title: 'สำเร็จ',
            variant: 'success',
            solid: true
          })
        }
      } catch (err) {
        console.error('Error accepting friend:', err)
      }
    },

    rejectFriend (requestId) {
      try {
        this.friendRequests = this.friendRequests.filter(r => r._id !== requestId)

        this.$bvToast.toast('ปฏิเสธคำขอเป็นเพื่อนแล้ว', {
          title: 'แจ้งเตือน',
          variant: 'info',
          solid: true
        })
      } catch (err) {
        console.error('Error rejecting friend:', err)
      }
    },

    openDirectMessage (friend) {
      this.$router.push({
        path: '/chat/direct',
        query: {
          friendId: friend._id,
          friendName: friend.fullname,
          isOnline: friend.isOnline
        }
      })
    },

    setupNotifications () {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    },

    showNotification (title, body) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        })
        setTimeout(() => notification.close(), 5000)
      }
    }
  }
}
</script>

<style scoped>
/* Reset and base styles */
* {
  box-sizing: border-box;
}

.community-chat-app {
  display: flex;
  height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: #2f3136;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #40444b;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #40444b;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workspace-info {
  display: flex;
  align-items: center;
}

.workspace-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #5865f2, #7289da);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 18px;
}

.workspace-details h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.workspace-members {
  font-size: 12px;
  color: #b9bbbe;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: #40444b;
  color: #ffffff;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
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
  color: #8e9297;
  letter-spacing: 0.5px;
}

.add-channel-btn {
  background: none;
  border: none;
  color: #8e9297;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  font-size: 12px;
  transition: all 0.2s;
}

.add-channel-btn:hover {
  background: #40444b;
  color: #ffffff;
}

.channels-list,
.friends-list {
  padding: 0 8px;
}

.channel-item,
.friend-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin-bottom: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.channel-item:hover,
.friend-item:hover {
  background: #40444b;
}

.channel-item.active {
  background: #5865f2;
  color: #ffffff;
}

.channel-prefix {
  color: #8e9297;
  font-weight: 500;
  margin-right: 6px;
}

.channel-name,
.friend-name {
  font-size: 14px;
  flex: 1;
  truncate: ellipsis;
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
}

.avatar-placeholder {
  background: linear-gradient(135deg, #5865f2, #7289da);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #2f3136;
}

.status-indicator.online {
  background: #3ba55d;
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
  color: #8e9297;
  truncate: ellipsis;
  display: block;
}

.friend-item.offline {
  opacity: 0.6;
}

.unread-badge {
  background: #ed4245;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Friend Requests */
.friend-requests {
  padding: 0 8px;
  margin-bottom: 16px;
}

.friend-request {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #40444b;
  border-radius: 8px;
  margin-bottom: 8px;
}

.request-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.request-actions {
  display: flex;
  gap: 4px;
}

.btn-accept,
.btn-reject {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-accept {
  color: #3ba55d;
}

.btn-accept:hover {
  background: #3ba55d;
  color: white;
}

.btn-reject {
  color: #ed4245;
}

.btn-reject:hover {
  background: #ed4245;
  color: white;
}

/* User Profile */
.user-profile {
  padding: 8px;
  background: #292b2f;
  border-top: 1px solid #40444b;
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
  color: #ffffff;
  display: block;
}

.user-status {
  font-size: 12px;
  color: #3ba55d;
}

.user-actions {
  display: flex;
  gap: 4px;
}

.user-action-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.user-action-btn:hover {
  background: #40444b;
  color: #ffffff;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #36393f;
}

.main-header {
  padding: 24px 32px;
  background: #36393f;
  border-bottom: 1px solid #40444b;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.header-left p {
  margin: 0;
  font-size: 16px;
  color: #b9bbbe;
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
  color: #8e9297;
  font-size: 14px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: #40444b;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #8e9297;
}

.search-input:focus {
  background: #484c52;
  box-shadow: 0 0 0 2px #5865f2;
}

/* Categories Filter */
.categories-filter {
  padding: 16px 32px;
  border-bottom: 1px solid #40444b;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  background: transparent;
  border: 1px solid #40444b;
  color: #b9bbbe;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tab:hover {
  background: #40444b;
  color: #ffffff;
}

.filter-tab.active {
  background: #5865f2;
  color: #ffffff;
  border-color: #5865f2;
}

/* Rooms Grid */
.rooms-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.room-card {
  background: #2f3136;
  border: 1px solid #40444b;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-color: #5865f2;
}

.room-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.room-icon-wrapper {
  margin-right: 16px;
}

.room-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.room-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.room-category {
  font-size: 12px;
  color: #8e9297;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.room-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #40444b;
  border-bottom: 1px solid #40444b;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8e9297;
}

.stat-item.status {
  color: #b9bbbe;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #3ba55d;
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
  color: #b9bbbe;
  line-height: 1.4;
}

.room-tags {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #40444b;
  color: #b9bbbe;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.join-btn {
  flex: 1;
  background: #5865f2;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.join-btn:hover:not(:disabled) {
  background: #4752c4;
}

.join-btn:disabled,
.join-btn.disabled {
  background: #40444b;
  color: #8e9297;
  cursor: not-allowed;
}

/* Modal Styles */
.create-room-modal-body,
.add-friend-modal-body {
  background: #36393f;
  color: #ffffff;
}

.create-room-form,
.add-friend-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #b9bbbe;
}

.form-input,
.form-select,
.form-textarea {
  background: #40444b;
  border: 1px solid #40444b;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  padding: 10px 12px;
  outline: none;
  transition: all 0.2s;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #8e9297;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #5865f2;
  box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.2);
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
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #5865f2;
  color: white;
}

.btn-primary:hover {
  background: #4752c4;
}

.btn-secondary {
  background: transparent;
  color: #b9bbbe;
  border: 1px solid #40444b;
}

.btn-secondary:hover {
  background: #40444b;
  color: #ffffff;
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
  color: #8e9297;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #40444b;
  border-top: 2px solid #5865f2;
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
  margin-bottom: 12px;
  color: #40444b;
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
  padding: 12px;
  background: #40444b;
  border-radius: 8px;
  gap: 12px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.user-info p {
  margin: 0;
  font-size: 12px;
  color: #8e9297;
}

.friend-action-btn {
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.friend-action-btn.primary {
  background: #5865f2;
  color: white;
}

.friend-action-btn.primary:hover {
  background: #4752c4;
}

.friend-action-btn.secondary {
  background: #40444b;
  color: #8e9297;
}

.friend-action-btn.success {
  background: #3ba55d;
  color: white;
}

.friend-action-btn.warning {
  background: #faa61a;
  color: white;
}

.friend-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
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
}

@media (max-width: 640px) {
  .community-chat-app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #40444b;
  }

  .main-content {
    height: calc(100vh - 200px);
  }
}
</style>
