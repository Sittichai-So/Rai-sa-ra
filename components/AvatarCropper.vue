<template>
  <transition name="ac-fade">
    <div v-if="show" class="ac-overlay" @click.self="onCancel">
      <div class="ac-panel" role="dialog" aria-modal="true">
        <header class="ac-header">
          <h3 class="ac-title">
            <i class="fas fa-crop-simple" /> ปรับตำแหน่งรูปโปรไฟล์
          </h3>
          <button class="ac-close" type="button" aria-label="ปิด" @click="onCancel">
            <i class="fas fa-times" />
          </button>
        </header>

        <div class="ac-body">
          <div
            ref="stage"
            class="ac-stage"
            @pointerdown="startDrag"
            @wheel.prevent="onWheel"
          >
            <canvas ref="canvas" class="ac-canvas" />
            <div class="ac-guide" />
          </div>

          <div class="ac-zoom-row">
            <i class="fas fa-image ac-zoom-icon-sm" />
            <input
              v-model.number="zoom"
              type="range"
              min="1"
              max="3"
              step="0.01"
              class="ac-zoom"
            >
            <i class="fas fa-image ac-zoom-icon-lg" />
          </div>
          <p class="ac-hint">
            ลากรูปเพื่อจัดตำแหน่ง — เลื่อนแถบหรือสกรอลล์เพื่อซูม
          </p>
        </div>

        <footer class="ac-footer">
          <button class="ac-btn ghost" type="button" @click="onCancel">
            ยกเลิก
          </button>
          <button class="ac-btn primary" type="button" :disabled="!ready" @click="confirm">
            <i class="fas fa-check" /> ใช้รูปนี้
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
const OUTPUT_SIZE = 512

export default {
  name: 'AvatarCropper',
  props: {
    show: { type: Boolean, default: false },
    file: { type: [File, Blob], default: null }
  },
  data () {
    return {
      ready: false,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      dpr: (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
      img: null,
      baseScale: 1,
      stageSize: 280
    }
  },
  watch: {
    show (open) {
      if (open && this.file) { this.loadImage(this.file) }
      if (!open) { this.reset() }
    },
    zoom () {
      this.clampOffset()
      this.draw()
    }
  },
  beforeDestroy () {
    this.teardownDrag()
    this.revokeUrl()
  },
  methods: {
    reset () {
      this.ready = false
      this.zoom = 1
      this.offsetX = 0
      this.offsetY = 0
      this.img = null
      this.revokeUrl()
    },
    revokeUrl () {
      if (this._url) { URL.revokeObjectURL(this._url); this._url = null }
    },
    loadImage (file) {
      this.reset()
      this._url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        this.img = img
        this.$nextTick(() => {
          this.measureStage()
          this.baseScale = Math.max(this.stageSize / img.width, this.stageSize / img.height)
          this.ready = true
          this.setupCanvas()
          this.draw()
        })
      }
      img.onerror = () => {
        this.$emit('error', 'ไฟล์รูปภาพเสียหายหรือไม่รองรับ')
        this.onCancel()
      }
      img.src = this._url
    },
    measureStage () {
      const stage = this.$refs.stage
      const w = stage && stage.clientWidth
      this.stageSize = w && w > 0 ? Math.round(w) : 280
    },
    setupCanvas () {
      const canvas = this.$refs.canvas
      if (!canvas) { return }
      canvas.width = this.stageSize * this.dpr
      canvas.height = this.stageSize * this.dpr
      canvas.style.width = this.stageSize + 'px'
      canvas.style.height = this.stageSize + 'px'
    },
    drawParams (size) {
      const scale = this.baseScale * this.zoom * (size / this.stageSize)
      const drawW = this.img.width * scale
      const drawH = this.img.height * scale
      const cx = size / 2 + this.offsetX * (size / this.stageSize)
      const cy = size / 2 + this.offsetY * (size / this.stageSize)
      return { drawW, drawH, x: cx - drawW / 2, y: cy - drawH / 2 }
    },
    draw () {
      const canvas = this.$refs.canvas
      if (!canvas || !this.img) { return }
      const ctx = canvas.getContext('2d')
      const size = this.stageSize * this.dpr
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = '#1c1c26'
      ctx.fillRect(0, 0, size, size)
      const { drawW, drawH, x, y } = this.drawParams(size)
      ctx.drawImage(this.img, x, y, drawW, drawH)
    },
    clampOffset () {
      const { drawW, drawH } = this.drawParams(this.stageSize)
      const maxX = Math.max(0, (drawW - this.stageSize) / 2)
      const maxY = Math.max(0, (drawH - this.stageSize) / 2)
      this.offsetX = Math.max(-maxX, Math.min(maxX, this.offsetX))
      this.offsetY = Math.max(-maxY, Math.min(maxY, this.offsetY))
    },
    startDrag (e) {
      if (!this.ready) { return }
      const stage = this.$refs.stage
      stage.setPointerCapture && e.pointerId != null && stage.setPointerCapture(e.pointerId)
      this._dragStart = { x: e.clientX, y: e.clientY, offX: this.offsetX, offY: this.offsetY }
      window.addEventListener('pointermove', this.onDrag)
      window.addEventListener('pointerup', this.endDrag)
    },
    onDrag (e) {
      if (!this._dragStart) { return }
      this.offsetX = this._dragStart.offX + (e.clientX - this._dragStart.x)
      this.offsetY = this._dragStart.offY + (e.clientY - this._dragStart.y)
      this.clampOffset()
      this.draw()
    },
    endDrag () {
      this._dragStart = null
      this.teardownDrag()
    },
    teardownDrag () {
      window.removeEventListener('pointermove', this.onDrag)
      window.removeEventListener('pointerup', this.endDrag)
    },
    onWheel (e) {
      if (!this.ready) { return }
      const next = this.zoom - e.deltaY * 0.001
      this.zoom = Math.max(1, Math.min(3, next))
    },
    confirm () {
      if (!this.ready) { return }
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')
      const { drawW, drawH, x, y } = this.drawParams(OUTPUT_SIZE)
      ctx.drawImage(this.img, x, y, drawW, drawH)
      canvas.toBlob((blob) => {
        if (!blob) {
          this.$emit('error', 'สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้ง')
          return
        }
        this.$emit('confirm', blob)
      }, 'image/jpeg', 0.92)
    },
    onCancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.ac-overlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(16, 16, 20, 0.68);
  backdrop-filter: blur(2px);
  font-family: 'Kanit', 'Noto Sans Thai', sans-serif;
}

.ac-panel {
  width: 100%;
  max-width: 380px;
  background: #f6f3ed;
  border: 3px solid #101014;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.ac-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #7c6ff5 0%, #5b4fd6 100%);
  border-bottom: 3px solid #101014;
}
.ac-title { margin: 0; font-weight: 700; font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 8px; }
.ac-close {
  flex-shrink: 0;
  width: 34px; height: 34px; border-radius: 50%;
  border: 2px solid #101014; background: rgba(255, 255, 255, 0.18); color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.95rem; line-height: 1;
}
.ac-close:hover { background: #ff5c4d; }

.ac-body { padding: 20px; display: flex; flex-direction: column; align-items: center; }

.ac-stage {
  position: relative;
  width: min(280px, 100%);
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #101014;
  touch-action: none;
  cursor: grab;
}
.ac-stage:active { cursor: grabbing; }

.ac-canvas { display: block; }

.ac-guide {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(16, 16, 20, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.85);
}

.ac-zoom-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 18px;
  color: #101014;
}
.ac-zoom-icon-sm { font-size: 11px; opacity: 0.5; }
.ac-zoom-icon-lg { font-size: 18px; opacity: 0.7; }
.ac-zoom { flex: 1; min-width: 0; accent-color: #7c6ff5; }

.ac-hint { margin: 10px 0 0; font-size: 0.78rem; color: rgba(16, 16, 20, 0.55); text-align: center; }

.ac-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 18px; background: #fff; border-top: 3px solid #101014;
}
.ac-btn {
  font-family: inherit; font-weight: 700; font-size: 0.88rem;
  border-radius: 999px; padding: 9px 22px; border: 2px solid #101014;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
}
.ac-btn.ghost { background: #f6f3ed; color: #101014; }
.ac-btn.primary { background: #7c6ff5; color: #fff; }
.ac-btn:disabled { opacity: 0.5; cursor: default; }

.ac-fade-enter-active, .ac-fade-leave-active { transition: opacity 0.18s ease; }
.ac-fade-enter, .ac-fade-leave-to { opacity: 0; }

@media (max-width: 360px) {
  .ac-body { padding: 16px 14px; }
  .ac-footer { padding: 12px 14px; }
}
</style>
