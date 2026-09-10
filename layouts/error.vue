<template>
  <div class="err-page">
    <div class="err-card">
      <div class="err-code">
        {{ statusCode }}
      </div>
      <h1 class="err-title">
        {{ title }}
      </h1>
      <p class="err-text">
        {{ message }}
      </p>
      <div class="err-actions">
        <nuxt-link to="/" class="err-btn">
          <i class="fas fa-house" /> กลับหน้าแรก
        </nuxt-link>
        <nuxt-link v-if="hasToken" to="/chat/chat" class="err-btn ghost">
          <i class="fas fa-comments" /> ไปห้องแชท
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: () => ({})
    }
  },
  head () {
    return {
      title: `${this.statusCode} - RAI-SA-RA`,
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;800&display=swap' }
      ]
    }
  },
  computed: {
    statusCode () {
      return (this.error && this.error.statusCode) || 404
    },
    title () {
      return this.statusCode === 404 ? 'ไม่พบหน้านี้' : 'เกิดข้อผิดพลาด'
    },
    message () {
      if (this.statusCode === 404) {
        return 'หน้าที่คุณเปิดอาจถูกย้าย ลบ หรือไม่เคยมีอยู่'
      }
      return (this.error && this.error.message) || 'ลองใหม่อีกครั้งในภายหลัง'
    },
    hasToken () {
      if (!process.client) { return false }
      try {
        return !!localStorage.getItem('token')
      } catch (e) {
        return false
      }
    }
  }
}
</script>

<style scoped>
.err-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #121218;
  padding: calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));
  font-family: 'Kanit', sans-serif;
}

.err-card {
  background: #1c1c26;
  border: 2px solid #000;
  border-radius: 24px;
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.9);
  padding: 44px 36px;
  text-align: center;
  max-width: 420px;
  width: 100%;
  color: #f6f3ed;
}

.err-code {
  font-size: 64px;
  font-weight: 800;
  color: #ff5c4d;
  line-height: 1;
  -webkit-text-stroke: 1px #000;
}

.err-title {
  font-size: 24px;
  font-weight: 800;
  margin: 12px 0 8px;
}

.err-text {
  font-size: 15px;
  color: rgba(246, 243, 237, 0.7);
  margin-bottom: 26px;
  line-height: 1.6;
}

.err-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.err-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 12px 20px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  background: #ff5c4d;
  color: #121218;
  border: 2px solid #000;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.9);
}

.err-btn.ghost {
  background: transparent;
  color: #f6f3ed;
  box-shadow: none;
}

.err-btn:hover {
  background: #ffc94d;
  color: #121218;
}

.err-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f6f3ed;
}
</style>
