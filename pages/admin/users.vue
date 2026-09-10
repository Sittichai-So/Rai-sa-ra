<template>
  <div class="au-page">
    <header class="au-header">
      <button class="au-back" @click="$router.push('/admin')">
        <i class="fas fa-arrow-left" />
      </button>
      <h1>จัดการผู้ใช้</h1>
      <span class="au-total">{{ total }} คน</span>
    </header>

    <div class="au-body">
      <div class="au-filters">
        <div class="au-search">
          <i class="fas fa-search" />
          <input
            v-model="q"
            type="text"
            placeholder="ค้นหาชื่อ / username / อีเมล..."
            @keyup.enter="reload"
          >
          <button v-if="q" class="au-search-clear" @click="q = ''; reload()">
            <i class="fas fa-times" />
          </button>
        </div>
        <select v-model="roleFilter" class="au-select" @change="reload">
          <option value="">
            ทุกสิทธิ์
          </option>
          <option value="user">
            user
          </option>
          <option value="moderator">
            moderator
          </option>
          <option value="admin">
            admin
          </option>
        </select>
        <select v-model="activeFilter" class="au-select" @change="reload">
          <option value="">
            ทุกสถานะ
          </option>
          <option value="true">
            ใช้งานอยู่
          </option>
          <option value="false">
            ถูกระงับ
          </option>
        </select>
      </div>

      <div v-if="loading" class="au-state">
        <i class="fas fa-spinner fa-spin" /> กำลังโหลด...
      </div>
      <div v-else-if="!users.length" class="au-state">
        ไม่พบผู้ใช้
      </div>

      <div
        v-for="u in users"
        :key="u._id"
        class="au-card"
        :class="{ suspended: !u.isActive }"
      >
        <div class="au-avatar">
          <img v-if="avatarUrl(u)" :src="avatarUrl(u)" :alt="displayName(u)">
          <span v-else>{{ initials(u) }}</span>
        </div>

        <div class="au-info">
          <div class="au-name-row">
            <strong>{{ displayName(u) }}</strong>
            <span class="au-badge" :class="'role-' + u.role">{{ u.role }}</span>
            <span v-if="!u.isActive" class="au-badge suspended-badge">ถูกระงับ</span>
            <span v-if="u._id === myId" class="au-badge me-badge">คุณ</span>
          </div>
          <div class="au-meta">
            <span>@{{ u.username }}</span>
            <span v-if="u.email">· {{ u.email }}</span>
          </div>
          <div class="au-meta au-meta-sub">
            <span>สมัคร {{ fmtDate(u.createdAt) }}</span>
            <span v-if="u.emailVerified" class="au-verified"><i class="fas fa-circle-check" /> ยืนยันอีเมล</span>
            <span v-else class="au-unverified">ยังไม่ยืนยันอีเมล</span>
          </div>
        </div>

        <div class="au-actions">
          <select
            :value="u.role"
            class="au-role-select"
            :disabled="u._id === myId || busy === u._id"
            @change="changeRole(u, $event.target.value)"
          >
            <option value="user">
              user
            </option>
            <option value="moderator">
              moderator
            </option>
            <option value="admin">
              admin
            </option>
          </select>
          <button
            class="au-btn"
            :class="u.isActive ? 'danger' : 'ok'"
            :disabled="u._id === myId || busy === u._id"
            @click="toggleActive(u)"
          >
            <i v-if="busy === u._id" class="fas fa-spinner fa-spin" />
            <template v-else>
              <i :class="u.isActive ? 'fas fa-ban' : 'fas fa-rotate-left'" />
              {{ u.isActive ? 'ระงับ' : 'คืนสถานะ' }}
            </template>
          </button>
        </div>
      </div>

      <div v-if="totalPages > 1" class="au-pager">
        <button :disabled="page <= 1" @click="go(page - 1)">
          <i class="fas fa-chevron-left" />
        </button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="go(page + 1)">
          <i class="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: ['middlewareAuth', 'admin'],
  data () {
    let myId = null
    try {
      myId = JSON.parse(localStorage.getItem('userData') || '{}')._id || null
    } catch (e) {}
    return {
      users: [],
      total: 0,
      page: 1,
      totalPages: 1,
      q: '',
      roleFilter: '',
      activeFilter: '',
      loading: false,
      busy: null,
      myId,
      fileBase: process.env.API_FILE_BASE || ''
    }
  },
  head () {
    return {
      title: 'จัดการผู้ใช้ - RAI-SA-RA',
      link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap' }]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    displayName (u) {
      return u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username
    },
    initials (u) {
      return this.displayName(u).split(' ').map(s => s.charAt(0)).join('').slice(0, 2).toUpperCase()
    },
    avatarUrl (u) {
      if (!u.avatar) { return '' }
      return /^https?:\/\//.test(u.avatar) ? u.avatar : this.fileBase + u.avatar
    },
    fmtDate (d) {
      return d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
    },
    async load () {
      this.loading = true
      try {
        const res = await this.$axios.$get(process.env.API_ADMIN_USERS, {
          params: {
            q: this.q || undefined,
            role: this.roleFilter || undefined,
            active: this.activeFilter || undefined,
            page: this.page,
            limit: 20
          }
        })
        const r = res.result || {}
        this.users = r.users || []
        this.total = r.total || 0
        this.totalPages = r.totalPages || 1
        this.page = r.page || 1
      } catch (err) {
        this.$swal({ icon: 'error', title: 'โหลดข้อมูลไม่สำเร็จ', text: err.response?.data?.message || '' })
      } finally {
        this.loading = false
      }
    },
    reload () {
      this.page = 1
      this.load()
    },
    go (p) {
      this.page = p
      this.load()
    },
    async changeRole (u, role) {
      if (role === u.role) { return }
      const c = await this.$swal({
        title: 'เปลี่ยนสิทธิ์ผู้ใช้',
        html: `เปลี่ยนสิทธิ์ของ <b>${this.displayName(u)}</b><br>จาก <b>${u.role}</b> เป็น <b>${role}</b>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'เปลี่ยน',
        cancelButtonText: 'ยกเลิก'
      })
      if (!c.isConfirmed) {
        this.load()
        return
      }
      this.busy = u._id
      try {
        await this.$axios.$patch(process.env.API_ADMIN_USER_ROLE.replace(':id', u._id), { role })
        u.role = role
        this.$swal({ icon: 'success', title: 'เปลี่ยนสิทธิ์แล้ว', timer: 1400, showConfirmButton: false })
      } catch (err) {
        this.$swal({ icon: 'error', title: 'ไม่สำเร็จ', text: err.response?.data?.message || '' })
        this.load()
      } finally {
        this.busy = null
      }
    },
    async toggleActive (u) {
      const next = !u.isActive
      const c = await this.$swal({
        title: next ? 'คืนสถานะบัญชี?' : 'ระงับบัญชี?',
        html: next
          ? `ให้ <b>${this.displayName(u)}</b> กลับมาเข้าสู่ระบบได้อีกครั้ง`
          : `<b>${this.displayName(u)}</b> จะเข้าสู่ระบบไม่ได้จนกว่าจะคืนสถานะ`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: next ? 'คืนสถานะ' : 'ระงับ',
        confirmButtonColor: next ? '#28a745' : '#d33',
        cancelButtonText: 'ยกเลิก'
      })
      if (!c.isConfirmed) { return }
      this.busy = u._id
      try {
        await this.$axios.$patch(process.env.API_ADMIN_USER_ACTIVE.replace(':id', u._id), { isActive: next })
        u.isActive = next
        this.$swal({ icon: 'success', title: next ? 'คืนสถานะแล้ว' : 'ระงับแล้ว', timer: 1400, showConfirmButton: false })
      } catch (err) {
        this.$swal({ icon: 'error', title: 'ไม่สำเร็จ', text: err.response?.data?.message || '' })
      } finally {
        this.busy = null
      }
    }
  }
}
</script>

<style scoped>
.au-page { min-height: 100vh; min-height: 100dvh; background: #121218; color: #f6f3ed; font-family: 'Kanit', sans-serif; }
.au-header {
  display: flex; align-items: center; gap: 12px;
  padding: calc(16px + env(safe-area-inset-top)) 18px 16px; background: linear-gradient(135deg, #ff5c4d, #7c6ff5);
  position: sticky; top: 0; z-index: 5;
}
.au-header h1 { flex: 1; margin: 0; font-size: 18px; font-weight: 700; }
.au-back { border: none; background: rgba(255, 255, 255, 0.2); color: #fff; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; }
.au-total { font-size: 12px; font-weight: 700; background: rgba(0, 0, 0, 0.25); padding: 5px 12px; border-radius: 999px; }

.au-body { max-width: 720px; margin: 0 auto; padding: 18px 14px; }

.au-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.au-search {
  flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px;
  background: #1c1c26; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px; padding: 8px 12px;
}
.au-search i { color: rgba(246, 243, 237, 0.4); font-size: 13px; }
.au-search input { flex: 1; background: transparent; border: none; outline: none; color: #f6f3ed; font-family: inherit; font-size: 14px; }
.au-search-clear { border: none; background: transparent; color: rgba(246, 243, 237, 0.4); cursor: pointer; }
.au-select {
  background: #1c1c26; border: 1px solid rgba(255, 255, 255, 0.1); color: #f6f3ed;
  border-radius: 10px; padding: 8px 10px; font-family: inherit; font-size: 13px;
}

.au-state { text-align: center; color: rgba(246, 243, 237, 0.5); padding: 40px 0; }

.au-card {
  display: flex; gap: 14px; align-items: flex-start;
  background: #1c1c26; border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px; padding: 14px; margin-bottom: 10px;
}
.au-card.suspended { opacity: 0.6; }

.au-avatar {
  width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
  background: #7c6ff5; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; overflow: hidden;
}
.au-avatar img { width: 100%; height: 100%; object-fit: cover; }

.au-info { flex: 1; min-width: 0; }
.au-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.au-name-row strong { font-size: 15px; }
.au-badge {
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}
.au-badge.role-admin { background: rgba(255, 92, 77, 0.2); color: #ff8f84; }
.au-badge.role-moderator { background: rgba(255, 201, 77, 0.2); color: #ffc94d; }
.au-badge.role-user { background: rgba(124, 111, 245, 0.2); color: #a99bff; }
.au-badge.suspended-badge { background: rgba(255, 92, 77, 0.2); color: #ff8f84; }
.au-badge.me-badge { background: rgba(77, 208, 122, 0.2); color: #4dd07a; }

.au-meta { font-size: 12px; color: rgba(246, 243, 237, 0.55); margin-top: 4px; display: flex; gap: 6px; flex-wrap: wrap; }
.au-meta-sub { font-size: 11px; color: rgba(246, 243, 237, 0.4); }
.au-verified { color: #4dd07a; }
.au-unverified { color: rgba(255, 201, 77, 0.8); }

.au-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; align-items: stretch; }
.au-role-select {
  background: #121218; border: 1px solid rgba(255, 255, 255, 0.15); color: #f6f3ed;
  border-radius: 8px; padding: 6px 8px; font-family: inherit; font-size: 12px;
}
.au-role-select:disabled { opacity: 0.4; }
.au-btn {
  border: none; border-radius: 8px; padding: 7px 12px; font-weight: 700;
  font-family: inherit; font-size: 12px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.au-btn.danger { background: rgba(255, 143, 132, 0.18); color: #ff8f84; }
.au-btn.ok { background: rgba(77, 208, 122, 0.18); color: #4dd07a; }
.au-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.au-pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 18px; }
.au-pager button {
  border: 1px solid rgba(255, 255, 255, 0.15); background: #1c1c26; color: #f6f3ed;
  width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
}
.au-pager button:disabled { opacity: 0.35; cursor: not-allowed; }
.au-pager span { font-size: 13px; color: rgba(246, 243, 237, 0.7); }

@media (max-width: 560px) {
  .au-card { flex-wrap: wrap; }
  .au-actions { flex-direction: row; width: 100%; }
  .au-actions > * { flex: 1; }
}
</style>
