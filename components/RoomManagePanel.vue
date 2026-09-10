<template>
  <transition name="rmp-fade">
    <div v-if="show" class="rmp-overlay" @click.self="$emit('close')">
      <div class="rmp-panel" role="dialog" aria-modal="true">
        <header class="rmp-header">
          <h3 class="rmp-title">
            <i class="fas fa-screwdriver-wrench" /> จัดการห้อง
          </h3>
          <button class="rmp-close" type="button" aria-label="ปิด" @click="$emit('close')">
            <i class="fas fa-times" />
          </button>
        </header>

        <div class="rmp-body">
          <div class="rmp-field">
            <label>ชื่อห้อง</label>
            <input v-model="form.name" type="text" class="rmp-input" maxlength="60">
          </div>

          <div class="rmp-field">
            <label>หมวดหมู่</label>
            <select v-model="form.category" class="rmp-input">
              <option v-for="c in categories" :key="c.key" :value="c.key">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="rmp-field">
            <label>คำอธิบาย</label>
            <textarea v-model="form.description" class="rmp-input" rows="3" maxlength="300" />
          </div>

          <div class="rmp-field">
            <label>แท็ก <span class="rmp-hint">(สูงสุด 5)</span></label>
            <div class="rmp-tags">
              <span v-for="(tag, i) in form.tags" :key="i" class="rmp-tag">
                {{ tag }}
                <button type="button" aria-label="ลบแท็ก" @click="form.tags.splice(i, 1)">
                  <i class="fas fa-times" />
                </button>
              </span>
              <input
                v-if="form.tags.length < 5"
                v-model="tagInput"
                type="text"
                class="rmp-tag-input"
                placeholder="พิมพ์แล้วกด Enter"
                @keydown.enter.prevent="addTag"
              >
            </div>
          </div>

          <div class="rmp-field">
            <label>ประเภทห้อง</label>
            <div class="rmp-type-row">
              <button
                type="button"
                class="rmp-type"
                :class="{ active: form.type === 'public' }"
                @click="form.type = 'public'"
              >
                <i class="fas fa-globe-asia" /> สาธารณะ
              </button>
              <button
                type="button"
                class="rmp-type"
                :class="{ active: form.type === 'private' }"
                @click="form.type = 'private'"
              >
                <i class="fas fa-lock" /> ส่วนตัว
              </button>
            </div>
          </div>

          <div v-if="form.type === 'private'" class="rmp-field">
            <label>รหัสผ่านห้อง</label>
            <input
              v-model="form.password"
              type="text"
              class="rmp-input"
              placeholder="เว้นว่างไว้ = ไม่เปลี่ยนรหัสผ่านเดิม"
            >
          </div>

          <div class="rmp-field">
            <label>สีไอคอนห้อง</label>
            <div class="rmp-swatches">
              <button
                v-for="(g, i) in gradients"
                :key="i"
                type="button"
                class="rmp-swatch"
                :class="{ active: form.iconGradient === g }"
                :style="{ background: g }"
                @click="form.iconGradient = form.iconGradient === g ? '' : g"
              />
            </div>
          </div>

          <button type="button" class="rmp-delete" :disabled="busy" @click="remove">
            <i class="fas fa-trash" /> ลบห้องนี้ถาวร
          </button>
        </div>

        <footer class="rmp-footer">
          <button class="rmp-btn ghost" type="button" :disabled="busy" @click="$emit('close')">
            ยกเลิก
          </button>
          <button class="rmp-btn primary" type="button" :disabled="busy || !form.name.trim()" @click="save">
            <i v-if="busy" class="fas fa-spinner fa-spin" />
            {{ busy ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'RoomManagePanel',
  props: {
    show: { type: Boolean, default: false },
    room: { type: Object, default: () => ({}) },
    roomId: { type: String, required: true },
    categories: { type: Array, default: () => [] }
  },
  data () {
    return {
      form: { name: '', category: '', description: '', tags: [], type: 'public', password: '', iconGradient: '' },
      tagInput: '',
      busy: false,
      gradients: [
        'linear-gradient(135deg, #FF5A45, #FF3B30)',
        'linear-gradient(135deg, #FFC94D, #FF9F1C)',
        'linear-gradient(135deg, #7C6CF5, #5B4CDB)',
        'linear-gradient(135deg, #37C871, #1E9E56)',
        'linear-gradient(135deg, #4DB8FF, #2E86DE)',
        'linear-gradient(135deg, #9A94A6, #6B6577)'
      ]
    }
  },
  watch: {
    show (open) {
      if (open) { this.hydrate() }
    }
  },
  methods: {
    hydrate () {
      const r = this.room || {}
      this.form = {
        name: r.name || '',
        category: r.category || (this.categories[0] && this.categories[0].key) || '',
        description: r.description || '',
        tags: Array.isArray(r.tags) ? [...r.tags] : [],
        type: r.type === 'private' ? 'private' : 'public',
        password: '',
        iconGradient: r.iconGradient || ''
      }
      this.tagInput = ''
    },
    addTag () {
      const t = this.tagInput.trim().replace(/,+$/, '')
      if (!t || this.form.tags.length >= 5 || this.form.tags.includes(t)) { return }
      this.form.tags.push(t)
      this.tagInput = ''
    },
    async save () {
      this.addTag()
      this.busy = true
      const selectedCat = this.categories.find(c => c.key === this.form.category)
      const payload = {
        name: this.form.name.trim(),
        category: this.form.category,
        categoryName: selectedCat ? selectedCat.name : this.room.categoryName,
        description: this.form.description,
        tags: this.form.tags,
        type: this.form.type,
        iconGradient: this.form.iconGradient
      }
      if (this.form.type === 'private' && this.form.password) {
        payload.password = this.form.password
      }
      try {
        const res = await this.$axios.$patch(
          process.env.API_ROOM_UPDATE.replace(':id', this.roomId),
          payload
        )
        this.$emit('saved', res.result || payload)
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'บันทึกไม่สำเร็จ',
          text: err.response?.data?.message || ''
        })
      } finally {
        this.busy = false
      }
    },
    async remove () {
      const c = await this.$swal({
        title: 'ลบห้องนี้ถาวร?',
        html: `<b>${this.form.name}</b><br>ข้อความทั้งหมดในห้องจะถูกลบด้วย และกู้คืนไม่ได้`,
        icon: 'warning',
        input: 'text',
        inputPlaceholder: 'พิมพ์ "ลบ" เพื่อยืนยัน',
        showCancelButton: true,
        confirmButtonText: 'ลบถาวร',
        confirmButtonColor: '#d33',
        cancelButtonText: 'ยกเลิก',
        inputValidator: (v) => {
          if (String(v).trim() !== 'ลบ') {
            return 'พิมพ์คำว่า "ลบ" ให้ถูกต้อง'
          }
          return undefined
        }
      })
      if (!c.isConfirmed) { return }
      this.busy = true
      try {
        await this.$axios.$delete(process.env.API_ROOM_DELETE.replace(':id', this.roomId))
        this.$emit('deleted')
      } catch (err) {
        this.$swal({
          icon: 'error',
          title: 'ลบไม่สำเร็จ',
          text: err.response?.data?.message || ''
        })
      } finally {
        this.busy = false
      }
    }
  }
}
</script>

<style scoped>
.rmp-overlay {
  position: fixed !important;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(16, 16, 20, 0.62);
  backdrop-filter: blur(2px);
  font-family: 'Kanit', 'Noto Sans Thai', sans-serif;
}

.rmp-panel {
  width: 100%;
  max-width: 460px;
  max-height: min(88vh, 720px);
  display: flex;
  flex-direction: column;
  background: #f6f3ed;
  border: 3px solid #101014;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.rmp-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #ff5c4d 0%, #e8412f 100%);
  border-bottom: 3px solid #101014;
}
.rmp-title { margin: 0; font-weight: 700; font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px; }
.rmp-close {
  flex-shrink: 0;
  width: 34px; height: 34px; border-radius: 50%;
  border: 2px solid #101014; background: rgba(255, 255, 255, 0.18); color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.95rem; line-height: 1;
}
.rmp-close:hover { background: #ff5c4d; }

.rmp-body { flex: 1; min-height: 0; overflow-y: auto; padding: 18px; }

.rmp-field { margin-bottom: 14px; }
.rmp-field > label { display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 6px; color: #101014; }
.rmp-hint { font-weight: 400; font-size: 0.75rem; color: rgba(16, 16, 20, 0.55); }

.rmp-input {
  width: 100%;
  border: 2px solid #101014;
  border-radius: 12px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.9rem;
  background: #fff;
  color: #101014;
}
.rmp-input:focus { outline: none; border-color: #7c6ff5; }
textarea.rmp-input { resize: vertical; }

.rmp-tags { display: flex; flex-wrap: wrap; gap: 6px; border: 2px solid #101014; border-radius: 12px; padding: 8px; background: #fff; }
.rmp-tag {
  display: inline-flex; align-items: center; gap: 5px;
  background: #7c6ff5; color: #fff; border-radius: 999px;
  padding: 3px 6px 3px 10px; font-size: 0.8rem;
}
.rmp-tag button { border: none; background: rgba(0, 0, 0, 0.2); color: #fff; border-radius: 50%; width: 16px; height: 16px; cursor: pointer; font-size: 0.6rem; }
.rmp-tag-input { flex: 1; min-width: 120px; border: none; outline: none; background: transparent; font-family: inherit; font-size: 0.85rem; }

.rmp-type-row { display: flex; gap: 8px; }
.rmp-type {
  flex: 1; border: 2px solid #101014; border-radius: 12px; padding: 10px;
  background: #fff; cursor: pointer; font-family: inherit; font-weight: 600; font-size: 0.85rem;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.rmp-type.active { background: #7c6ff5; color: #fff; }

.rmp-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
.rmp-swatch { width: 34px; height: 34px; border-radius: 10px; border: 2px solid #101014; cursor: pointer; }
.rmp-swatch.active { box-shadow: 0 0 0 3px #101014; }

.rmp-delete {
  width: 100%; margin-top: 6px;
  border: 2px solid #d33; border-radius: 12px;
  background: rgba(221, 51, 51, 0.08); color: #d33;
  padding: 10px; font-family: inherit; font-weight: 700; cursor: pointer;
}
.rmp-delete:disabled { opacity: 0.5; cursor: default; }

.rmp-footer {
  flex-shrink: 0;
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 18px; background: #fff; border-top: 3px solid #101014;
}
.rmp-btn {
  font-family: inherit; font-weight: 700; font-size: 0.88rem;
  border-radius: 999px; padding: 9px 22px; border: 2px solid #101014;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
}
.rmp-btn.ghost { background: #f6f3ed; color: #101014; }
.rmp-btn.primary { background: #ff5c4d; color: #fff; }
.rmp-btn:disabled { opacity: 0.5; cursor: default; }

.rmp-fade-enter-active, .rmp-fade-leave-active { transition: opacity 0.18s ease; }
.rmp-fade-enter, .rmp-fade-leave-to { opacity: 0; }
</style>
