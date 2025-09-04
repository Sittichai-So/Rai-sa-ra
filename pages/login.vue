<template>
  <div class="login-page">
    <div class="login-card shadow-lg">
      <div class="login-header text-center">
        <h2 class="title">
          Welcome Back 👋
        </h2>
        <p class="subtitle">
          เข้าสู่ระบบเพื่อเริ่มพูดคุยใน Community Ra-Sa-Ra
        </p>
      </div>

      <validation-observer ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit(onLogin)">
          <!-- Username -->
          <validation-provider
            v-slot="validationContext"
            name="Username"
            :rules="{ required: true }"
          >
            <b-form-group label="ชื่อผู้ใช้งาน" label-for="txtUser">
              <b-form-input
                id="txtUser"
                v-model="form.Username"
                name="txtUser"
                type="text"
                :state="getValidationState(validationContext)"
                placeholder="กรอกชื่อผู้ใช้งาน"
              />
              <b-form-invalid-feedback>
                {{ validationContext.errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <!-- Password -->
          <validation-provider
            v-slot="validationContext"
            name="Password"
            :rules="{ required: true }"
          >
            <b-form-group label="รหัสผ่าน" label-for="txtPass">
              <b-form-input
                id="txtPass"
                v-model="form.Password"
                name="txtPass"
                type="password"
                :state="getValidationState(validationContext)"
                placeholder="••••••••"
              />
              <b-form-invalid-feedback>
                {{ validationContext.errors[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <!-- Login Button -->
          <b-button type="submit" block variant="primary" size="lg" class="mt-3">
            Login
          </b-button>
        </b-form>
      </validation-observer>

      <!-- Footer Links -->
      <div class="login-footer text-center mt-4">
        <p class="mb-1">
          ยังไม่มีบัญชี?
          <b-link href="/register">
            สมัครสมาชิก
          </b-link>
        </p>
        <p>
          <b-link href="/forgot-password">
            ลืมรหัสผ่าน?
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
        Username: '',
        Password: ''
      }
    }
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    async onLogin () {
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.login-header .title {
  font-size: 28px;
  font-weight: 700;
}

.login-header .subtitle {
  font-size: 18px;
  opacity: 0.8;
}

.b-form-input {
  border-radius: 12px;
  padding: 12px 16px;
}

button {
  border-radius: 12px !important;
}

.login-footer p {
  font-size: 18px;
  opacity: 0.9;
}
.login-footer a {
  color: #ffd369;
  font-weight: 500;
}
</style>
