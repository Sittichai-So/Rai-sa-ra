<template>
  <div class="auth-page">
    <div class="auth-card shadow-lg">
      <div class="auth-header text-center">
        <h2 class="title">Forgot Password 🔑</h2>
        <p class="subtitle">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
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

          <b-button type="submit" block variant="light" size="lg" class="submit-btn mt-3">
            ส่งลิงก์รีเซ็ตรหัสผ่าน
          </b-button>
        </b-form>
      </validation-observer>

      <div class="auth-footer text-center mt-4">
        <p>นึกออกแล้ว? <b-link to="/login">กลับไปเข้าสู่ระบบ</b-link></p>
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
/* * {
  font-family: 'prompt', sans-serif;
} */
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  padding: 20px;
}
.auth-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  color: #fff;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
}
.auth-header .title {
  font-size: 30px;
  font-weight: 700;
}
.auth-header .subtitle {
  font-size: 18pz;
  opacity: 0.85;
}
.b-form-input {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px !important;
}
.submit-btn {
  border-radius: 12px;
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  border: none;
  color: #333;
  font-weight: 600;
}
.submit-btn:hover {
  background: linear-gradient(135deg, #ffdde1, #ee9ca7);
}
.auth-footer p {
  font-size: 20px;
  opacity: 0.9;
}
.auth-footer a {
  color: #ffd369;
  font-weight: 500;
}
</style>
