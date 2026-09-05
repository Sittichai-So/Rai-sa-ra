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
          ตั้งรหัสผ่านใหม่ 🔐
        </h2>
        <p class="subtitle">
          กรอกรหัสผ่านใหม่ของคุณ (อย่างน้อย 8 ตัวอักษร)
        </p>
      </div>

      <div v-if="!token" class="notice notice-error text-center">
        <i class="fas fa-triangle-exclamation" />
        ลิงก์ไม่ถูกต้อง — ไม่พบ token กรุณาขอลิงก์รีเซ็ตใหม่อีกครั้ง
      </div>

      <div v-else-if="done" class="notice notice-ok text-center">
        <i class="fas fa-circle-check" />
        ตั้งรหัสผ่านใหม่สำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...
      </div>

      <validation-observer v-else ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit(onReset)">
          <validation-provider v-slot="ctx" name="password" :rules="{ required: true, min: 8 }">
            <b-form-group label="รหัสผ่านใหม่" label-for="rpPass">
              <b-form-input
                id="rpPass"
                v-model="form.password"
                type="password"
                :state="getValidationState(ctx)"
                placeholder="••••••••"
              />
              <b-form-invalid-feedback>{{ ctx.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <validation-provider v-slot="ctx" name="confirmPassword" :rules="{ required: true, confirmed: 'password' }">
            <b-form-group label="ยืนยันรหัสผ่านใหม่" label-for="rpConfirm">
              <b-form-input
                id="rpConfirm"
                v-model="form.confirm"
                type="password"
                :state="getValidationState(ctx)"
                placeholder="••••••••"
              />
              <b-form-invalid-feedback>{{ ctx.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <b-button type="submit" block size="lg" class="submit-btn mt-3" :disabled="loading">
            {{ loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่' }}
          </b-button>
        </b-form>
      </validation-observer>

      <div class="auth-footer text-center mt-4">
        <p>
          <b-link to="/login">
            <i class="fas fa-arrow-left" /> กลับไปเข้าสู่ระบบ
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
      token: '',
      form: {
        password: '',
        confirm: ''
      },
      loading: false,
      done: false
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
    this.token = this.$route.query.token || ''
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    async onReset () {
      this.loading = true
      try {
        await this.$axios.$post(process.env.API_RESET_PASSWORD, {
          token: this.token,
          password: this.form.password
        })
        this.done = true
        setTimeout(() => this.$router.push('/login'), 1800)
      } catch (error) {
        const resData = error.response?.data || {}
        await this.$swal({
          icon: 'error',
          title: 'รีเซ็ตรหัสผ่านไม่สำเร็จ',
          text: resData.message || 'ลิงก์อาจหมดอายุแล้ว กรุณาขอลิงก์ใหม่'
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

.auth-header .subtitle {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(246, 243, 237, 0.72);
  margin-bottom: 8px;
}

::v-deep .col-form-label {
  color: #f6f3ed !important;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
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

::v-deep .form-control::placeholder {
  color: rgba(246, 243, 237, 0.4);
}

::v-deep .form-control:focus {
  background: #121218 !important;
  border-color: #ff5c4d !important;
  box-shadow: 0 0 0 3px rgba(255, 92, 77, 0.25) !important;
  color: #f6f3ed !important;
}

::v-deep .form-control.is-invalid {
  border-color: #ff5c4d !important;
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

.submit-btn:active {
  transform: translate(0, 0);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.9);
}

.notice {
  border-radius: 14px;
  padding: 18px 16px;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 500;
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
