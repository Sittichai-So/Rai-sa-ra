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
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-user" />
              ข้อมูลส่วนตัว
            </h4>

            <b-row>
              <b-col cols="12" sm="6">
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

              <b-col cols="12" sm="6">
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
              <b-col cols="12" sm="6">
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

              <b-col cols="12" sm="6">
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
              <b-col cols="12" sm="6">
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

              <b-col cols="12" sm="6">
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
              <b-form-checkbox
                id="acceptTerms"
                v-model="form.acceptTerms"
                :state="getValidationState(validationContext)"
                class="terms-checkbox"
              >
                ฉันยอมรับ <b-link href="#" @click="showTerms">
                  เงื่อนไขการใช้งาน
                </b-link> และ <b-link href="#" @click="showPrivacy">
                  นโยบายความเป็นส่วนตัว
                </b-link>
              </b-form-checkbox>
              <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
            </validation-provider>
          </div>

          <b-button
            type="submit"
            block
            size="lg"
            class="submit-btn mt-4"
            :disabled="!valid || isRegistering || usernameCheckStatus === 'unavailable' || usernameCheckStatus === 'checking'"
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
  head () {
    return {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&display=swap' }
      ]
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
      this.$swal({
        title: 'เงื่อนไขการใช้งาน',
        html: `
          <div style="text-align:left;line-height:1.8">
            <p>1. เคารพสมาชิกคนอื่นและใช้ภาษาที่สุภาพ</p>
            <p>2. ไม่โพสต์เนื้อหาที่ผิดกฎหมายหรือไม่เหมาะสม</p>
            <p>3. ไม่ Spam หรือรบกวนผู้อื่น</p>
            <p>4. ไม่แอบอ้างเป็นผู้อื่น</p>
            <p>5. ทีมงานมีสิทธิ์ระงับบัญชีที่ละเมิดเงื่อนไข</p>
          </div>`,
        confirmButtonText: 'รับทราบ'
      })
    },

    showPrivacy () {
      this.$swal({
        title: 'นโยบายความเป็นส่วนตัว',
        html: `
          <div style="text-align:left;line-height:1.8">
            <p>เราเก็บข้อมูล ชื่อ อีเมล เบอร์โทร เพื่อใช้ยืนยันตัวตนและให้บริการแชทเท่านั้น</p>
            <p>รหัสผ่านถูกเข้ารหัสก่อนจัดเก็บ</p>
            <p>เราจะไม่เปิดเผยข้อมูลของคุณให้บุคคลที่สามโดยไม่ได้รับความยินยอม</p>
            <p>ข้อความในห้องแชทจะถูกลบอัตโนมัติตามระยะเวลาที่กำหนด</p>
          </div>`,
        confirmButtonText: 'รับทราบ'
      })
    }
  }
}
</script>

<style scoped>
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
  padding: 40px 20px;
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
  top: 8%;
  left: 6%;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #ff5c4d !important;
}

.shape-2 {
  bottom: 10%;
  right: 8%;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #ffc94d !important;
  transform: rotate(12deg);
}

.shape-3 {
  top: 40%;
  right: 4%;
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
  padding: 44px;
  width: 100%;
  max-width: 720px;
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
  color: rgba(246, 243, 237, 0.72);
  margin-bottom: 28px;
}

.progress-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.45;
}

.step.active {
  opacity: 1;
}

.step span {
  font-size: 13px;
  font-weight: 600;
  color: #f6f3ed;
}

.step-number {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #000;
  background: #121218;
  color: #f6f3ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  margin-bottom: 8px;
}

.step.active .step-number {
  background: #ffc94d;
  color: #121218;
}

.step-divider {
  width: 60px;
  height: 2px;
  background: rgba(246, 243, 237, 0.25);
  margin: 0 16px;
  margin-bottom: 26px;
}

.form-section {
  background: #121218;
  border: 2px solid rgba(246, 243, 237, 0.12);
  border-radius: 18px;
  padding: 26px;
  margin-bottom: 22px;
}

.section-title {
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 18px;
  color: #ff9f95;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  font-size: 16px;
  color: #ff5c4d;
}

.form-group label,
::v-deep .form-group > label,
::v-deep .col-form-label,
::v-deep legend.col-form-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #f6f3ed;
  font-size: 15px !important;
  line-height: 1.4;
}

::v-deep .form-control,
.form-control {
  border-radius: 12px !important;
  padding: 12px 16px !important;
  font-size: 16px !important;
  background: #1c1c26 !important;
  border: 2px solid rgba(246, 243, 237, 0.2) !important;
  color: #f6f3ed !important;
  height: auto !important;
}

::v-deep .form-control::placeholder,
.form-control::placeholder {
  color: rgba(246, 243, 237, 0.4);
  font-size: 15px;
}

::v-deep .form-text,
::v-deep small.text-muted {
  font-size: 13px !important;
}

.form-control:focus {
  background: #1c1c26 !important;
  border-color: #ff5c4d !important;
  box-shadow: 0 0 0 3px rgba(255, 92, 77, 0.25) !important;
  color: #f6f3ed !important;
}

.form-control.is-invalid {
  border-color: #ff5c4d !important;
}

.form-control.is-valid {
  border-color: #4ade80 !important;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 6px;
  background: rgba(246, 243, 237, 0.15);
  border-radius: 999px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 999px;
}

.strength-fill.weak {
  background: #ff5c4d;
}

.strength-fill.medium {
  background: #ffc94d;
}

.strength-fill.strong {
  background: #4ade80;
}

.strength-text {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  font-weight: 600;
}

.strength-text.weak {
  color: #ff8f84;
}

.strength-text.medium {
  color: #ffc94d;
}

.strength-text.strong {
  color: #4ade80;
}

.terms-checkbox {
  font-size: 15px;
  color: #f6f3ed;
}

.submit-btn {
  border-radius: 999px !important;
  background: #ff5c4d !important;
  border: 2px solid #000 !important;
  color: #121218 !important;
  font-weight: 700 !important;
  font-size: 17px !important;
  padding: 13px 0 !important;
  box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.9);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #ffc94d !important;
  color: #121218 !important;
  transform: translate(-2px, -2px);
  box-shadow: 7px 7px 0 rgba(0, 0, 0, 0.9);
}

.submit-btn:active:not(:disabled) {
  transform: translate(0, 0);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.9);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.auth-footer p {
  font-size: 15px;
  color: rgba(246, 243, 237, 0.75);
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

.input-group-text {
  background: #1c1c26 !important;
  border: 2px solid rgba(246, 243, 237, 0.2) !important;
  color: #f6f3ed;
}

.text-success {
  color: #4ade80 !important;
}

.text-danger {
  color: #ff8f84 !important;
}

.text-info {
  color: #7dd3fc !important;
}

.text-muted {
  color: rgba(246, 243, 237, 0.5) !important;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 30px 20px;
  }

  .progress-steps {
    gap: 8px;
  }

  .step span {
    font-size: 12px;
  }

  .form-section {
    padding: 20px 16px;
  }
}
</style>
