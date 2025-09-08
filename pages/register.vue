<template>
  <div class="auth-page">
    <div class="auth-card shadow-lg">
      <div class="auth-header text-center">
        <h2 class="title">Create Account ✨</h2>
        <p class="subtitle">สมัครสมาชิกเพื่อเข้าร่วม Community Rai-Sa-Ra</p>
      </div>

      <validation-observer ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit(onRegister)">
          <validation-provider v-slot="validationContext" name="Username" :rules="{ required: true }">
            <b-form-group label="ชื่อผู้ใช้งาน" label-for="regUser">
              <b-form-input
                id="regUser"
                v-model="form.Username"
                :state="getValidationState(validationContext)"
                placeholder="ตั้งชื่อผู้ใช้งาน"
              />
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <validation-provider v-slot="validationContext" name="Email" :rules="{ required: true, email: true }">
            <b-form-group label="อีเมล" label-for="regEmail">
              <b-form-input
                id="regEmail"
                v-model="form.Email"
                type="email"
                :state="getValidationState(validationContext)"
                placeholder="example@email.com"
              />
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <validation-provider v-slot="validationContext" name="Password" :rules="{ required: true, min: 6 }">
            <b-form-group label="รหัสผ่าน" label-for="regPass">
              <b-form-input
                id="regPass"
                v-model="form.Password"
                type="password"
                :state="getValidationState(validationContext)"
                placeholder="••••••••"
              />
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <validation-provider v-slot="validationContext" name="Confirm Password" :rules="{ required: true }">
            <b-form-group label="ยืนยันรหัสผ่าน" label-for="regPassConfirm">
              <b-form-input
                id="regPassConfirm"
                v-model="form.PasswordConfirm"
                type="password"
                :state="getValidationState(validationContext)"
                placeholder="••••••••"
              />
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <b-button type="submit" block variant="light" size="lg" class="submit-btn mt-3">
            สมัครสมาชิก
          </b-button>
        </b-form>
      </validation-observer>

      <div class="auth-footer text-center mt-4">
        <p>มีบัญชีแล้ว? <b-link to="/login">เข้าสู่ระบบ</b-link></p>
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
        Username: '',
        Email: '',
        Password: '',
        PasswordConfirm: ''
      }
    }
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    async onRegister () {
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
