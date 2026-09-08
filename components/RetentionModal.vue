<template>
  <transition name="rt-fade">
    <div v-if="show" class="rt-overlay" @click.self="$emit('close')">
      <div class="rt-panel" role="dialog" aria-modal="true">
        <header class="rt-header">
          <h3 class="rt-title">
            <i class="fas fa-clock-rotate-left" /> เก็บข้อความห้องนี้
          </h3>
          <button class="rt-close" type="button" aria-label="ปิด" @click="$emit('close')">
            <i class="fas fa-times" />
          </button>
        </header>

        <div class="rt-body">
          <p class="rt-current">
            <template v-if="paidUntilText">
              เก็บถึง <b>{{ paidUntilText }}</b> ({{ retentionDays }} วัน)
            </template>
            <template v-else>
              ตอนนี้เก็บข้อความ <b>{{ baseDays }} วัน</b> (ค่าเริ่มต้น)
            </template>
          </p>

          <div class="rt-options">
            <button
              v-for="opt in options"
              :key="opt.days"
              type="button"
              class="rt-option"
              :class="{ active: selected === opt.days }"
              :disabled="busy"
              @click="selected = opt.days"
            >
              <span class="rt-days">{{ opt.days }} วัน</span>
              <span class="rt-cost">
                <CoinIcon :size="13" /> {{ opt.cost }} เหรียญ
              </span>
            </button>
          </div>

          <p class="rt-hint">
            คุณมี <CoinIcon :size="12" /> {{ balance }} เหรียญ · ต่อจากวันหมดอายุเดิม +30 วัน
          </p>
        </div>

        <footer class="rt-footer">
          <button class="rt-btn ghost" type="button" :disabled="busy" @click="$emit('close')">
            ปิด
          </button>
          <button class="rt-btn primary" type="button" :disabled="busy || !selected" @click="extend">
            <i v-if="busy" class="fas fa-spinner fa-spin" />
            {{ busy ? 'กำลังทำรายการ...' : 'ยืนยันต่ออายุ' }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'RetentionModal',
  props: {
    show: { type: Boolean, default: false },
    roomId: { type: String, required: true },
    retentionDays: { type: Number, default: null },
    retentionPaidUntil: { type: [String, Date], default: null }
  },
  data () {
    return {
      baseDays: 30,
      rate: 30,
      balance: 0,
      selected: null,
      busy: false
    }
  },
  computed: {
    options () {
      return [60, 90, 180].map(days => ({
        days,
        cost: Math.max(0, Math.round(this.rate * ((days - this.baseDays) / 30)))
      }))
    },
    paidUntilText () {
      if (!this.retentionPaidUntil) { return '' }
      const d = new Date(this.retentionPaidUntil)
      if (isNaN(d.getTime()) || d <= new Date()) { return '' }
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  },
  watch: {
    show (open) {
      if (open) {
        this.selected = null
        this.loadCosts()
      }
    }
  },
  methods: {
    async loadCosts () {
      try {
        const [pkg, wallet] = await Promise.all([
          this.$axios.$get(process.env.API_COINS_PACKAGES),
          this.$axios.$get(process.env.API_COINS_WALLET)
        ])
        this.rate = pkg.result?.costs?.RETENTION_PER_30D ?? 30
        this.balance = wallet.result?.coins ?? 0
      } catch (e) {}
    },
    async extend () {
      if (!this.selected) { return }
      this.busy = true
      try {
        const res = await this.$axios.$post(
          process.env.API_ROOM_EXTEND_RETENTION.replace(':id', this.roomId),
          { days: this.selected }
        )
        this.$swal({
          icon: 'success',
          title: 'ต่ออายุสำเร็จ',
          text: res.message || `เก็บข้อความห้องนี้ ${this.selected} วัน`,
          timer: 2200,
          showConfirmButton: false
        })
        this.$emit('extended', res.result)
      } catch (err) {
        if (err.response?.status === 402) {
          const c = await this.$swal({
            icon: 'info',
            title: 'เหรียญไม่พอ',
            text: err.response.data?.message || 'ต้องเติมเหรียญก่อน',
            showCancelButton: true,
            confirmButtonText: 'ไปเติมเหรียญ',
            cancelButtonText: 'ปิด'
          })
          if (c.isConfirmed) { this.$router.push('/wallet') }
        } else {
          this.$swal({
            icon: 'error',
            title: 'ไม่สำเร็จ',
            text: err.response?.data?.message || 'ต่ออายุไม่สำเร็จ'
          })
        }
      } finally {
        this.busy = false
      }
    }
  }
}
</script>

<style scoped>
.rt-overlay {
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

.rt-panel {
  width: 100%;
  max-width: 420px;
  background: #f6f3ed;
  border: 3px solid #101014;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.rt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #7c6ff5 0%, #5b4fd6 100%);
  border-bottom: 3px solid #101014;
}

.rt-title { margin: 0; font-weight: 700; font-size: 1.05rem; color: #fff; display: flex; align-items: center; gap: 8px; }

.rt-close {
  width: 34px; height: 34px; border-radius: 50%;
  border: 2px solid #101014; background: rgba(255, 255, 255, 0.18);
  color: #fff; cursor: pointer;
}
.rt-close:hover { background: #ff5c4d; }

.rt-body { padding: 18px; }
.rt-current { margin: 0 0 14px; font-size: 0.9rem; color: #101014; }

.rt-options { display: flex; flex-direction: column; gap: 10px; }
.rt-option {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  border: 2px solid #101014; border-radius: 14px;
  background: #fff; cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.rt-option:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: 3px 3px 0 #101014; }
.rt-option.active { background: linear-gradient(135deg, #7c6ff5, #5b4fd6); color: #fff; box-shadow: 3px 3px 0 #101014; }
.rt-option:disabled { opacity: 0.5; cursor: default; }
.rt-days { font-weight: 700; }
.rt-cost { display: inline-flex; align-items: center; gap: 5px; font-size: 0.85rem; }

.rt-hint { margin: 14px 0 0; font-size: 0.78rem; color: rgba(16, 16, 20, 0.6); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }

.rt-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 18px; background: #fff; border-top: 3px solid #101014;
}
.rt-btn {
  font-family: inherit; font-weight: 700; font-size: 0.88rem;
  border-radius: 999px; padding: 9px 22px; border: 2px solid #101014;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
}
.rt-btn.ghost { background: #f6f3ed; color: #101014; }
.rt-btn.primary { background: #ff5c4d; color: #fff; }
.rt-btn:disabled { opacity: 0.5; cursor: default; }

.rt-fade-enter-active, .rt-fade-leave-active { transition: opacity 0.18s ease; }
.rt-fade-enter, .rt-fade-leave-to { opacity: 0; }
</style>
