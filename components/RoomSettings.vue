<!-- eslint-disable vue/no-mutating-props -->
<template>
  <b-modal
    id="room-settings-modal"
    v-model="show"
    title="ตั้งค่าห้องแชท"
    size="md"
    centered
    hide-footer
  >
    <div class="settings-content">
      <h6 class="mb-3">
        <i class="fas fa-palette mr-2" /> ธีมสีแชท
      </h6>
      <div class="theme-selector">
        <div
          v-for="theme in availableThemes"
          :key="theme.id"
          :class="['theme-option', { active: localSettings.theme === theme.id }]"
          @click="localSettings.theme = theme.id"
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
          <i v-if="localSettings.theme === theme.id" class="fas fa-check-circle theme-check" />
        </div>
      </div>

      <h6 class="mt-4 mb-3">
        <i class="fas fa-image mr-2" /> พื้นหลังห้องแชท
      </h6>
      <div class="background-input">
        <input
          v-model="localSettings.background"
          type="text"
          class="form-control"
          placeholder="เช่น URL รูป หรือ #hex สีพื้นหลัง"
        >
        <small class="text-muted">
          รองรับทั้ง URL รูปภาพ และสี เช่น <code>#ffffff</code> หรือ <code>https://...jpg</code>
        </small>
      </div>

      <div class="mt-4 d-flex justify-content-end gap-2">
        <b-button variant="secondary" @click="$emit('close')">
          ปิด
        </b-button>
        <b-button variant="primary" @click="saveSettings">
          บันทึก
        </b-button>
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
  data () {
    return {
      localSettings: { ...this.value }
    }
  },
  watch: {
    value (val) {
      this.localSettings = { ...val }
    }
  },
  methods: {
    saveSettings () {
      this.$emit('input', this.localSettings)
      this.$emit('save', this.localSettings)
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
  padding: 1rem 0;
}
.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}
.theme-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  background: white;
  transition: 0.2s;
}
.theme-option:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}
.theme-option.active {
  border-color: #007bff;
  background: #f0f8ff;
}
.theme-preview {
  display: flex;
  gap: 8px;
}
.preview-bubble {
  width: 40px;
  height: 32px;
  border-radius: 16px;
}
.preview-own {
  border-bottom-right-radius: 4px;
}
.preview-other {
  border-bottom-left-radius: 4px;
}
.theme-info {
  flex: 1;
}
.theme-name {
  font-weight: 600;
}
.theme-description {
  font-size: 13px;
  color: #65676b;
}
.theme-check {
  color: #007bff;
  font-size: 20px;
}
.background-input input {
  width: 100%;
}
</style>
