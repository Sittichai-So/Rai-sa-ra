<template>
  <div class="ar-page">
    <header class="ar-header">
      <button class="ar-back" @click="$router.push('/admin')">
        <i class="fas fa-arrow-left" />
      </button>
      <h1>จัดการห้องแชท</h1>
      <span class="ar-total">{{ rooms.length }} ห้อง</span>
    </header>

    <div class="ar-body">
      <div class="ar-search">
        <i class="fas fa-search" />
        <input v-model="q" type="text" placeholder="ค้นหาชื่อห้อง...">
      </div>

      <div v-if="loading" class="ar-state">
        <i class="fas fa-spinner fa-spin" /> กำลังโหลด...
      </div>
      <div v-else-if="!filtered.length" class="ar-state">
        ไม่พบห้อง
      </div>

      <div v-for="room in filtered" :key="room._id" class="ar-card">
        <div class="ar-icon" :style="{ background: room.iconGradient || '#7c6ff5' }">
          <i :class="`fas fa-${room.icon || 'comments'}`" />
        </div>
        <div class="ar-info">
          <div class="ar-name-row">
            <strong>{{ room.name }}</strong>
            <span class="ar-badge" :class="room.type">
              <i :class="room.type === 'private' ? 'fas fa-lock' : 'fas fa-globe-asia'" />
              {{ room.type === 'private' ? 'ส่วนตัว' : 'สาธารณะ' }}
            </span>
          </div>
          <div class="ar-meta">
            <span>{{ room.categoryName || room.category }}</span>
            <span>· <i class="fas fa-users" /> {{ room.memberCount || 0 }}</span>
            <span>· <i class="fas fa-comments" /> {{ room.messageCount || 0 }}</span>
          </div>
          <p v-if="room.description" class="ar-desc">
            {{ room.description }}
          </p>
        </div>
        <button class="ar-manage" @click="openManage(room)">
          <i class="fas fa-screwdriver-wrench" /> จัดการ
        </button>
      </div>
    </div>

    <RoomManagePanel
      :show="!!managing"
      :room="managing || {}"
      :room-id="managing ? String(managing._id) : ''"
      :categories="categories"
      @close="managing = null"
      @saved="onSaved"
      @deleted="onDeleted"
    />
  </div>
</template>

<script>
export default {
  middleware: ['middlewareAuth', 'admin'],
  data () {
    return {
      rooms: [],
      categories: [],
      loading: false,
      q: '',
      managing: null
    }
  },
  head () {
    return {
      title: 'จัดการห้องแชท - RAI-SA-RA',
      link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap' }]
    }
  },
  computed: {
    filtered () {
      const term = this.q.trim().toLowerCase()
      if (!term) { return this.rooms }
      return this.rooms.filter(r => (r.name || '').toLowerCase().includes(term))
    }
  },
  mounted () {
    this.load()
    this.loadCategories()
  },
  methods: {
    async load () {
      this.loading = true
      try {
        const res = await this.$axios.$get(process.env.API_GET_ROOM)
        this.rooms = Array.isArray(res.result) ? res.result : []
      } catch (err) {
        this.$swal({ icon: 'error', title: 'โหลดห้องไม่สำเร็จ' })
      } finally {
        this.loading = false
      }
    },
    async loadCategories () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_CATEGORIES_ROOM)
        if (res.status === 'success') {
          this.categories = (res.result || []).filter(c => c.key !== 'all')
        }
      } catch (err) {}
    },
    openManage (room) {
      this.managing = room
    },
    onSaved () {
      this.managing = null
      this.$bvToast.toast('บันทึกการแก้ไขแล้ว', { variant: 'success', solid: true })
      this.load()
    },
    onDeleted () {
      this.managing = null
      this.$bvToast.toast('ลบห้องแล้ว', { variant: 'success', solid: true })
      this.load()
    }
  }
}
</script>

<style scoped>
.ar-page { min-height: 100vh; min-height: 100dvh; background: #121218; color: #f6f3ed; font-family: 'Kanit', sans-serif; }
.ar-header {
  display: flex; align-items: center; gap: 12px;
  padding: calc(16px + env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) 16px max(18px, env(safe-area-inset-left)); background: linear-gradient(135deg, #ff5c4d, #7c6ff5);
  position: sticky; top: 0; z-index: 5;
}
.ar-header h1 { flex: 1; margin: 0; font-size: 18px; font-weight: 700; }
.ar-back { border: none; background: rgba(255, 255, 255, 0.2); color: #fff; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; }
.ar-total { font-size: 12px; font-weight: 700; background: rgba(0, 0, 0, 0.25); padding: 5px 12px; border-radius: 999px; }

.ar-body { max-width: 720px; margin: 0 auto; padding: 18px 14px; }

.ar-search {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  background: #1c1c26; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px; padding: 8px 12px;
}
.ar-search i { color: rgba(246, 243, 237, 0.4); font-size: 13px; }
.ar-search input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: #f6f3ed; font-family: inherit; font-size: 14px; }

.ar-state { text-align: center; color: rgba(246, 243, 237, 0.5); padding: 40px 0; }

.ar-card {
  display: flex; gap: 14px; align-items: flex-start;
  background: #1c1c26; border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px; padding: 14px; margin-bottom: 10px;
}
.ar-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px;
}
.ar-info { flex: 1; min-width: 0; }
.ar-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ar-name-row strong { font-size: 15px; }
.ar-badge {
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
  display: inline-flex; align-items: center; gap: 4px;
}
.ar-badge.private { background: rgba(255, 201, 77, 0.2); color: #ffc94d; }
.ar-badge.public { background: rgba(124, 111, 245, 0.2); color: #a99bff; }
.ar-meta { font-size: 12px; color: rgba(246, 243, 237, 0.55); margin-top: 4px; display: flex; gap: 6px; flex-wrap: wrap; }
.ar-desc { font-size: 12px; color: rgba(246, 243, 237, 0.45); margin: 6px 0 0; }

.ar-manage {
  flex-shrink: 0; align-self: center;
  border: none; border-radius: 8px; padding: 8px 14px;
  background: rgba(255, 201, 77, 0.15); color: #ffc94d;
  font-family: inherit; font-weight: 700; font-size: 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.ar-manage:hover { background: rgba(255, 201, 77, 0.28); }

@media (max-width: 560px) {
  .ar-card { flex-wrap: wrap; }
  .ar-manage { width: 100%; justify-content: center; }
}
</style>
