<template>
  <div class="wallet-page">
    <header class="w-header">
      <button class="w-back" @click="$router.push('/chat/chat')">
        <i class="fas fa-arrow-left" />
      </button>
      <h1>กระเป๋าเหรียญ</h1>
      <div class="w-balance">
        <CoinIcon :size="20" />
        <span>{{ coins }}</span>
      </div>
    </header>

    <div class="w-body">
      <section v-if="stage === 'packages'" class="w-hero">
        <CoinIcon :size="64" large />
        <div class="w-hero-num">
          {{ coins }}
        </div>
        <div class="w-hero-label">
          เหรียญที่มี
        </div>
      </section>

      <section v-if="stage === 'packages'" class="w-section">
        <h2><i class="fas fa-bolt" /> เติมแพ็กเกจ</h2>
        <p v-if="!promptpayReady" class="w-warn">
          <i class="fas fa-triangle-exclamation" /> ระบบยังไม่ได้ตั้งค่าบัญชีรับเงิน — ติดต่อผู้ดูแล
        </p>
        <div class="pkg-grid">
          <button
            v-for="p in packages"
            :key="p.id"
            class="pkg"
            :disabled="!promptpayReady || busy"
            @click="startTopup(p)"
          >
            <CoinIcon :size="34" large />
            <span class="pkg-coins">{{ p.coins }}</span>
            <span class="pkg-price">฿{{ p.thb }}</span>
            <span v-if="bonus(p) > 0" class="pkg-bonus">+{{ bonus(p) }} โบนัส</span>
          </button>
        </div>
      </section>

      <section v-else-if="stage === 'pay'" class="w-section w-pay">
        <h2>สแกนจ่าย {{ topup.amountTHB }} บาท</h2>
        <img :src="topup.qrDataUrl" alt="PromptPay QR" class="qr">
        <p class="pay-name">
          {{ topup.promptpayName }}
        </p>
        <p class="pay-hint">
          โอนตามยอดให้ตรงเป๊ะ ({{ topup.amountTHB }} บาท) แล้วอัปโหลดสลิป<br>
          จะได้รับ <b><CoinIcon :size="15" /> {{ topup.coins }} เหรียญ</b>
        </p>

        <input ref="slipInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onSlip">
        <button class="btn-primary" :disabled="busy" @click="$refs.slipInput.click()">
          <i :class="busy ? 'fas fa-spinner fa-spin' : 'fas fa-upload'" />
          {{ busy ? 'กำลังตรวจสอบ...' : 'อัปโหลดสลิป' }}
        </button>
        <button class="btn-ghost" :disabled="busy" @click="cancelTopup">
          ยกเลิก
        </button>
      </section>

      <section v-else-if="stage === 'result'" class="w-section w-result">
        <i :class="result.icon" class="result-icon" />
        <h2>{{ result.title }}</h2>
        <p>{{ result.text }}</p>
        <button class="btn-primary" @click="reset">
          กลับกระเป๋า
        </button>
      </section>

      <section v-if="stage === 'packages' && myTopups.length" class="w-section">
        <h2><i class="fas fa-hourglass-half" /> คำขอเติมเหรียญ</h2>
        <input ref="listSlip" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onListSlip">
        <ul class="topup-list">
          <li v-for="t in myTopups" :key="t._id" class="topup-item">
            <div class="topup-row">
              <span class="topup-amount">฿{{ t.amountTHB }} → <b>{{ t.coins }}</b> เหรียญ</span>
              <span class="topup-status" :class="t.status">{{ topupStatusLabel(t.status) }}</span>
            </div>
            <div class="topup-row topup-sub">
              <span>{{ fmtTime(t.createdAt) }}</span>
              <button
                v-if="t.status === 'pending'"
                class="topup-btn"
                :disabled="busy"
                @click="pickListSlip(t)"
              >
                <i class="fas fa-upload" /> แนบสลิป
              </button>
            </div>
            <p v-if="t.status === 'rejected' && t.rejectReason" class="topup-reason">
              {{ t.rejectReason }}
            </p>
          </li>
        </ul>
      </section>

      <section v-if="stage === 'packages'" class="w-section">
        <h2><i class="fas fa-clock-rotate-left" /> ประวัติ</h2>
        <div v-if="!history.length" class="w-empty">
          ยังไม่มีรายการ
        </div>
        <ul v-else class="hist">
          <li v-for="(h, i) in history" :key="i" :class="{ minus: h.amount < 0 }">
            <span class="hist-reason">{{ reasonlabel(h.reason) }}</span>
            <span class="hist-amount">{{ h.amount > 0 ? '+' : '' }}{{ h.amount }}</span>
            <span class="hist-bal">คงเหลือ {{ h.balanceAfter }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'middlewareAuth',
  data () {
    return {
      coins: 0,
      packages: [],
      history: [],
      topups: [],
      promptpayReady: false,
      costs: {},
      stage: 'packages',
      topup: null,
      busy: false,
      result: {},
      slipTarget: null,
      pollTimer: null
    }
  },
  head () {
    return {
      title: 'กระเป๋าเหรียญ - RAI-SA-RA',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800&display=swap' }
      ]
    }
  },
  computed: {
    myTopups () {
      return this.topups.filter(t => ['pending', 'awaiting_review', 'rejected'].includes(t.status)).slice(0, 5)
    },
    hasPending () {
      return this.topups.some(t => ['pending', 'awaiting_review'].includes(t.status))
    }
  },
  async mounted () {
    await Promise.all([this.loadWallet(), this.loadPackages()])
  },
  beforeDestroy () {
    this.stopPoll()
  },
  methods: {
    async loadWallet () {
      try {
        const r = await this.$axios.$get(process.env.API_COINS_WALLET)
        this.coins = r.result.coins
        this.history = r.result.history || []
        this.topups = r.result.topups || []
        if (this.hasPending) {
          this.startPoll()
        } else {
          this.stopPoll()
        }
      } catch (e) {}
    },
    startPoll () {
      if (this.pollTimer) { return }
      this.pollTimer = setInterval(() => this.loadWallet(), 20000)
    },
    stopPoll () {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    topupStatusLabel (s) {
      return {
        pending: 'ยังไม่ได้แนบสลิป',
        awaiting_review: 'รอแอดมินตรวจสอบ',
        approved: 'อนุมัติแล้ว',
        rejected: 'ถูกปฏิเสธ',
        expired: 'หมดอายุ',
        refunded: 'คืนเงินแล้ว'
      }[s] || s
    },
    fmtTime (d) {
      return d ? new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : ''
    },
    pickListSlip (t) {
      this.slipTarget = t
      this.$refs.listSlip.click()
    },
    async onListSlip (e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''
      const t = this.slipTarget
      if (!file || !t) { return }
      if (file.size > 3 * 1024 * 1024) {
        this.$swal({ icon: 'error', title: 'ไฟล์ใหญ่เกินไป', text: 'สลิปต้องไม่เกิน 3MB' })
        return
      }
      this.busy = true
      try {
        const fd = new FormData()
        fd.append('file', file)
        const url = process.env.API_COINS_TOPUP_SLIP.replace(':id', t._id)
        const r = await this.$axios.$post(url, fd)
        const res = r.result || {}
        if (res.status === 'approved') {
          this.$swal({ icon: 'success', title: 'เติมเหรียญสำเร็จ', text: `ได้รับ ${res.coins} เหรียญ`, timer: 2200, showConfirmButton: false })
        } else {
          this.$swal({ icon: 'success', title: 'ส่งสลิปแล้ว', text: res.message || 'รอแอดมินตรวจสอบ', timer: 2400, showConfirmButton: false })
        }
        this.loadWallet()
      } catch (err) {
        this.$swal({ icon: 'error', title: 'ตรวจสลิปไม่ผ่าน', text: err.response?.data?.message || 'ลองใหม่' })
      } finally {
        this.busy = false
        this.slipTarget = null
      }
    },
    async loadPackages () {
      try {
        const r = await this.$axios.$get(process.env.API_COINS_PACKAGES)
        this.packages = r.result.packages
        this.promptpayReady = r.result.promptpayReady
        this.costs = r.result.costs
      } catch (e) {}
    },
    bonus (p) {
      const base = this.packages[0]
      if (!base) { return 0 }
      const rate = base.coins / base.thb
      return Math.max(0, Math.round(p.coins - p.thb * rate))
    },
    reasonlabel (r) {
      return {
        topup_slipok: 'เติมเหรียญ (สลิป)',
        topup_manual: 'เติมเหรียญ (แอดมิน)',
        private_room: 'สร้างห้องส่วนตัว',
        retention_extend: 'ต่ออายุเก็บข้อความ',
        adjust: 'ปรับยอดโดยแอดมิน',
        refund: 'คืนเหรียญ',
        refund_topup: 'คืนเงินการเติมเหรียญ'
      }[r] || r
    },
    async startTopup (pkg) {
      this.busy = true
      try {
        const r = await this.$axios.$post(process.env.API_COINS_TOPUP, { packageId: pkg.id })
        this.topup = r.result
        this.stage = 'pay'
      } catch (e) {
        this.$swal({ icon: 'error', title: 'เริ่มเติมเหรียญไม่สำเร็จ', text: e.response?.data?.message || 'ลองใหม่' })
      } finally {
        this.busy = false
      }
    },
    async onSlip (e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''
      if (!file) { return }
      if (file.size > 3 * 1024 * 1024) {
        this.$swal({ icon: 'error', title: 'ไฟล์ใหญ่เกินไป', text: 'สลิปต้องไม่เกิน 3MB' })
        return
      }
      this.busy = true
      try {
        const fd = new FormData()
        fd.append('file', file)
        const url = process.env.API_COINS_TOPUP_SLIP.replace(':id', this.topup.requestId)
        const r = await this.$axios.$post(url, fd)
        const res = r.result || {}
        if (res.status === 'approved') {
          this.coins = res.balance
          this.result = { icon: 'fas fa-circle-check', title: 'เติมเหรียญสำเร็จ', text: `ได้รับ ${res.coins} เหรียญ` }
        } else {
          this.result = { icon: 'fas fa-hourglass-half', title: 'ส่งสลิปแล้ว', text: res.message || 'รอแอดมินตรวจสอบ เหรียญจะเข้าเมื่ออนุมัติ' }
        }
        this.stage = 'result'
        this.loadWallet()
      } catch (e) {
        this.$swal({ icon: 'error', title: 'ตรวจสลิปไม่ผ่าน', text: e.response?.data?.message || 'ลองใหม่' })
      } finally {
        this.busy = false
      }
    },
    cancelTopup () {
      this.topup = null
      this.stage = 'packages'
    },
    reset () {
      this.topup = null
      this.result = {}
      this.stage = 'packages'
      this.loadWallet()
    }
  }
}
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background: #121218;
  color: #f6f3ed;
  font-family: 'Kanit', sans-serif;
  padding-bottom: 40px;
}

.w-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #ff5c4d, #7c6ff5);
  position: sticky;
  top: 0;
  z-index: 5;
}
.w-header h1 { flex: 1; margin: 0; font-size: 20px; font-weight: 800; }
.w-back {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}
.w-balance {
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(0, 0, 0, 0.25);
  padding: 7px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 17px;
}
.w-body { max-width: 560px; margin: 0 auto; padding: 20px 16px; }

.w-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 0 26px;
}
.w-hero-num { font-size: 40px; font-weight: 800; line-height: 1.1; margin-top: 6px; }
.w-hero-label { font-size: 13px; color: rgba(246, 243, 237, 0.55); }

.w-section { margin-bottom: 26px; }
.w-section h2 { font-size: 16px; font-weight: 700; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
.w-section h2 > .fas { color: #ffc94d; font-size: 13px; }

.w-warn {
  background: rgba(255, 201, 77, 0.14);
  color: #ffc94d;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
}

.pkg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pkg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 14px 16px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: #1c1c26;
  color: #f6f3ed;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.pkg:hover:not(:disabled) { border-color: #ffc94d; transform: translateY(-2px); }
.pkg:disabled { opacity: 0.5; cursor: not-allowed; }
.pkg-coins { font-size: 22px; font-weight: 800; margin-top: 4px; }
.pkg-price { font-size: 14px; color: rgba(246, 243, 237, 0.7); }
.pkg-bonus {
  font-size: 11px;
  font-weight: 700;
  color: #4dd07a;
  background: rgba(77, 208, 122, 0.14);
  padding: 2px 8px;
  border-radius: 999px;
  margin-top: 2px;
}

.w-pay { text-align: center; }
.qr {
  width: 240px;
  height: 240px;
  border-radius: 16px;
  background: #fff;
  padding: 10px;
  margin: 6px 0;
}
.pay-name { font-weight: 700; margin: 0 0 4px; }
.pay-hint { font-size: 14px; line-height: 1.7; color: rgba(246, 243, 237, 0.75); margin-bottom: 18px; }

.w-result { text-align: center; padding: 30px 0; }
.result-icon { font-size: 54px; margin-bottom: 14px; color: #4dd07a; }
.w-result h2 { margin-bottom: 6px; }
.w-result p { color: rgba(246, 243, 237, 0.75); margin-bottom: 20px; }

.btn-primary, .btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  margin: 4px;
}
.btn-primary { background: linear-gradient(135deg, #ff5c4d, #7c6ff5); color: #fff; }
.btn-primary:disabled { opacity: 0.6; cursor: default; }
.btn-ghost { background: rgba(255, 255, 255, 0.08); color: #f6f3ed; }

.w-empty { color: rgba(246, 243, 237, 0.5); font-size: 14px; }

.topup-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.topup-item {
  background: #1c1c26;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
}
.topup-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.topup-amount { font-size: 14px; }
.topup-sub { margin-top: 6px; font-size: 12px; color: rgba(246, 243, 237, 0.5); }
.topup-status { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.topup-status.pending { background: rgba(255, 201, 77, 0.16); color: #ffc94d; }
.topup-status.awaiting_review { background: rgba(124, 111, 245, 0.18); color: #a99bff; }
.topup-status.rejected { background: rgba(255, 143, 132, 0.18); color: #ff8f84; }
.topup-btn {
  border: none; border-radius: 8px; padding: 6px 12px;
  background: linear-gradient(135deg, #ff5c4d, #7c6ff5); color: #fff;
  font-family: inherit; font-weight: 700; font-size: 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.topup-btn:disabled { opacity: 0.6; cursor: default; }
.topup-reason { margin: 8px 0 0; font-size: 12px; color: #ff8f84; }

.hist { list-style: none; padding: 0; margin: 0; }
.hist li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 11px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
}
.hist-amount { font-weight: 800; color: #4dd07a; }
.hist li.minus .hist-amount { color: #ff8f84; }
.hist-bal { font-size: 12px; color: rgba(246, 243, 237, 0.5); }

@media (max-width: 420px) {
  .pkg-grid { grid-template-columns: 1fr; }
}
</style>
