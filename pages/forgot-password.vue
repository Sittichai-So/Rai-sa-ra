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
          Forgot Password 🔑
        </h2>
        <p class="subtitle">
          กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
        </p>
      </div>

      <validation-observer ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit(onForgotPassword)">
          <validation-provider v-slot="ctx" name="Email" :rules="{ required: true, email: true }">
            <b-form-group label="อีเมล" label-for="fpEmail">
              <b-form-input
                id="fpEmail"
                v-model="form.Email"
                type="email"
                :state="getValidationState(ctx)"
                placeholder="example@email.com"
              />
              <b-form-invalid-feedback>{{ ctx.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <b-button type="submit" block size="lg" class="submit-btn mt-3">
            <i class="fas fa-paper-plane" /> ส่งลิงก์รีเซ็ตรหัสผ่าน
          </b-button>
        </b-form>
      </validation-observer>

      <div class="auth-footer text-center mt-4">
        <p>
          นึกออกแล้ว? <b-link to="/login">
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
      form: {
        Email: ''
      }
    }
  },
  head () {
    return {
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    onForgotPassword () {
      console.log('ส่งคำขอรีเซ็ตรหัสผ่าน', this.form.Email)
    }
  }
}
</script>

<style scoped>
* {
  font-family: 'Kanit', sans-serif;
}

.fas,
.far,
.fal,
.fab,
.fa {
  font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
}

.fab {
  font-family: "Font Awesome 6 Brands" !important;
  font-weight: 400 !important;
}

.fas,
.fa {
  font-weight: 900 !important;
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

.form-group label {
  color: #f6f3ed;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
}

.form-control {
  background: #121218 !important;
  border: 2px solid rgba(246, 243, 237, 0.2) !important;
  border-radius: 12px !important;
  padding: 12px 16px !important;
  font-size: 16px !important;
  color: #f6f3ed !important;
  height: auto !important;
}

.form-control::placeholder {
  color: rgba(246, 243, 237, 0.4);
}

.form-control:focus {
  background: #121218 !important;
  border-color: #ff5c4d !important;
  box-shadow: 0 0 0 3px rgba(255, 92, 77, 0.25) !important;
  color: #f6f3ed !important;
}

.form-control.is-invalid {
  border-color: #ff5c4d !important;
}

.invalid-feedback {
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
