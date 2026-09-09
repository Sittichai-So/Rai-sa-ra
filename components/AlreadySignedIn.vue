<template>
  <transition name="si-fade">
    <div v-if="session" class="si-overlay">
      <div class="si-inner">
        <div class="si-icon">
          <i class="fas fa-circle-user" />
        </div>
        <p class="si-text">
          คุณเข้าสู่ระบบอยู่แล้วในชื่อ<br>
          <b>{{ session.name }}</b>
          <span v-if="session.role && session.role !== 'user'" class="si-role">{{ session.role }}</span>
        </p>
        <p class="si-hint">
          ต้องการใช้บัญชีอื่น? กดออกจากระบบก่อน
        </p>
        <div class="si-actions">
          <button type="button" class="si-btn si-primary" @click="enter">
            <i class="fas fa-arrow-right-to-bracket" /> เข้าใช้งาน
          </button>
          <button type="button" class="si-btn si-ghost" :disabled="loading" @click="signOut">
            <i class="fas fa-right-from-bracket" /> ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { readSession, clearAuth } from '~/utils/auth'

export default {
  name: 'AlreadySignedIn',
  data () {
    return { session: null, loading: false }
  },
  mounted () {
    const s = readSession()
    if (s.valid) {
      const u = s.user || {}
      this.session = {
        name: u.displayName || u.fullname || u.username || s.payload.username || 'ผู้ใช้',
        role: u.role || s.payload.role || 'user'
      }
    }
  },
  methods: {
    enter () {
      this.$router.push('/chat/chat')
    },
    signOut () {
      this.loading = true
      try {
        if (this.$socket) {
          this.$socket.emit('statusChanged', { status: 'offline' })
          this.$socket.disconnect()
          this.$socket.connect()
        }
      } catch (e) {}
      clearAuth()
      if (this.$store) { this.$store.commit('setUserData', null) }
      this.session = null
      this.loading = false
    }
  }
}
</script>

<style scoped>
.si-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: #1c1c26;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 28px;
  font-family: 'Kanit', sans-serif;
}

.si-inner {
  width: 100%;
  max-width: 320px;
  text-align: center;
  color: #f6f3ed;
}

.si-icon {
  font-size: 46px;
  color: #7c6ff5;
  margin-bottom: 14px;
}

.si-text {
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 6px;
}

.si-text b {
  font-size: 19px;
}

.si-role {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffc94d;
  border: 1.5px solid #ffc94d;
  border-radius: 999px;
  padding: 2px 10px;
  vertical-align: middle;
}

.si-hint {
  font-size: 13px;
  color: rgba(246, 243, 237, 0.55);
  margin-bottom: 22px;
}

.si-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.si-btn {
  border-radius: 999px;
  border: 2px solid #000;
  font-weight: 700;
  font-size: 16px;
  padding: 11px 0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.si-primary {
  background: #ff5c4d;
  color: #121218;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
}

.si-primary:hover {
  background: #ffc94d;
  transform: translate(-2px, -2px);
  box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.9);
}

.si-ghost {
  background: transparent;
  color: rgba(246, 243, 237, 0.8);
  border-color: rgba(246, 243, 237, 0.25);
}

.si-ghost:hover:not(:disabled) {
  background: rgba(246, 243, 237, 0.08);
  color: #f6f3ed;
}

.si-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.si-fade-enter-active,
.si-fade-leave-active {
  transition: opacity 0.2s ease;
}

.si-fade-enter,
.si-fade-leave-to {
  opacity: 0;
}
</style>
