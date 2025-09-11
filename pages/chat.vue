<template>
  <div class="community-chat-page">
    <div class="background-effects">
      <div class="floating-orb orb-1" />
      <div class="floating-orb orb-2" />
      <div class="floating-orb orb-3" />
    </div>

    <b-container fluid class="py-4">
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

      <b-row>
        <b-col
          v-for="room in filteredRooms"
          :key="room._id"
          cols="12"
          sm="6"
          lg="4"
          xl="3"
          class="mb-4"
        >
          <b-card
            class="room-card h-100 border-0 shadow"
            body-class="d-flex flex-column"
          >
            <div
              class="online-status position-absolute rounded-circle"
              :class="room.online ? 'bg-success' : 'bg-secondary'"
              style="top: 15px; right: 15px; width: 12px; height: 12px;"
            />

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

            <div class="mt-auto">
              <b-button
                variant="warning"
                size="sm"
                block
                :disabled="joiningRoom === room._id || isUserInRoom(room._id)"
                @click="joinRoom(room._id)"
              >
                <b-spinner
                  v-if="joiningRoom === room._id"
                  small
                  class="mr-2"
                />
                <template v-if="joiningRoom === room._id">
                  กำลังเข้าร่วม...
                </template>
                <template v-else-if="isUserInRoom(room._id)">
                  <i class="fas fa-check mr-1" />
                  เข้าร่วมแล้ว
                </template>
                <template v-else>
                  <i class="fas fa-sign-in-alt mr-1" />
                  เข้าร่วมห้อง
                </template>
              </b-button>
            </div>
          </b-card>
        </b-col>
      </b-row>

      <div v-if="filteredRooms.length === 0" class="text-center py-5">
        <i class="fas fa-search  mb-3" font-scale="3" style="color: white;" />
        <h4 style="color: white;">
          ไม่พบห้องแชทที่ตรงกับการค้นหา
        </h4>
        <p style="color: white;">
          ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น
        </p>
      </div>
    </b-container>

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
  </div>
</template>

<script>
export default {
  name: 'CommunityChat',
  data () {
    const storedUser = localStorage.getItem('userData')
    const parsedUser = storedUser ? JSON.parse(storedUser) : null
    return {
      oginData: null,
      isLogin: false,
      token: null,
      user: parsedUser,
      userName: parsedUser ? parsedUser.fullname : 'Guest',
      searchQuery: '',
      activeCategory: 'all',
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
    filteredRooms () {
      let filtered = this.rooms
      if (this.activeCategory !== 'all') {
        filtered = filtered.filter(room => room.category === this.activeCategory)
      }
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter((room) => {
          return (
            room.name.toLowerCase().includes(query) ||
            room.description.toLowerCase().includes(query) ||
            room.tags.some(tag => tag.toLowerCase().includes(query))
          )
        })
      }

      return filtered
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
          localStorage.removeItem('authPayrollToken')
          sessionStorage.removeItem('authPayrollToken')
          localStorage.removeItem('token')
          localStorage.removeItem('userData')

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
