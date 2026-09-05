<template>
  <b-modal
    v-model="showSetting"
    title=""
    centered
    hide-footer
    hide-header
    size="lg"
    modal-class="modern-settings-modal"
    body-class="p-0"
  >
    <div class="modern-settings-container">
      <div class="settings-header">
        <div>
          <h3 class="mb-1">
            การตั้งค่า
          </h3>
          <p class="mb-0" style="color: white;">
            จัดการข้อมูลส่วนตัวและความปลอดภัยของคุณ
          </p>
        </div>
        <b-button class="close-btn" @click="close">
          <i class="fas fa-times" />
        </b-button>
      </div>

      <div class="settings-body">
        <div class="settings-sidebar">
          <nav class="settings-nav">
            <b-button
              v-for="item in menuItems"
              :key="item.key"
              :class="['nav-item', { active: activeMenu === item.key }]"
              @click="switchMenu(item.key)"
            >
              <div class="nav-icon">
                <i :class="item.icon" />
              </div>
              <div class="nav-content">
                <span class="nav-label">{{ item.label }}</span>
                <span class="nav-desc">{{ item.description }}</span>
              </div>
              <i class="fas fa-chevron-right nav-arrow" />
            </b-button>
          </nav>
        </div>

        <div class="settings-content">
          <div v-if="activeMenu === 'editProfile'" class="content-section">
            <div class="section-header">
              <div class="icon-wrapper">
                <i class="fas fa-user" />
              </div>
              <div>
                <h4>ข้อมูลโปรไฟล์</h4>
                <p>จัดการข้อมูลส่วนตัวและข้อมูลติดต่อของคุณ</p>
              </div>
            </div>

            <input
              ref="avatarInput"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              hidden
              @change="onAvatarSelected"
            >

            <div v-if="!editingProfile" class="profile-view">
              <div class="profile-avatar">
                <div class="avatar-circle">
                  <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="avatar-img">
                  <i v-else class="fas fa-user" />
                </div>
                <b-button class="avatar-edit-btn" :disabled="uploadingAvatar" @click="pickAvatar">
                  <i :class="uploadingAvatar ? 'fas fa-spinner fa-spin' : 'fas fa-camera'" />
                </b-button>
              </div>

              <div class="profile-info-grid">
                <div class="info-card">
                  <label>ชื่อ - นามสกุล</label>
                  <p>{{ profile.firstName }} {{ profile.lastName }}</p>
                </div>
                <div class="info-card">
                  <label>อีเมล</label>
                  <p>{{ profile.email }}</p>
                </div>
                <div class="info-card">
                  <label>ชื่อผู้ใช้</label>
                  <p>{{ profile.displayName }}</p>
                </div>
                <div class="info-card">
                  <label>เบอร์โทรศัพท์</label>
                  <p>{{ profile.phoneNumber }}</p>
                </div>
                <div class="info-card info-card-wide">
                  <label>แนะนำตัว</label>
                  <p>{{ profile.bio || '— ยังไม่ได้เพิ่มคำแนะนำตัว —' }}</p>
                </div>
              </div>

              <div class="action-buttons">
                <b-button class="btn-primary" @click="editingProfile = true">
                  <i class="fas fa-edit" />
                  แก้ไขโปรไฟล์
                </b-button>
              </div>
            </div>

            <div v-else class="profile-edit">
              <b-row>
                <b-col cols="12" sm="6" md="4">
                  <b-form-group
                    label="ชื่อ"
                    label-for="input-firstName"
                    class="mb-3"
                  >
                    <b-input-group>
                      <b-input-group-prepend>
                        <b-input-group-text>
                          <i class="fas fa-user" />
                        </b-input-group-text>
                      </b-input-group-prepend>
                      <b-form-input
                        id="input-firstName"
                        v-model="profile.firstName"
                        type="text"
                        placeholder="กรอกชื่อผู้ใช้"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col cols="12" sm="6" md="4">
                  <b-form-group
                    label="นามสกุล"
                    label-for="input-lastName"
                    class="mb-3"
                  >
                    <b-input-group>
                      <b-input-group-prepend>
                        <b-input-group-text>
                          <i class="fas fa-user" />
                        </b-input-group-text>
                      </b-input-group-prepend>
                      <b-form-input
                        id="input-lastName"
                        v-model="profile.lastName"
                        type="text"
                        placeholder="กรอกชื่อผู้ใช้"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col cols="12" sm="6" md="4">
                  <b-form-group
                    label="ชื่อผู้ใช้"
                    label-for="input-displayName"
                    class="mb-3"
                  >
                    <b-input-group>
                      <b-input-group-prepend>
                        <b-input-group-text>
                          <i class="fa-solid fa-display" />
                        </b-input-group-text>
                      </b-input-group-prepend>
                      <b-form-input
                        id="input-displayName"
                        v-model="profile.displayName"
                        type="text"
                        placeholder="กรอกชื่อผู้ใช้"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>
                <b-col cols="12" sm="6" md="4">
                  <b-form-group
                    label="เบอร์โทรศัพท์"
                    label-for="input-phoneNumber"
                    class="mb-4"
                  >
                    <b-input-group>
                      <b-input-group-prepend>
                        <b-input-group-text>
                          <i class="fa-solid fa-phone" />
                        </b-input-group-text>
                      </b-input-group-prepend>
                      <b-form-input
                        id="input-phoneNumber"
                        v-model="profile.phoneNumber"
                        type="text"
                        placeholder="กรอกอีเมล"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>

                <b-col cols="12" sm="6" md="4">
                  <b-form-group
                    label="อีเมล"
                    label-for="input-email"
                    class="mb-4"
                  >
                    <b-input-group>
                      <b-input-group-prepend>
                        <b-input-group-text>
                          <i class="fas fa-envelope" />
                        </b-input-group-text>
                      </b-input-group-prepend>
                      <b-form-input
                        id="input-email"
                        v-model="profile.email"
                        type="email"
                        placeholder="กรอกอีเมล"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>

                <b-col cols="12">
                  <b-form-group
                    label="แนะนำตัว (bio)"
                    label-for="input-bio"
                    class="mb-4"
                  >
                    <b-form-textarea
                      id="input-bio"
                      v-model="profile.bio"
                      placeholder="เล่าเกี่ยวกับตัวคุณสั้น ๆ..."
                      rows="3"
                      max-rows="6"
                      :state="bioState"
                    />
                    <small class="form-text text-muted">
                      {{ (profile.bio || '').length }}/500 ตัวอักษร
                    </small>
                  </b-form-group>
                </b-col>
              </b-row>

              <div class="action-buttons">
                <b-button class="btn-success" @click="saveProfile">
                  <i class="fas fa-check" />
                  บันทึกการเปลี่ยนแปลง
                </b-button>
                <b-button class="btn-secondary" @click="editingProfile = false">
                  ยกเลิก
                </b-button>
              </div>
            </div>
          </div>

          <div v-else-if="activeMenu === 'editPassword'" class="content-section">
            <div class="section-header">
              <div class="icon-wrapper">
                <i class="fas fa-shield-alt" />
              </div>
              <div>
                <h4>ความปลอดภัย</h4>
                <p>จัดการรหัสผ่านและการรักษาความปลอดภัยบัญชี</p>
              </div>
            </div>

            <div v-if="!editingPassword" class="security-view">
              <div class="security-card">
                <div class="security-icon">
                  <i class="fas fa-key" />
                </div>
                <div class="security-content">
                  <h5>รหัสผ่าน</h5>
                  <p>แก้ไขล่าสุด: 30 วันที่แล้ว</p>
                  <div class="security-badge">
                    <i class="fas fa-check-circle" />
                    <span>ปลอดภัย</span>
                  </div>
                </div>
              </div>

              <div class="info-box">
                <i class="fas fa-info-circle" />
                <div>
                  <strong>คำแนะนำด้านความปลอดภัย</strong>
                  <p>เราแนะนำให้เปลี่ยนรหัสผ่านทุก 3 เดือน และใช้รหัสผ่านที่มีความซับซ้อน</p>
                </div>
              </div>

              <div class="action-buttons">
                <b-button class="btn-warning" @click="editingPassword = true">
                  <i class="fas fa-key" />
                  เปลี่ยนรหัสผ่าน
                </b-button>
              </div>
            </div>

            <div v-else class="password-edit">
              <b-row style="margin-top: -10px;">
                <b-col cols="12" sm="6" md="6">
                  <b-form-group
                    label="รหัสผ่านปัจจุบัน"
                    label-for="input-currentPassword"
                    class="mb-3"
                  >
                    <b-input-group>
                      <b-input-group-prepend>
                        <b-input-group-text>
                          <i class="fas fa-lock" />
                        </b-input-group-text>
                      </b-input-group-prepend>
                      <b-form-input
                        id="input-currentPassword"
                        v-model="password.currentPassword"
                        type="password"
                        placeholder="กรอกรหัสผ่านปัจจุบัน"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="12" sm="6" md="6">
                  <validation-provider v-slot="validationContext" name="newPassword" :rules="{ required: true, min: 8, regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/ }" vid="newPassword">
                    <b-form-group label="รหัสผ่านใหม่" label-for="newPassword">
                      <b-input-group>
                        <b-input-group-prepend>
                          <b-input-group-text>
                            <i class="fas fa-lock" />
                          </b-input-group-text>
                        </b-input-group-prepend>
                        <b-form-input
                          id="newPassword"
                          v-model="password.newPassword"
                          :type="showPassword ? 'text' : 'password'"
                          :state="getNewPasswordValidationState(validationContext)"
                          placeholder="••••••••"
                          @input="checkPasswordStrength"
                        />
                      </b-input-group>

                      <div v-if="password.newPassword && password.currentPassword && password.newPassword === password.currentPassword" class="text-danger mt-2">
                        <i class="fas fa-exclamation-triangle" /> รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม
                      </div>

                      <div v-if="password.newPassword" class="password-strength mt-2">
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
              </b-row>

              <b-row>
                <b-col cols="12" sm="6" md="6">
                  <validation-provider
                    v-slot="validationContext"
                    name="confirmPassword"
                    :rules="{ required: true, confirmed: 'newPassword' }"
                  >
                    <b-form-group label="ยืนยันรหัสผ่านใหม่" label-for="PassConfirm">
                      <b-input-group>
                        <b-input-group-prepend>
                          <b-input-group-text>
                            <i class="fas fa-lock" />
                          </b-input-group-text>
                        </b-input-group-prepend>
                        <b-form-input
                          id="PassConfirm"
                          v-model="password.passwordConfirm"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          :state="getPasswordConfirmState(validationContext)"
                          placeholder="••••••••"
                        />
                      </b-input-group>

                      <div v-if="password.passwordConfirm && password.newPassword === password.passwordConfirm" class="text-success mt-1">
                        <i class="fas fa-check" /> รหัสผ่านตรงกัน
                      </div>
                      <div v-else-if="password.passwordConfirm && password.newPassword !== password.passwordConfirm" class="text-danger mt-1">
                        <i class="fas fa-times" /> รหัสผ่านไม่ตรงกัน
                      </div>

                      <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                    </b-form-group>
                  </validation-provider>
                </b-col>
              </b-row>

              <div class="action-buttons">
                <b-button
                  class="btn-success"
                  :disabled="!isPasswordValid"
                  @click="savePassword"
                >
                  <i class="fas fa-check" />
                  อัปเดตรหัสผ่าน
                </b-button>
                <b-button class="btn-secondary" @click="editingPassword = false">
                  ยกเลิก
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'ModernSettingDialog',
  data () {
    return {
      showSetting: false,
      activeMenu: 'editProfile',
      editingProfile: false,
      editingPassword: false,
      menuItems: [
        {
          key: 'editProfile',
          label: 'โปรไฟล์',
          description: 'ข้อมูลส่วนตัว',
          icon: 'fas fa-user'
        },
        {
          key: 'editPassword',
          label: 'ความปลอดภัย',
          description: 'รหัสผ่านและการเข้าถึง',
          icon: 'fas fa-shield-alt'
        }
      ],
      passwordStrength: {
        level: 'weak',
        percent: 0,
        text: 'รหัสผ่านอ่อนแอ'
      },
      profile: [],
      uploadingAvatar: false,
      showPassword: false,
      showConfirmPassword: false,
      password: {
        currentPassword: '',
        newPassword: '',
        passwordConfirm: ''
      }
    }
  },
  computed: {
    avatarUrl () {
      const a = this.profile && this.profile.avatar
      if (!a) {
        return ''
      }
      return /^https?:\/\//.test(a) ? a : (process.env.API_FILE_BASE || '') + a
    },
    bioState () {
      const len = (this.profile && this.profile.bio ? this.profile.bio : '').length
      return len > 500 ? false : null
    },
    isPasswordValid () {
      const { currentPassword, newPassword, passwordConfirm } = this.password
      if (!currentPassword || !newPassword || !passwordConfirm) {
        return false
      }
      if (currentPassword === newPassword) {
        return false
      }

      if (newPassword !== passwordConfirm) {
        return false
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(newPassword)) {
        return false
      }

      return true
    }
  },
  async mounted () {
    await this.getProfile()
  },
  methods: {
    getValidationState ({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null
    },
    getNewPasswordValidationState (validationContext) {
      const { currentPassword, newPassword } = this.password

      if (newPassword && currentPassword && newPassword === currentPassword) {
        return false
      }

      return this.getValidationState(validationContext)
    },
    open () {
      this.showSetting = true
    },
    close () {
      this.showSetting = false
      this.resetForms()
    },
    async getProfile () {
      try {
        const res = await this.$axios.$get(process.env.API_GET_USER_BY_ID)
        if (res.status === 'success') {
          this.profile = res.result
        }
      } catch (err) {
        this.isLoading = false
      }
    },
    switchMenu (menu) {
      this.activeMenu = menu
      this.resetForms()
    },
    pickAvatar () {
      this.$refs.avatarInput.click()
    },
    async onAvatarSelected (e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''
      if (!file) {
        return
      }
      if (!file.type.startsWith('image/')) {
        this.$swal({ icon: 'error', title: 'ไฟล์ไม่ถูกต้อง', text: 'กรุณาเลือกไฟล์รูปภาพ' })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.$swal({ icon: 'error', title: 'ไฟล์ใหญ่เกินไป', text: 'รูปโปรไฟล์ต้องไม่เกิน 5MB' })
        return
      }

      this.uploadingAvatar = true
      try {
        const fd = new FormData()
        fd.append('file', file)
        const up = await this.$axios.$post(process.env.API_UPLOAD_FILE, fd)
        const url = up.result && up.result.url
        if (!url) {
          throw new Error('ไม่ได้รับ URL รูปจากเซิร์ฟเวอร์')
        }

        await this.$axios.$post(process.env.API_EDIT_PROFILE_BY_ID, { avatar: url })
        this.$set(this.profile, 'avatar', url)
        this.syncAvatarToSession(url)
        this.$swal({ icon: 'success', title: 'อัปเดตรูปโปรไฟล์แล้ว', timer: 1600, showConfirmButton: false })
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'อัปโหลดไม่สำเร็จ',
          text: err.response?.data?.message || err.message || 'ลองใหม่อีกครั้ง'
        })
      } finally {
        this.uploadingAvatar = false
      }
    },
    syncAvatarToSession (url) {
      try {
        const raw = localStorage.getItem('userData')
        if (!raw) {
          return
        }
        const data = JSON.parse(raw)
        data.avatar = url
        localStorage.setItem('userData', JSON.stringify(data))
        this.$store.commit('setUserData', data)
      } catch (e) {}
    },
    resetForms () {
      this.editingProfile = false
      this.editingPassword = false
      this.password = { currentPassword: '', newPassword: '', passwordConfirm: '' }
    },
    async saveProfile () {
      try {
        const result = await this.$swal({
          title: 'ยืนยันการแก้ไขข้อมูล',
          text: 'คุณต้องการแก้ไขข้อมูลของคุณใช่หรือไม่?',
          icon: 'warning',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          showCancelButton: true,
          confirmButtonColor: '#3085d6'
        })

        if (result.isConfirmed) {
          const response = await this.$axios.$post(process.env.API_EDIT_PROFILE_BY_ID, {
            ...this.profile
          })

          if (response.status === 'success') {
            this.syncAvatarToSession(this.profile.avatar || null)
            await this.$swal({
              title: 'แก้ไขข้อมูลสำเร็จ',
              text: 'ข้อมูลของคุณแก้ไขเรียบร้อยแล้ว',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            })
          } else {
            await this.$swal({
              title: 'เกิดข้อผิดพลาด',
              text: response.message || 'ไม่สามารถแก้ไขข้อมูลได้',
              icon: 'error',
              confirmButtonText: 'OK'
            })
          }
        }
      } catch (err) {
        await this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      } finally {
        this.editingProfile = false
        this.resetForms()
      }
    },
    async savePassword () {
      try {
        this.editingPassword = true

        const confirmResult = await this.$swal({
          title: 'ยืนยันการเปลี่ยนรหัสผ่าน',
          text: 'ยืนยันข้อมูลการเปลี่ยนรหัสผ่าน',
          icon: 'question',
          cancelButtonText: 'ยกเลิก',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยัน',
          showCancelButton: true,
          confirmButtonColor: '#28a745'
        })

        if (confirmResult.isConfirmed) {
          const payload = {
            currentPassword: this.password.currentPassword,
            newPassword: this.password.newPassword
          }

          const response = await this.$axios.$post(process.env.API_EDIT_PASSWORD_BY_ID, payload)

          if (response.status === 'success') {
            await this.$swal({
              title: 'สำเร็จ!',
              text: 'แก้ไขรหัสผ่านเรียบร้อยแล้ว',
              icon: 'success',
              timer: 2000,
              showConfirmButton: true
            })
          }
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
        await this.$swal({
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'ลองใหม่'
        })
      } finally {
        this.editingPassword = false
        this.resetForms()
      }
    },
    getPasswordConfirmState (validationContext) {
      if (this.password.passwordConfirm && this.password.newPassword !== this.password.passwordConfirm) {
        return false
      }
      return this.getValidationState(validationContext)
    },
    checkPasswordStrength () {
      const password = this.password.newPassword
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
    }
  }
}
</script>

<style scoped>
.modern-settings-container {
  --ink: #101014;
  --paper: #14141c;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --violet-deep: #5b4fd6;
  --yellow: #ffc94d;
  --white: #ffffff;
  --line: 3px;
  --line-sm: 2px;
  --shadow-sm: 4px 4px 0 var(--ink);
  --radius-lg: 20px;
  --radius-md: 14px;

  background: var(--paper);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: var(--line) solid var(--ink);
  box-shadow: var(--shadow-sm);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: var(--line-sm) solid var(--ink);
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  color: white;
}

.settings-header h3 {
  font-family: 'Kanit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.settings-header p {
  font-size: 0.9rem;
  opacity: 0.95;
  margin: 4px 0 0 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid var(--ink);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.close-btn:hover {
  background: var(--coral);
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--ink);
}

.settings-body {
  display: flex;
  min-height: 440px;
  background: var(--cream);
}

.settings-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.5);
  padding: 18px 14px;
  border-right: var(--line-sm) solid var(--ink);
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: var(--white);
  border: 2px solid var(--ink);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  margin-bottom: 8px;
}

.nav-item:hover {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--ink);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  color: white;
  box-shadow: 4px 4px 0 var(--ink);
  transform: translate(-2px, -2px);
}

.nav-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--violet);
  border: 2px solid var(--ink);
  border-radius: 10px;
  font-size: 1rem;
  flex-shrink: 0;
  color: white;
  box-shadow: 2px 2px 0 var(--ink);
}

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-weight: 700;
  font-size: 0.9rem;
  font-family: 'Kanit', sans-serif;
}

.nav-desc {
  font-size: 0.72rem;
  opacity: 0.75;
}

.nav-arrow {
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 18px;
}

.nav-item:hover .nav-arrow,
.nav-item.active .nav-arrow {
  opacity: 1;
}

.settings-content {
  flex: 1;
  min-width: 0;
  padding: 22px 24px;
  overflow-y: auto;
  max-height: 74vh;
  background: var(--cream);
}

.content-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 18px;
  border-bottom: var(--line-sm) solid var(--ink);
}

.icon-wrapper {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  border: 2px solid var(--ink);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.15rem;
  flex-shrink: 0;
  box-shadow: 3px 3px 0 var(--ink);
}

.section-header h4 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #111827;
}

.section-header p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.profile-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.avatar-circle {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-card-wide {
  grid-column: 1 / -1;
}

.info-card-wide p {
  white-space: pre-wrap;
  word-break: break-word;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: calc(50% - 60px);
  width: 40px;
  height: 40px;
  background: white;
  border: 3px solid #f9fafb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.profile-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.info-card {
  background: #f9fafb;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.info-card label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-card p {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.security-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  color: white;
}

.security-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.security-content h5 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.security-content p {
  opacity: 0.9;
  margin: 0 0 12px 0;
}

.security-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.info-box i {
  color: #3b82f6;
  font-size: 20px;
  flex-shrink: 0;
}

.info-box strong {
  display: block;
  color: #1e40af;
  margin-bottom: 4px;
}

.info-box p {
  color: #1e40af;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  font-size: 16px;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
  background: white;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.action-buttons button {
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-body {
    flex-direction: column;
  }

  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    flex-direction: column;
    min-width: 140px;
    text-align: center;
  }

  .nav-arrow {
    display: none;
  }

  .profile-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
