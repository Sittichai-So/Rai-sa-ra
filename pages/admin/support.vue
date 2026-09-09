<template>
  <div class="sp-page">
    <header class="sp-header">
      <button class="sp-back" @click="$router.push('/admin')">
        <i class="fas fa-arrow-left" />
      </button>
      <h1>แชทกับลูกค้า</h1>
      <button class="sp-refresh" :class="{ spin: loading }" aria-label="รีเฟรช" @click="load">
        <i class="fas fa-rotate" />
      </button>
    </header>

    <div class="sp-body">
      <div v-if="notSupport" class="sp-note">
        <i class="fas fa-circle-info" />
        บัญชีนี้ไม่ใช่บัญชีฝ่ายช่วยเหลือหลัก — ข้อความจากลูกค้าจะเข้าที่บัญชีแอดมินหลัก
      </div>

      <template v-else>
        <div v-if="loading && !threads.length" class="sp-state">
          <i class="fas fa-spinner fa-spin" /> กำลังโหลด...
        </div>
        <div v-else-if="!threads.length" class="sp-state">
          <i class="fas fa-comments" />
          <p>ยังไม่มีข้อความจากลูกค้า</p>
        </div>

        <button
          v-for="t in threads"
          :key="t.friendId"
          class="sp-thread"
          :class="{ unread: t.unreadCount > 0 }"
          @click="openThread(t)"
        >
          <div class="sp-avatar">
            <img v-if="t.avatar" :src="resolveAsset(t.avatar)" :alt="t.displayName">
            <div v-else class="sp-avatar-ph">
              {{ initials(t.displayName) }}
            </div>
            <span v-if="t.status === 'online'" class="sp-dot" />
          </div>
          <div class="sp-thread-info">
            <span class="sp-name">{{ t.displayName }}</span>
            <span class="sp-last">
              <i v-if="t.lastFromMe" class="fas fa-reply sp-you" />{{ t.lastMessage || 'เริ่มการสนทนา...' }}
            </span>
          </div>
          <div class="sp-thread-meta">
            <span class="sp-time">{{ fmtTime(t.lastMessageAt) }}</span>
            <span v-if="t.unreadCount" class="sp-badge">{{ t.unreadCount > 99 ? '99+' : t.unreadCount }}</span>
          </div>
        </button>
      </template>
    </div>

    <DirectMessageModal
      ref="dmModal"
      :friend="selected"
      :current-user-id="me._id"
      @read="onRead"
      @sent="onSent"
    />
  </div>
</template>

<script>
import DirectMessageModal from '~/components/DirectMessageModal.vue'

export default {
  components: { DirectMessageModal },
  middleware: ['middlewareAuth', 'admin'],
  data () {
    const stored = process.client ? localStorage.getItem('userData') : null
    return {
      me: stored ? JSON.parse(stored) : {},
      threads: [],
      loading: false,
      notSupport: false,
      selected: null
    }
  },
  head () {
    return {
      title: 'แชทกับลูกค้า - RAI-SA-RA',
      link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800&display=swap' }]
    }
  },
  mounted () {
    this.load()
    if (this.$socket) {
      this.$socket.on('dm:new', this.onIncoming)
    }
  },
  beforeDestroy () {
    if (this.$socket) {
      this.$socket.off('dm:new', this.onIncoming)
    }
  },
  methods: {
    async load () {
      this.loading = true
      try {
        const res = await this.$axios.$get(process.env.API_SUPPORT_THREADS)
        this.threads = res.result || []
        this.notSupport = false
      } catch (err) {
        if (err.response && err.response.status === 403) {
          this.notSupport = true
        }
      } finally {
        this.loading = false
      }
    },

    resolveAsset (url) {
      if (!url) { return null }
      if (/^https?:\/\//.test(url)) { return url }
      return (process.env.API_FILE_BASE || '') + url
    },

    initials (name) {
      if (!name) { return '?' }
      return String(name).split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()
    },

    fmtTime (iso) {
      if (!iso) { return '' }
      const diff = Date.now() - new Date(iso).getTime()
      const m = Math.floor(diff / 60000)
      if (m < 1) { return 'เมื่อกี้' }
      if (m < 60) { return `${m} นาที` }
      const h = Math.floor(m / 60)
      if (h < 24) { return `${h} ชม.` }
      return `${Math.floor(h / 24)} วัน`
    },

    openThread (t) {
      this.selected = {
        friendId: t.friendId,
        displayName: t.displayName,
        fullname: t.displayName,
        avatar: t.avatar ? this.resolveAsset(t.avatar) : null
      }
      t.unreadCount = 0
      this.$nextTick(() => {
        if (this.$refs.dmModal) { this.$refs.dmModal.open() }
      })
    },

    onIncoming (m) {
      const idx = this.threads.findIndex(t => String(t.friendId) === String(m.friendId))
      if (idx > -1) {
        const t = this.threads[idx]
        t.lastMessage = m.content
        t.lastMessageAt = m.createdAt || new Date().toISOString()
        t.lastFromMe = false
        const open = this.selected && String(this.selected.friendId) === String(m.friendId)
        if (!open) { t.unreadCount = (t.unreadCount || 0) + 1 }
        this.threads.splice(idx, 1)
        this.threads.unshift(t)
      } else {
        this.load()
      }
    },

    onRead (friendId) {
      const t = this.threads.find(x => String(x.friendId) === String(friendId))
      if (t) { t.unreadCount = 0 }
    },

    onSent ({ friendId, content }) {
      const t = this.threads.find(x => String(x.friendId) === String(friendId))
      if (t) {
        t.lastMessage = content
        t.lastMessageAt = new Date().toISOString()
        t.lastFromMe = true
      }
    }
  }
}
</script>

<style scoped>
.sp-page {
  min-height: 100vh;
  background: #121218;
  color: #f6f3ed;
  font-family: 'Kanit', sans-serif;
}

.sp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(16px + env(safe-area-inset-top)) 18px 16px;
  background: linear-gradient(135deg, #7c6ff5, #ff5c4d);
  position: sticky;
  top: 0;
  z-index: 5;
}

.sp-header h1 { flex: 1; margin: 0; font-size: 18px; font-weight: 700; }

.sp-back,
.sp-refresh {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sp-refresh.spin i { animation: sp-spin 0.7s linear infinite; }
@keyframes sp-spin { to { transform: rotate(360deg); } }

.sp-body {
  max-width: 640px;
  margin: 0 auto;
  padding: 18px 12px 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sp-note {
  background: rgba(124, 111, 245, 0.12);
  border: 1px solid rgba(124, 111, 245, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  color: #c9c2e8;
  line-height: 1.6;
}

.sp-state {
  text-align: center;
  padding: 48px 20px;
  color: rgba(246, 243, 237, 0.5);
  font-size: 14px;
}

.sp-state i { font-size: 28px; opacity: 0.5; display: block; margin-bottom: 10px; }
.sp-state p { margin: 0; }

.sp-thread {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  background: #1c1c26;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.sp-thread:hover { transform: translateY(-1px); border-color: rgba(255, 255, 255, 0.2); }
.sp-thread.unread { border-color: rgba(255, 92, 77, 0.5); background: rgba(255, 92, 77, 0.06); }

.sp-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.sp-avatar img,
.sp-avatar-ph {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.sp-avatar-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c6ff5, #ff5c4d);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.sp-dot {
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #37c871;
  border: 2px solid #1c1c26;
}

.sp-thread-info { flex: 1; min-width: 0; }

.sp-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sp-thread.unread .sp-name { font-weight: 800; }

.sp-last {
  display: block;
  font-size: 12.5px;
  color: rgba(246, 243, 237, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.sp-thread.unread .sp-last { color: rgba(246, 243, 237, 0.8); }
.sp-you { font-size: 9px; margin-right: 4px; opacity: 0.6; }

.sp-thread-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.sp-time { font-size: 11px; color: rgba(246, 243, 237, 0.35); }

.sp-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ff5c4d;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
