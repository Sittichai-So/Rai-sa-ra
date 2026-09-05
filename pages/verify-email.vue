<template>
  <div class="auth-page">
    <div class="bg-shapes">
      <div class="shape shape-1" />
      <div class="shape shape-2" />
      <div class="shape shape-3" />
    </div>

    <div class="auth-card">
      <div class="auth-header text-center">
        <span class="auth-eyebrow">RAI-SA-RA</span>
        <h2 class="title">
          ยืนยันอีเมล ✉️
        </h2>
      </div>

      <div v-if="state === 'verifying'" class="notice text-center">
        <i class="fas fa-spinner fa-spin" />
        กำลังตรวจสอบลิงก์ยืนยัน...
      </div>

      <div v-else-if="state === 'success'" class="notice notice-ok text-center">
        <i class="fas fa-circle-check" />
        ยืนยันอีเมลสำเร็จ! ตอนนี้บัญชีของคุณพร้อมใช้งานเต็มรูปแบบแล้ว
      </div>

      <template v-else>
        <div class="notice notice-error text-center">
          <i class="fas fa-triangle-exclamation" />
          {{ errorMessage || 'ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว' }}
        </div>

        <div v-if="resent" class="resent-hint text-center">
          <i class="fas fa-paper-plane" /> ส่งลิงก์ยืนยันใหม่ไปที่อีเมลของคุณแล้ว
        </div>

        <validation-observer v-else ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onResend)">
            <validation-provider v-slot="ctx" name="Email" :rules="{ required: true, email: true }">
              <b-form-group label="ขอลิงก์ยืนยันใหม่" label-for="veEmail">
                <b-form-input
                  id="veEmail"
                  v-model="email"
                  type="email"
                  :state="getValidationState(ctx)"
                  placeholder="example@email.com"
                />
                <b-form-invalid-feedback>{{ ctx.errors[0] }}</b-form-invalid-feedback>
              </b-form-group>
            </validation-provider>

            <b-button type="submit" block size="lg" class="submit-btn mt-3" :disabled="loading">
              {{ loading ? 'กำลังส่ง...' : 'ส่งลิงก์ยืนยันใหม่' }}
            </b-button>
          </b-form>
        </validation-observer>
      </template>

      <div class="auth-footer text-center mt-4">
        <p>
          <b-link to="/login">
            <i class="fas fa-arrow-left" /> ไปหน้าเข้าสู่ระบบ
          </b-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'login',
  data () {
    return {
      state: 'verifying', // verifying | success | error
      errorMessage: '',
      email: '',
      loading: false,
      resent: false
    }
  },
  head () {
    return {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },
  mounted () {
    this.verify()
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    async verify () {
      const token = this.$route.query.token
      if (!token) {
        this.state = 'error'
        this.errorMessage = 'ไม่พบ token ในลิงก์'
        return
      }
      try {
        await this.$axios.$post(process.env.API_VERIFY_EMAIL, { token })
        this.state = 'success'
        setTimeout(() => this.$router.push('/login'), 2500)
      } catch (error) {
        const resData = error.response?.data || {}
        this.state = 'error'
        this.errorMessage = resData.message || ''
      }
    },
    async onResend () {
      this.loading = true
      try {
        await this.$axios.$post(process.env.API_RESEND_VERIFICATION, { email: this.email })
        this.resent = true
      } catch (error) {
        const resData = error.response?.data || {}
        await this.$swal({
          icon: 'error',
          title: 'ส่งไม่สำเร็จ',
          text: resData.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* ตั้งฟอนต์ที่คอนเทนต์ ไม่ใช้ `*` เพื่อไม่ให้ทับ font-family ของไอคอน Font Awesome (โหลดจาก CSS กลาง) */
.auth-page,
.auth-page h1,
.auth-page h2,
.auth-page h3,
.auth-page p,
.auth-page span,
.auth-page label,
.auth-page input,
.auth-page button,
.auth-page a,
.auth-page small {
  font-family: 'Kanit', sans-serif;
}

.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #121218 !important;
  padding: 20px;
  overflow: hidden;
}

.bg-shapes {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border: 2px solid #000;
}

.shape-1 {
  top: 10%;
  left: 8%;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #ff5c4d !important;
}

.shape-2 {
  bottom: 14%;
  right: 10%;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #ffc94d !important;
  transform: rotate(12deg);
}

.shape-3 {
  bottom: 8%;
  left: 14%;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #7b5cfa !important;
}

.auth-card {
  position: relative;
  z-index: 1;
  background: #1c1c26 !important;
  border: 2px solid #000;
  border-radius: 24px;
  padding: 44px 40px;
  width: 100%;
  max-width: 420px;
  color: #f6f3ed;
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.9);
}

.auth-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #ffc94d;
  border: 2px solid #ffc94d;
  border-radius: 999px;
  padding: 5px 16px;
  margin-bottom: 16px;
}

.auth-header .title {
  font-size: 28px;
  font-weight: 800;
  color: #f6f3ed;
  margin-bottom: 10px;
}

.notice {
  border-radius: 14px;
  padding: 18px 16px;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 500;
  color: rgba(246, 243, 237, 0.85);
  background: rgba(246, 243, 237, 0.06);
}

.notice i {
  display: block;
  font-size: 34px;
  margin-bottom: 10px;
}

.notice-ok {
  background: rgba(77, 208, 122, 0.12);
  color: #8be0a6;
}

.notice-error {
  background: rgba(255, 92, 77, 0.12);
  color: #ff8f84;
}

.resent-hint {
  margin-top: 16px;
  font-size: 14px;
  color: #8be0a6;
}

::v-deep .col-form-label {
  color: #f6f3ed !important;
  font-weight: 600;
  font-size: 15px;
  margin: 18px 0 6px;
}

::v-deep .form-control {
  background: #121218 !important;
  border: 2px solid rgba(246, 243, 237, 0.2) !important;
  border-radius: 12px !important;
  padding: 12px 16px !important;
  font-size: 16px !important;
  color: #f6f3ed !important;
  height: auto !important;
}

::v-deep .form-control:focus {
  background: #121218 !important;
  border-color: #ff5c4d !important;
  box-shadow: 0 0 0 3px rgba(255, 92, 77, 0.25) !important;
  color: #f6f3ed !important;
}

::v-deep .invalid-feedback {
  color: #ff8f84;
  font-size: 14px;
  font-weight: 500;
}

.submit-btn {
  border-radius: 999px !important;
  background: #ff5c4d !important;
  border: 2px solid #000 !important;
  color: #121218 !important;
  font-weight: 700 !important;
  font-size: 17px !important;
  padding: 12px 0 !important;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.submit-btn:hover,
.submit-btn:focus {
  background: #ffc94d !important;
  color: #121218 !important;
  transform: translate(-2px, -2px);
  box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.9);
}

.auth-footer p {
  font-size: 15px;
  color: rgba(246, 243, 237, 0.75);
  margin-bottom: 0;
}

.auth-footer a {
  color: #ffc94d;
  font-weight: 700;
  text-decoration: none;
}

.auth-footer a:hover {
  color: #ff5c4d;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 34px 24px;
  }

  .auth-header .title {
    font-size: 24px;
  }
}
</style>
