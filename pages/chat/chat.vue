<template>
  <div class="community-chat-page d-flex" style="height: 100vh;">
    <aside class="sidebar bg-dark text-white d-flex flex-column p-3" style="width: 220px;">
      <h5 class="mb-3 text-warning">
        ห้องของฉัน
      </h5>

      <div
        v-for="room in joinedRooms"
        :key="room._id"
        class="joined-room d-flex align-items-center mb-2 p-2 rounded hover-bg"
        :class="{ 'bg-secondary': activeRoomId === room._id }"
        style="cursor: pointer;"
        @click="goToRoom(room._id)"
      >
        <div
          class="room-icon rounded d-flex align-items-center justify-content-center text-white mr-2"
          :style="{ background: room.iconGradient, width: '32px', height: '32px', fontSize: '1rem' }"
        >
          <i :class="`mdi mdi-${room.icon}`" />
        </div>
        <span class="flex-grow-1 text-truncate">{{ room.name }}</span>
      </div>
    </aside>

    <main class="flex-fill p-4 overflow-auto">
      <div class="text-center mb-5">
        <b-button
          variant="outline-light"
          size="sm"
          class="logout-btn"
          @click="logout"
        >
          <i class="mdi mdi-logout" /> ออกจากระบบ
        </b-button>

        <h1 class="display-4 font-weight-bold text-warning mb-3">
          <i class="fas fa-comments" />
          Community Chat
        </h1>
        <p class="lead text-white-50 mb-4">
          เลือกห้องแชทที่ตรงกับความสนใจของคุณ
        </p>

        <div class="user-info d-inline-flex align-items-center">
          <b-avatar
            :text="userInitials"
            variant="warning"
            size="40"
            class="mr-3"
          />
          <span class="text-white">สวัสดี, {{ userName }}!</span>
        </div>
      </div>

      <b-row class="justify-content-center mb-4">
        <b-col cols="12" md="8" lg="6">
          <b-input-group size="lg">
            <b-form-input
              v-model="searchQuery"
              placeholder="ค้นหาห้องแชท..."
              class="search-input"
            />
            <b-input-group-append>
              <b-input-group-text class="bg-transparent border-left-0">
                <i class="mdi mdi-magnify text-white-50" />
              </b-input-group-text>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>

      <b-row class="justify-content-center mb-4">
        <b-col cols="12">
          <b-nav pills class="justify-content-center flex-wrap">
            <b-nav-item
              v-for="category in categories"
              :key="category.key"
              :active="activeCategory === category.key"
              class="mx-1 mb-2"
              @click="activeCategory = category.key"
            >
              <i :class="`mdi mdi-${category.icon} mr-2`" />
              {{ category.name }}
            </b-nav-item>
          </b-nav>
        </b-col>
      </b-row>
      <h5 class="text-warning mb-3">
        ห้องอื่น ๆ
      </h5>
      <b-row>
        <b-col
          v-for="room in filteredUnjoinedRooms"
          :key="room._id"
          cols="12"
          sm="6"
          lg="4"
          xl="3"
          class="mb-4"
        >
          <b-card class="room-card h-100 border-0 shadow">
            <div class="d-flex align-items-center mb-3">
              <div
                class="room-icon rounded d-flex align-items-center justify-content-center text-white mr-3"
                :style="{ background: room.iconGradient, width: '50px', height: '50px' }"
              >
                <i :class="`mdi mdi-${room.icon}`" style="font-size: 1.5rem;" />
              </div>
              <div>
                <h5 class="card-title text-warning mb-1">
                  {{ room.name }}
                </h5>
                <small class="text-muted">{{ room.categoryName }}</small>
              </div>
            </div>
            <b-row class="text-center py-2 mb-3 border-top border-bottom border-light">
              <b-col cols="4">
                <small class="text-muted">
                  <i class="fas fa-users mr-1" />
                  {{ room.memberCount !== undefined ? room.memberCount : (room.members ? room.members.length : 0) }}
                </small>
              </b-col>
              <b-col cols="4">
                <small class="text-muted">
                  <i class="mdi mdi-message-text mr-1" />
                  {{ room.messages || 0 }}
                </small>
              </b-col>
              <b-col cols="4">
                <small class="text-muted">
                  <i class="mdi mdi-clock-outline mr-1" />
                  {{ room.status }}
                </small>
              </b-col>
            </b-row>
            <p class="text-muted small mb-3 flex-grow-1">
              {{ room.description }}
            </p>
            <div class="mb-3">
              <b-badge
                v-for="tag in room.tags"
                :key="tag"
                variant="outline-secondary"
                class="mr-1 mb-1"
              >
                {{ tag }}
              </b-badge>
            </div>

            <b-button
              variant="warning"
              size="sm"
              block
              :disabled="joiningRoom === room._id || isUserInRoom(room._id)"
              @click="joinRoom(room._id)"
            >
              <template v-if="joiningRoom === room._id">
                <b-spinner small class="mr-2" /> กำลังเข้าร่วม...
              </template>
              <template v-else>
                <i class="fas fa-sign-in-alt mr-1" /> เข้าร่วมห้อง
              </template>
            </b-button>
          </b-card>
        </b-col>
      </b-row>

      <b-button
        size="sm"
        class="setting-btn"
        @click="setting"
      >
        <i class="mdi mdi-cog-outline" style="font-size: 1.2rem;color: white;" />
      </b-button>

      <b-button
        variant="warning"
        class="create-fab shadow"
        @click="$bvModal.show('create-room-modal')"
      >
        <i class="mdi mdi-plus" style="font-size: 1.2rem;" />
      </b-button>

      <b-modal
        id="create-room-modal"
        title="สร้างห้องแชทใหม่"
        size="md"
        centered
        hide-footer
      >
        <b-form @submit.prevent="createRoom">
          <b-form-group
            label="ชื่อห้อง:"
            label-for="room-name"
            class="mb-3"
          >
            <b-form-input
              id="room-name"
              v-model="newRoom.name"
              placeholder="ระบุชื่อห้องแชท"
              required
            />
          </b-form-group>

          <b-form-group
            label="หมวดหมู่:"
            label-for="room-category"
            class="mb-3"
          >
            <b-form-select
              id="room-category"
              v-model="newRoom.category"
              :options="categoryOptions"
              required
            />
          </b-form-group>

          <b-form-group
            label="คำอธิบาย:"
            label-for="room-description"
            class="mb-4"
          >
            <b-form-textarea
              id="room-description"
              v-model="newRoom.description"
              placeholder="อธิบายเกี่ยวกับห้องแชท"
              rows="3"
            />
          </b-form-group>

          <div class="d-flex justify-content-end">
            <b-button
              variant="secondary"
              class="mr-2"
              @click="$bvModal.hide('create-room-modal')"
            >
              ยกเลิก
            </b-button>
            <b-button
              variant="warning"
              type="submit"
            >
              สร้างห้อง
            </b-button>
          </div>
        </b-form>
      </b-modal>
    </main>
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
      newRoom: {
        name: '',
        category: 'gaming',
        description: ''
      },
      categories: [],
      rooms: []
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
          console.log('Rooms loaded:', this.rooms)
        }
      } catch (err) {
        this.isLoading = false
        console.error('Error getting rooms:', err)
      }
    },
    async getRoomById (roomId) {
      try {
        const response = await this.$axios.$get(process.env.API_GET_ROOM)
        if (response.status === 'success' && response.result) {
          const room = response.result.find(r => r._id === roomId)
          return room || null
        }
        return null
      } catch (err) {
        console.error('Error getting room by ID:', err)
        return null
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
      } else {
        this.$router.push({
          path: '/chat/room',
          query: {
            id: roomId,
            name: `ห้อง ${roomId}`,
            category: '',
            description: '',
            memberCount: 1,
            tags: '[]',
            status: 'online'
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

        console.log('Room updated:', this.rooms[roomIndex])

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
          confirmButtonColor: '#d33',
          cancelButtonColor: '#949698',
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

    async setToken () {
      try {
        this.token = localStorage.getItem('token')
        if (this.token) {
          this.$axios.setToken(this.token, 'Bearer')
          this.isLogin = true
        } else {
          this.$router.push('/')
        }
      } catch (error) {
        console.error('Error:', error)
        await this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด'
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
    }
  }
}
</script>

<style scoped>
.community-chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
}

.background-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  animation: float 8s ease-in-out infinite;
}

.orb-1 { width: 120px; height: 120px; top: 15%; right: 15%; animation-delay: 0s; }
.orb-2 { width: 80px; height: 80px; top: 60%; left: 10%; animation-delay: 3s; }
.orb-3 { width: 100px; height: 100px; top: 30%; left: 70%; animation-delay: 6s; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }
}

.container-fluid {
  position: relative;
  z-index: 2;
}
.sidebar {
  border-right: 1px solid #444;
}

.hover-bg:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.2s;
}
.setting-btn {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50% !important;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #999999;
}

.setting-btn:hover {
  transform: scale(1.1);
}

.logout-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.user-info {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  padding: 12px 20px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.search-input {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7) !important;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: #ffc107 !important;
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25) !important;
  color: white !important;
}

.nav-pills .nav-link {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 25px !important;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-pills .nav-link:hover {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.5);
  color: #ffc107 !important;
  transform: translateY(-2px);
}

.nav-pills .nav-link.active {
  background: rgba(255, 193, 7, 0.3) !important;
  border-color: #ffc107 !important;
  color: #ffc107 !important;
}

/* Room Cards */
.room-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 15px !important;
  transition: all 0.3s ease;
  cursor: pointer;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

.online-status.bg-success {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.create-fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50% !important;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-fab:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .logout-btn {
    top: 15px;
    right: 15px;
  }

  .create-fab {
    bottom: 20px;
    right: 20px;
    width: 55px;
    height: 55px;
  }

  .display-4 {
    font-size: 2.5rem;
  }
}
</style>
