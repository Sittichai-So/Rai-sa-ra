<template>
  <div class="ad-page">
    <header class="ad-header">
      <button class="ad-back" @click="$router.push('/chat/chat')">
        <i class="fas fa-arrow-left" />
      </button>
      <h1>ศูนย์จัดการระบบ</h1>
      <span class="ad-role">{{ roleLabel }}</span>
    </header>

    <div class="ad-body">
      <nuxt-link
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="ad-card"
      >
        <div class="ad-card-icon" :style="{ background: item.color }">
          <i :class="item.icon" />
        </div>
        <div class="ad-card-text">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <i class="fas fa-chevron-right ad-card-arrow" />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  middleware: ['middlewareAuth', 'admin'],
  data () {
    return {
      menu: [
        {
          to: '/admin/topups',
          title: 'อนุมัติการเติมเหรียญ',
          desc: 'ตรวจสลิป อนุมัติ ปฏิเสธ และคืนเงิน',
          icon: 'fas fa-coins',
          color: 'linear-gradient(135deg, #ffc94d, #ff9f1c)'
        },
        {
          to: '/admin/users',
          title: 'จัดการผู้ใช้',
          desc: 'ค้นหาผู้ใช้ เปลี่ยนสิทธิ์ ระงับหรือคืนสถานะบัญชี',
          icon: 'fas fa-users-gear',
          color: 'linear-gradient(135deg, #7c6ff5, #5b4fd6)'
        },
        {
          to: '/admin/rooms',
          title: 'จัดการห้องแชท',
          desc: 'แก้ไขรายละเอียดห้อง ตั้งรหัสผ่าน หรือลบห้อง',
          icon: 'fas fa-comments',
          color: 'linear-gradient(135deg, #ff5c4d, #e8412f)'
        },
        {
          to: '/admin/support',
          title: 'แชทกับลูกค้า',
          desc: 'ตอบข้อความสอบถาม / แจ้งปัญหาจากผู้ใช้',
          icon: 'fas fa-headset',
          color: 'linear-gradient(135deg, #37c871, #1e9e56)'
        }
      ]
    }
  },
  head () {
    return {
      title: 'ศูนย์จัดการระบบ - RAI-SA-RA',
      link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800&display=swap' }]
    }
  },
  computed: {
    roleLabel () {
      const r = this.$store.getters.role
      return { admin: 'ผู้ดูแลระบบ', moderator: 'ผู้ช่วยดูแล' }[r] || r || ''
    }
  }
}
</script>

<style scoped>
.ad-page { min-height: 100vh; min-height: 100dvh; background: #121218; color: #f6f3ed; font-family: 'Kanit', sans-serif; }
.ad-header {
  display: flex; align-items: center; gap: 12px;
  padding: calc(16px + env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) 16px max(18px, env(safe-area-inset-left)); background: linear-gradient(135deg, #ff5c4d, #7c6ff5);
  position: sticky; top: 0; z-index: 5;
}
.ad-header h1 { flex: 1; margin: 0; font-size: 18px; font-weight: 700; }
.ad-back { border: none; background: rgba(255, 255, 255, 0.2); color: #fff; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; }
.ad-role {
  font-size: 12px; font-weight: 700; background: rgba(0, 0, 0, 0.25);
  padding: 5px 12px; border-radius: 999px;
}

.ad-body { max-width: 640px; margin: 0 auto; padding: 22px 14px; display: flex; flex-direction: column; gap: 12px; }

.ad-card {
  display: flex; align-items: center; gap: 16px;
  background: #1c1c26; border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px; padding: 18px; text-decoration: none; color: inherit;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.ad-card:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.2); }

.ad-card-icon {
  width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #fff;
}
.ad-card-text { flex: 1; }
.ad-card-text h3 { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
.ad-card-text p { margin: 0; font-size: 13px; color: rgba(246, 243, 237, 0.6); }
.ad-card-arrow { color: rgba(246, 243, 237, 0.35); font-size: 14px; }
</style>
