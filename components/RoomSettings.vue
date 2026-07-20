<!-- eslint-disable vue/no-mutating-props -->
<template>
  <b-modal
    id="room-settings-modal"
    v-model="show"
    title="ตั้งค่าห้องแชท"
    size="md"
    centered
    hide-footer
    modal-class="settings-modal"
  >
    <div class="settings-content">
      <h6 class="settings-heading">
        <i class="fas fa-palette mr-2" /> ธีมสีแชท
      </h6>
      <div class="theme-selector">
        <div
          v-for="theme in availableThemes"
          :key="theme.id"
          :class="['theme-option', { active: selectedTheme === theme.id }]"
          @click="selectedTheme = theme.id"
        >
          <div class="theme-preview">
            <div class="preview-bubble preview-own" :style="{ background: theme.ownBubble }" />
            <div class="preview-bubble preview-other" :style="{ background: theme.otherBubble }" />
          </div>
          <div class="theme-info">
            <div class="theme-name">
              {{ theme.name }}
            </div>
            <div class="theme-description">
              {{ theme.description }}
            </div>
          </div>
          <i v-if="selectedTheme === theme.id" class="fas fa-check-circle theme-check" />
        </div>
      </div>

      <h6 class="settings-heading mt-4">
        <i class="fas fa-image mr-2" /> พื้นหลังห้องแชท
      </h6>
      <div class="background-input">
        <input
          v-model="selectedBackground"
          type="text"
          class="bg-text-input"
          placeholder="เช่น URL รูป หรือ #hex สีพื้นหลัง"
        >
        <small class="bg-hint">
          รองรับทั้ง URL รูปภาพ และสี เช่น <code>#ffffff</code> หรือ <code>https://...jpg</code>
        </small>
      </div>

      <div class="mt-4 d-flex justify-content-end action-row">
        <button class="btn-ghost" @click="$emit('close')">
          ปิด
        </button>
        <button class="btn-primary" @click="saveSettings">
          บันทึก
        </button>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'RoomSettings',
  props: {
    show: { type: Boolean, default: false },
    value: { type: Object, default: () => ({ theme: 'default', background: '' }) },
    availableThemes: { type: Array, required: true }
  },
  computed: {
    selectedTheme: {
      get () {
        return this.value?.theme || 'default'
      },
      set (val) {
        const newValue = { ...(this.value || {}), theme: val }
        this.$emit('input', newValue)
      }
    },
    selectedBackground: {
      get () {
        return this.value?.background || ''
      },
      set (val) {
        const newValue = { ...(this.value || {}), background: val }
        this.$emit('input', newValue)
      }
    }
  },
  methods: {
    saveSettings () {
      const settingsToSave = {
        theme: this.selectedTheme,
        background: this.selectedBackground
      }
      this.$emit('save', settingsToSave)
      this.$bvToast.toast('บันทึกการตั้งค่าเรียบร้อยแล้ว', {
        variant: 'success',
        solid: true,
        autoHideDelay: 2000
      })
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.settings-content {
  --ink: #101014;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --yellow: #ffc94d;
  --white: #ffffff;
  --line-sm: 2px;
  --shadow-xs: 2px 2px 0 var(--ink);
  --shadow-sm: 4px 4px 0 var(--ink);
  --radius-md: 14px;
  --font-display: 'Space Grotesk', 'Noto Sans Thai', sans-serif;

  padding: 4px;
}

.settings-heading {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--ink);
  display: flex;
  align-items: center;
}

.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-md);
  background: var(--white);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.theme-option:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm);
}

.theme-option.active {
  background: #fff8e8;
  border-color: var(--violet);
  box-shadow: var(--shadow-sm);
}

.theme-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.preview-bubble {
  width: 30px;
  height: 14px;
  border-radius: 7px;
  border: 1.5px solid var(--ink);
}

.preview-own { align-self: flex-end; }

.theme-info { flex: 1; min-width: 0; }

.theme-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--ink);
}

.theme-description {
  font-size: 0.76rem;
  color: rgba(16, 16, 20, 0.55);
}

.theme-check {
  color: var(--violet);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.background-input { margin-top: 4px; }

.bg-text-input {
  width: 100%;
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 0.88rem;
  color: var(--ink);
  box-shadow: var(--shadow-xs);
}

.bg-text-input:focus { outline: none; border-color: var(--violet); }
.bg-text-input::placeholder { color: rgba(16, 16, 20, 0.4); }

.bg-hint {
  display: block;
  margin-top: 6px;
  color: rgba(16, 16, 20, 0.55);
  font-size: 0.76rem;
}

.bg-hint code {
  background: var(--cream);
  border: 1px solid var(--ink);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--ink);
}

.action-row { gap: 10px; }

.btn-ghost,
.btn-primary {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.82rem;
  border-radius: 999px;
  padding: 9px 20px;
  border: var(--line-sm) solid var(--ink);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.btn-ghost {
  background: var(--white);
  color: var(--ink);
}

.btn-ghost:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-xs);
}

.btn-primary {
  background: var(--coral);
  color: var(--white);
  box-shadow: var(--shadow-xs);
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm);
}

.btn-primary:active,
.btn-ghost:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}
</style>

<style>
.settings-modal .modal-content {
  background: #f6f3ed;
  border: 3px solid #101014;
  border-radius: 20px;
  box-shadow: 6px 6px 0 #101014;
  overflow: hidden;
}

.settings-modal .modal-header {
  background: #7c6ff5;
  border-bottom: 3px solid #101014;
  padding: 16px 20px;
}

.settings-modal .modal-title {
  font-family: 'Space Grotesk', 'Noto Sans Thai', sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  font-size: 1rem;
}

.settings-modal .close {
  color: #ffffff;
  opacity: 0.9;
  text-shadow: none;
}

.settings-modal .modal-body {
  padding: 20px;
}

.settings-modal .modal-backdrop {
  background: rgba(16, 16, 20, 0.6);
}
</style>
