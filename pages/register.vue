<template>
  <div class="auth-page">
    <div class="auth-card shadow-lg">
      <div class="auth-header text-center">
        <h2 class="title">
          Create Account ✨
        </h2>
        <p class="subtitle">
          สมัครสมาชิกเพื่อเข้าร่วม Community Rai-Sa-Ra
        </p>

        <div class="progress-steps">
          <div class="step active">
            <div class="step-number">
              1
            </div>
            <span>ข้อมูลส่วนตัว</span>
          </div>
          <div class="step-divider" />
          <div class="step active">
            <div class="step-number">
              2
            </div>
            <span>ข้อมูลบัญชี</span>
          </div>
        </div>
      </div>

      <validation-observer ref="observer" v-slot="{ handleSubmit, valid }">
        <b-form @submit.stop.prevent="handleSubmit(onRegister)">
          <!-- Section 1: Personal Information -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-user" />
              ข้อมูลส่วนตัว
            </h4>

            <b-row>
              <b-col>
                <validation-provider v-slot="validationContext" name="firstName" :rules="{ required: true }">
                  <b-form-group label="ชื่อ" label-for="regFirstName">
                    <b-form-input
                      id="regFirstName"
                      v-model="form.firstName"
                      :state="getValidationState(validationContext)"
                      placeholder="ระบุชื่อ"
                    />
                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                  </b-form-group>
                </validation-provider>
              </b-col>

              <b-col>
                <validation-provider v-slot="validationContext" name="lastName" :rules="{ required: true }">
                  <b-form-group label="นามสกุล" label-for="regLastName">
                    <b-form-input
                      id="regLastName"
                      v-model="form.lastName"
                      :state="getValidationState(validationContext)"
                      placeholder="ระบุนามสกุล"
                    />
                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                  </b-form-group>
                </validation-provider>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <validation-provider v-slot="validationContext" name="phoneNumber" :rules="{ required: true, min: 10, max: 10, MobileValidate:true}">
                  <b-form-group label="เบอร์โทรศัพท์" label-for="regPhoneNumber">
                    <b-form-input
                      id="regPhoneNumber"
                      v-model="form.phoneNumber"
                      :state="getValidationState(validationContext)"
                      placeholder="0812345678"
                      maxlength="10"
                      @input="formatPhoneNumber"
                    />
                    <b-form-invalid-feedback>{{ validationContext.errors[0] || 'กรุณาระบุเบอร์โทรศัพท์ 10 หลัก' }}</b-form-invalid-feedback>
                  </b-form-group>
                </validation-provider>
              </b-col>

              <b-col>
                <validation-provider v-slot="validationContext" name="email" :rules="{ required: true, email: true }">
                  <b-form-group label="อีเมล" label-for="regEmail">
                    <b-form-input
                      id="regEmail"
                      v-model="form.email"
                      type="email"
                      :state="getValidationState(validationContext)"
                      placeholder="example@email.com"
                    />
                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                  </b-form-group>
                </validation-provider>
              </b-col>
            </b-row>
          </div>

          <!-- Section 2: Account Information -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-lock" />
              ข้อมูลบัญชี
            </h4>

            <validation-provider v-slot="validationContext" name="username" :rules="{ required: true, min: 4, max: 20 }">
              <b-form-group label="Username" label-for="regUser">
                <b-input-group>
                  <b-form-input
                    id="regUser"
                    v-model="form.username"
                    :state="getUsernameValidationState(validationContext)"
                    placeholder="ตั้งชื่อผู้ใช้งาน 4-20 ตัวอักษร"
                    @input="checkUsernameAvailability"
                  />
                  <b-input-group-append v-if="usernameCheckStatus">
                    <b-input-group-text :class="usernameCheckStatus === 'available' ? 'text-success' : 'text-danger'">
                      <i :class="usernameCheckStatus === 'available' ? 'fas fa-check' : 'fas fa-times'" />
                    </b-input-group-text>
                  </b-input-group-append>
                </b-input-group>

                <div v-if="usernameCheckStatus === 'checking'" class="text-info mt-1">
                  <i class="fas fa-spinner fa-spin" /> กำลังตรวจสอบ...
                </div>
                <div v-else-if="usernameCheckStatus === 'available'" class="text-success mt-1">
                  <i class="fas fa-check" /> Username ใช้งานได้
                </div>
                <div v-else-if="usernameCheckStatus === 'unavailable'" class="text-danger mt-1">
                  <i class="fas fa-times" /> Username นี้ถูกใช้งานแล้ว
                </div>

                <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
              </b-form-group>
            </validation-provider>

            <b-row>
              <b-col>
                <validation-provider v-slot="validationContext" name="password" :rules="{ required: true, min: 8, regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/ }">
                  <b-form-group label="Password" label-for="regPass">
                    <b-input-group>
                      <b-form-input
                        id="regPass"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        :state="getValidationState(validationContext)"
                        placeholder="••••••••"
                        @input="checkPasswordStrength"
                      />
                    </b-input-group>

                    <div v-if="form.password" class="password-strength mt-2">
                      <div class="strength-bar">
                        <div
                          class="strength-fill"
                          :class="passwordStrength.level"
                          :style="{ width: passwordStrength.percent + '%' }"
                        />
                      </div>
                      <small class="strength-text" :class="passwordStrength.level">
                        {{ passwordStrength.text }}
                      </small>
                    </div>

                    <small class="form-text text-muted">
                      รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วย A-Z, a-z, 0-9
                    </small>
                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                  </b-form-group>
                </validation-provider>
              </b-col>

              <b-col>
                <validation-provider
                  v-slot="validationContext"
                  name="confirmPassword"
                  :rules="{ required: true, confirmed: 'password' }"
                >
                  <b-form-group label="Confirm Password" label-for="regPassConfirm">
                    <b-input-group>
                      <b-form-input
                        id="regPassConfirm"
                        v-model="form.passwordConfirm"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        :state="getPasswordConfirmState(validationContext)"
                        placeholder="••••••••"
                      />
                    </b-input-group>

                    <div v-if="form.passwordConfirm && form.password === form.passwordConfirm" class="text-success mt-1">
                      <i class="fas fa-check" /> รหัสผ่านตรงกัน
                    </div>
                    <div v-else-if="form.passwordConfirm && form.password !== form.passwordConfirm" class="text-danger mt-1">
                      <i class="fas fa-times" /> รหัสผ่านไม่ตรงกัน
                    </div>

                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                  </b-form-group>
                </validation-provider>
              </b-col>
            </b-row>
          </div>

          <div class="form-section">
            <validation-provider v-slot="validationContext" name="acceptTerms" :rules="{ required: { allowFalse: false } }">
              <b-form-group>
                <b-form-checkbox
                  id="acceptTerms"
                  v-model="form.acceptTerms"
                  :state="getValidationState(validationContext)"
                >
                  ฉันยอมรับ <b-link href="#" @click="showTerms">
                    เงื่อนไขการใช้งาน
                  </b-link> และ <b-link href="#" @click="showPrivacy">
                    นโยบายความเป็นส่วนตัว
                  </b-link>
                </b-form-checkbox>
                <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
              </b-form-group>
            </validation-provider>
          </div>

          <b-button
            type="submit"
            block
            variant="light"
            size="lg"
            class="submit-btn mt-4"
            :disabled="!valid || isRegistering"
          >
            <template v-if="isRegistering">
              <i class="fas fa-spinner fa-spin" /> กำลังสมัครสมาชิก...
            </template>
            <template v-else>
              <i class="fas fa-user-plus" /> สมัครสมาชิก
            </template>
          </b-button>
        </b-form>
      </validation-observer>

      <div class="auth-footer text-center mt-4">
        <p>
          มีบัญชีแล้ว? <b-link to="/login">
            <i class="fas fa-sign-in-alt" /> เข้าสู่ระบบ
          </b-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
let usernameCheckTimeout = null

export default {
  layout: 'login',
  data () {
    return {
      form: {
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        passwordConfirm: '',
        acceptTerms: false
      },
      showPassword: false,
      showConfirmPassword: false,
      usernameCheckStatus: null,
      passwordStrength: {
        level: 'weak',
        percent: 0,
        text: 'รหัสผ่านอ่อนแอ'
      },
      isRegistering: false
    }
  },
  computed: {
    isFormValid () {
      return this.form.acceptTerms &&
             this.usernameCheckStatus === 'available' &&
             this.form.password === this.form.passwordConfirm &&
             this.passwordStrength.level !== 'weak'
    }
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },

    getUsernameValidationState (validationContext) {
      if (this.usernameCheckStatus === 'unavailable') { return false }
      return this.getValidationState(validationContext)
    },

    getPasswordConfirmState (validationContext) {
      if (this.form.passwordConfirm && this.form.password !== this.form.passwordConfirm) {
        return false
      }
      return this.getValidationState(validationContext)
    },

    formatPhoneNumber () {
      this.form.phoneNumber = this.form.phoneNumber.replace(/\D/g, '')
    },

    checkUsernameAvailability () {
      if (this.form.username.length < 4) {
        this.usernameCheckStatus = null
        return
      }

      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout)
      }

      this.usernameCheckStatus = 'checking'

      usernameCheckTimeout = setTimeout(async () => {
        try {
          const response = await this.$axios.$post(`${process.env.API_CHECK_USERNAME}`, { username: this.form.username })
          this.usernameCheckStatus = response.available ? 'available' : 'unavailable'
        } catch (error) {
          console.error('Username check error:', error)
          this.usernameCheckStatus = null
        }
      }, 500)
    },

    checkPasswordStrength () {
      const password = this.form.password
      let score = 0

      if (password.length >= 8) { score += 25 }
      if (password.length >= 12) { score += 25 }
      if (/[a-z]/.test(password)) { score += 10 }
      if (/[A-Z]/.test(password)) { score += 10 }
      if (/[0-9]/.test(password)) { score += 15 }
      if (/[^A-Za-z0-9]/.test(password)) { score += 15 }

      if (score < 50) {
        this.passwordStrength = { level: 'weak', percent: score, text: 'รหัสผ่านอ่อนแอ' }
      } else if (score < 80) {
        this.passwordStrength = { level: 'medium', percent: score, text: 'รหัสผ่านปานกลาง' }
      } else {
        this.passwordStrength = { level: 'strong', percent: score, text: 'รหัสผ่านแข็งแกร่ง' }
      }
    },

    async onRegister () {
      try {
        this.isRegistering = true

        const confirmResult = await this.$swal({
          title: 'ยืนยันการสมัครสมาชิก',
          text: 'ยืนยันข้อมูลการสมัครเข้าสู่ระบบ',
          icon: 'question',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          showCancelButton: true,
          confirmButtonColor: '#28a745'
        })

        if (confirmResult.isConfirmed) {
          const payload = {
            username: this.form.username,
            firstName: this.form.firstName,
            lastName: this.form.lastName,
            email: this.form.email,
            phoneNumber: this.form.phoneNumber,
            password: this.form.password
          }

          console.log('payload', payload)

          const response = await this.$axios.$post(process.env.API_REGISTER_USER, payload)

          if (response.status === 'success') {
            await this.$swal({
              title: 'สำเร็จ!',
              text: 'สมัครเข้าสู่ระบบเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
              icon: 'success',
              confirmButtonText: 'ไปหน้าเข้าสู่ระบบ'
            })

            this.$router.push('/login')
          }
        }
      } catch (err) {
        console.error('Registration error:', err)

        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'

        await this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'ลองใหม่'
        })
      } finally {
        this.isRegistering = false
      }
    },

    onClear () {
      this.form = {
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        passwordConfirm: '',
        acceptTerms: false
      }
      this.usernameCheckStatus = null
      this.passwordStrength = {
        level: 'weak',
        percent: 0,
        text: 'รหัสผ่านอ่อนแอ'
      }
      this.$refs.observer.reset()
    },

    showTerms () {
      console.log('Show terms and conditions')
    },

    showPrivacy () {
      console.log('Show privacy policy')
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
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(18px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 800px;
  color: #fff;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
}

.auth-header .title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 10px;
}

.auth-header .subtitle {
  font-size: 18px;
  opacity: 0.85;
  margin-bottom: 30px;
}

.progress-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.6;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.step.active .step-number {
  background: #ffd369;
  color: #333;
}

.step-divider {
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 20px;
}

.form-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffd369;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  font-size: 18px;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #fff;
}

.form-control {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px !important;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #333;
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.95);
  border-color: #ffd369;
  box-shadow: 0 0 0 0.2rem rgba(255, 211, 105, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-valid {
  border-color: #28a745;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #dc3545;
}

.strength-fill.medium {
  background: #ffc107;
}

.strength-fill.strong {
  background: #28a745;
}

.strength-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.strength-text.weak {
  color: #ff6b6b;
}

.strength-text.medium {
  color: #ffd93d;
}

.strength-text.strong {
  color: #6bcf7f;
}
.submit-btn {
  border-radius: 12px;
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
  border: none;
  color: #333;
  font-weight: 600;
  font-size: 18px;
  padding: 15px 30px;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffdde1, #ee9ca7);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer p {
  font-size: 16px;
  opacity: 0.9;
}

.auth-footer a {
  color: #ffd369;
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  color: #ffed4e;
  text-decoration: underline;
}

/* Input Group Buttons */
.input-group-text {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.btn-outline-light {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.text-success {
  color: #6bcf7f !important;
}

.text-danger {
  color: #ff6b6b !important;
}

.text-info {
  color: #74c0fc !important;
}

.text-muted {
  color: rgba(255, 255, 255, 0.6) !important;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 30px 20px;
  }

  .progress-steps {
    flex-direction: column;
    gap: 15px;
  }

  .step-divider {
    width: 2px;
    height: 30px;
    margin: 10px 0;
  }

  .form-section {
    padding: 20px 15px;
  }
}
</style>
