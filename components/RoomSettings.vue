<template>
  <transition name="rs-fade">
    <div v-if="show" class="rs-overlay" @click.self="$emit('close')">
      <div class="rs-panel" role="dialog" aria-modal="true">
        <header class="rs-header">
          <h3 class="rs-title">
            <i class="fas fa-palette" /> ธีมสีแชท
          </h3>
          <button class="rs-close" type="button" aria-label="ปิด" @click="$emit('close')">
            <i class="fas fa-times" />
          </button>
        </header>

        <div class="rs-body">
          <p class="rs-hint">
            เลือกโทนสีของหน้าแชท — ตัวอย่างจะเปลี่ยนทันที
          </p>
          <div class="rs-theme-grid">
            <button
              v-for="theme in availableThemes"
              :key="theme.id"
              type="button"
              :class="['rs-theme', { active: selectedTheme === theme.id }]"
              @click="selectedTheme = theme.id"
            >
              <span class="rs-swatch">
                <span class="rs-bubble own" :style="{ background: theme.ownBubble }" />
                <span class="rs-bubble other" :style="{ background: theme.otherBubble }" />
              </span>
              <span class="rs-theme-text">
                <span class="rs-theme-name">{{ theme.name }}</span>
                <span class="rs-theme-desc">{{ theme.description }}</span>
              </span>
              <i class="fas fa-check-circle rs-check" />
            </button>
          </div>
        </div>

        <footer class="rs-footer">
          <button class="rs-btn ghost" type="button" @click="$emit('close')">
            ปิด
          </button>
          <button class="rs-btn primary" type="button" @click="saveSettings">
            <i class="fas fa-check" /> บันทึก
          </button>
        </footer>
      </div>
    </div>
  </transition>
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
        this.$emit('input', { ...(this.value || {}), theme: val })
      }
    },
    selectedBackground () {
      return this.value?.background || ''
    }
  },
  watch: {
    show (open) {
      this.lockScroll(open)
    }
  },
  mounted () {
    this.lockScroll(this.show)
  },
  beforeDestroy () {
    this.lockScroll(false)
  },
  methods: {
    lockScroll (locked) {
      if (typeof document === 'undefined') { return }
      document.body.style.overflow = locked ? 'hidden' : ''
    },
    saveSettings () {
      this.$emit('save', {
        theme: this.selectedTheme,
        background: this.selectedBackground
      })
      if (this.$bvToast) {
        this.$bvToast.toast('บันทึกธีมเรียบร้อยแล้ว', {
          variant: 'success',
          solid: true,
          autoHideDelay: 2000
        })
      }
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.rs-overlay {
  --ink: #101014;
  --cream: #f6f3ed;
  --white: #ffffff;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --violet-deep: #5b4fd6;
  --line: 2px;

  position: fixed !important;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(16, 16, 20, 0.62);
  backdrop-filter: blur(2px);
}

.rs-panel {
  width: 100%;
  max-width: 440px;
  max-height: min(84vh, 660px);
  display: flex;
  flex-direction: column;
  background: var(--cream);
  border: 3px solid var(--ink);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.rs-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  border-bottom: 3px solid var(--ink);
}

.rs-title {
  margin: 0;
  font-family: 'Kanit', 'Noto Sans Thai', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 8px;
}

.rs-close {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: var(--line) solid var(--ink);
  background: rgba(255, 255, 255, 0.18);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.15s ease;
}

.rs-close:hover { background: var(--coral); transform: rotate(90deg); }

.rs-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 18px;
}

.rs-hint {
  margin: 0 0 14px;
  font-size: 0.82rem;
  color: rgba(16, 16, 20, 0.6);
}

.rs-theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.rs-theme {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: var(--line) solid var(--ink);
  border-radius: 14px;
  background: var(--white);
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.rs-theme:hover {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--ink);
}

.rs-theme.active {
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  box-shadow: 3px 3px 0 var(--ink);
}

.rs-theme.active .rs-theme-name,
.rs-theme.active .rs-theme-desc { color: var(--white); }

.rs-swatch {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.rs-bubble {
  width: 26px;
  height: 12px;
  border-radius: 6px;
  border: 1.5px solid var(--ink);
}

.rs-bubble.own { align-self: flex-end; }

.rs-theme-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.rs-theme-name {
  font-family: 'Kanit', 'Noto Sans Thai', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rs-theme-desc {
  font-size: 0.72rem;
  color: rgba(16, 16, 20, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rs-check {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 0.9rem;
  color: var(--white);
  opacity: 0;
  transition: opacity 0.12s ease;
}

.rs-theme.active .rs-check { opacity: 1; }

.rs-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px;
  background: var(--white);
  border-top: 3px solid var(--ink);
}

.rs-btn {
  font-family: 'Kanit', 'Noto Sans Thai', sans-serif;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: 999px;
  padding: 9px 22px;
  border: var(--line) solid var(--ink);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.rs-btn.ghost { background: var(--cream); color: var(--ink); }
.rs-btn.primary { background: var(--coral); color: var(--white); }

.rs-btn:hover { transform: translate(-2px, -2px); box-shadow: 3px 3px 0 var(--ink); }
.rs-btn:active { transform: translate(1px, 1px); box-shadow: none; }

.rs-fade-enter-active,
.rs-fade-leave-active { transition: opacity 0.18s ease; }
.rs-fade-enter,
.rs-fade-leave-to { opacity: 0; }

.rs-fade-enter .rs-panel,
.rs-fade-leave-to .rs-panel { transform: scale(0.95); }
.rs-panel { transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1); }

@media (max-width: 520px) {
  .rs-overlay { padding: 10px; align-items: flex-end; }
  .rs-panel { max-width: 100%; max-height: 88vh; border-radius: 18px; }
  .rs-theme-grid { grid-template-columns: 1fr; gap: 8px; }
  .rs-theme { padding: 10px; }
  .rs-theme-desc { display: none; }
}
</style>
