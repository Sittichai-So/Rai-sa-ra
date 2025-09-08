<template>
  <div class="auth-page">
    <div class="auth-card shadow-lg">
      <div class="auth-header text-center">
        <h2 class="title">
          Welcome Back 👋
        </h2>
        <p class="subtitle">
          เข้าสู่ระบบเพื่อเริ่มต้น Community <br> Rai-Sa-Ra
        </p>
      </div>

      <validation-observer ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit(onLogin)">
          <validation-provider v-slot="validationContext" name="username" :rules="{ required: true }">
            <b-form-group label="ชื่อผู้ใช้งาน" label-for="txtUser">
              <b-form-input
                id="txtUser"
                v-model="form.username"
                :state="getValidationState(validationContext)"
                placeholder="กรอกชื่อผู้ใช้งาน"
              />
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <validation-provider v-slot="validationContext" name="password" :rules="{ required: true }">
            <b-form-group label="รหัสผ่าน" label-for="txtPass">
              <b-form-input
                id="txtPass"
                v-model="form.password"
                type="password"
                :state="getValidationState(validationContext)"
                placeholder="••••••••"
              />
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <b-button type="submit" block variant="light" size="lg" class="submit-btn mt-3">
            เข้าสู่ระบบ
          </b-button>
        </b-form>
      </validation-observer>

      <div class="auth-footer text-center mt-4">
        <p>
          ยังไม่มีบัญชี? <b-link to="/register">
            สมัครสมาชิก
          </b-link>
        </p>
        <p>
          <b-link to="/forgot-password">
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
        username: '',
        password: ''
      }
    }
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    async onLogin () {
      try {
        const login = await this.$axios.$post(process.env.API_LOGIN, this.form)

        if (login.status === 'success') {
          const token = login.token
          const userData = login.result
          localStorage.setItem('token', token)
          localStorage.setItem('userData', JSON.stringify(login.result))

          this.$store.commit('setUserData', userData)
          this.$router.push('/chat')
        } else {
          await this.$swal({
            icon: 'error',
            title: 'ไม่พบข้อมูล'
          })
        }
      } catch (error) {
        console.log(error)
        await this.$swal({
          icon: 'error',
          title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        })
      }
    }
  }
}
</script>

<style scoped>
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
  font-size: 20px;
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
