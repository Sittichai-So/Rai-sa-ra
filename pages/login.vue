<template>
  <div class="auth-page">
    <div class="bg-shapes">
      <div class="shape shape-1" />
      <div class="shape shape-2" />
      <div class="shape shape-3" />
    </div>

    <div class="auth-card">
      <already-signed-in />
      <div class="auth-header text-center">
        <span class="auth-eyebrow">RAI-SA-RA</span>
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
              <b-input-group>
                <b-form-input
                  id="txtPass"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  :state="getValidationState(validationContext)"
                  placeholder="••••••••"
                />
                <b-input-group-append>
                  <b-button class="pw-toggle" type="button" tabindex="-1" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" />
                  </b-button>
                </b-input-group-append>
              </b-input-group>
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>

          <b-button type="submit" block size="lg" class="submit-btn mt-3">
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
import AlreadySignedIn from '~/components/AlreadySignedIn.vue'

export default {
  components: { AlreadySignedIn },
  layout: 'login',
  middleware: 'guest',
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      showPassword: false
    }
  },
  head () {
    return {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap' }
      ]
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
          this.$Notiflix.Loading()
          setTimeout(() => {
            this.$Notiflix.Remove()
            const token = login.result.token
            const userData = login.result

            localStorage.setItem('token', token)
            userData.status = 'online'
            localStorage.setItem('userData', JSON.stringify(userData))

            this.$store.commit('setUserData', userData)

            if (this.$socket) {
              this.$socket.disconnect()
              this.$socket.connect()
            }

            this.$router.push('/chat/chat')
          }, 1000)
        } else {
          await this.$swal({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
            text: login.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
          })
        }
      } catch (error) {
        const resData = error.response?.data || {}
        const errorMessage = resData.cause || resData.message || 'เกิดข้อผิดพลาด'

        await this.$swal({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: errorMessage
        })
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  font-family: 'Kanit', sans-serif;
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
  font-size: 30px;
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

.pw-toggle {
  background: #121218 !important;
  border: 2px solid rgba(246, 243, 237, 0.2) !important;
  border-left: none !important;
  color: rgba(246, 243, 237, 0.6) !important;
  border-radius: 0 12px 12px 0 !important;
  padding: 0 14px !important;
}

.pw-toggle:hover,
.pw-toggle:focus {
  color: #ff5c4d !important;
  background: #121218 !important;
  box-shadow: none !important;
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
  margin-bottom: 8px;
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
    font-size: 26px;
  }
}
</style>
