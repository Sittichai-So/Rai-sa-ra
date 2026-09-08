<template>
  <div class="at-page">
    <header class="at-header">
      <button class="at-back" @click="$router.push('/admin')">
        <i class="fas fa-arrow-left" />
      </button>
      <h1>อนุมัติการเติมเหรียญ</h1>
      <select v-model="status" class="at-filter" @change="load">
        <option value="awaiting_review">
          รอตรวจสอบ
        </option>
        <option value="approved">
          อนุมัติแล้ว
        </option>
        <option value="rejected">
          ปฏิเสธ
        </option>
        <option value="refunded">
          คืนเงินแล้ว
        </option>
        <option value="all">
          ทั้งหมด
        </option>
      </select>
    </header>

    <div class="at-body">
      <p v-if="denied" class="at-warn">
        เฉพาะผู้ดูแลระบบเท่านั้น
      </p>
      <div v-else-if="!list.length" class="at-empty">
        ไม่มีรายการ
      </div>

      <div v-for="t in list" :key="t._id" class="at-card">
        <div class="at-info">
          <div class="at-user">
            <strong>{{ t.userId && (t.userId.displayName || t.userId.username) }}</strong>
            <span>{{ t.userId && t.userId.email }}</span>
          </div>
          <div class="at-amount">
            ฿{{ t.amountTHB }} → <b>{{ t.coins }} เหรียญ</b>
          </div>
          <div class="at-meta">
            <span class="at-status" :class="t.status">{{ statuslabel(t.status) }}</span>
            <span>{{ fmt(t.createdAt) }}</span>
            <span v-if="t.verifyMethod">· {{ t.verifyMethod }}</span>
          </div>
          <div v-if="t.rejectReason" class="at-reason">
            {{ t.rejectReason }}
          </div>
          <div v-if="t.refundReason" class="at-reason">
            คืนเงิน: {{ t.refundReason }}
            <span v-if="t.refundShortfall > 0">(ขาด {{ t.refundShortfall }} เหรียญ)</span>
          </div>
        </div>

        <a v-if="t.slipUrl" :href="fileBase + t.slipUrl" target="_blank" class="at-slip">
          <img :src="fileBase + t.slipUrl" alt="สลิป">
        </a>

        <div v-if="t.status === 'awaiting_review'" class="at-actions">
          <button class="at-approve" :disabled="busy === t._id" @click="approve(t)">
            <i class="fas fa-check" /> อนุมัติ
          </button>
          <button class="at-reject" :disabled="busy === t._id" @click="reject(t)">
            <i class="fas fa-times" /> ปฏิเสธ
          </button>
        </div>
        <div v-else-if="t.status === 'approved'" class="at-actions">
          <button class="at-reject" :disabled="busy === t._id" @click="doRefund(t)">
            <i class="fas fa-rotate-left" /> คืนเงิน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: ['middlewareAuth', 'admin'],
  data () {
    return {
      list: [],
      status: 'awaiting_review',
      busy: null,
      denied: false,
      fileBase: process.env.API_FILE_BASE || ''
    }
  },
  head () {
    return {
      title: 'อนุมัติเติมเหรียญ',
      link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700&display=swap' }]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    fmt (d) {
      return d ? new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : ''
    },
    statuslabel (s) {
      return { awaiting_review: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ', pending: 'รอสลิป', expired: 'หมดอายุ', refunded: 'คืนเงินแล้ว' }[s] || s
    },
    async load () {
      try {
        const url = process.env.API_COINS_ADMIN_TOPUPS + '?status=' + this.status
        const r = await this.$axios.$get(url)
        this.list = r.result || []
        this.denied = false
      } catch (e) {
        if (e.response?.status === 403) { this.denied = true }
      }
    },
    async approve (t) {
      const c = await this.$swal({ title: 'อนุมัติ?', text: `เติม ${t.coins} เหรียญให้ผู้ใช้`, icon: 'question', showCancelButton: true, confirmButtonText: 'อนุมัติ', cancelButtonText: 'ยกเลิก' })
      if (!c.isConfirmed) { return }
      this.busy = t._id
      try {
        await this.$axios.$post(process.env.API_COINS_ADMIN_APPROVE.replace(':id', t._id))
        this.$swal({ icon: 'success', title: 'อนุมัติแล้ว', timer: 1400, showConfirmButton: false })
        this.load()
      } catch (e) {
        this.$swal({ icon: 'error', title: 'ไม่สำเร็จ', text: e.response?.data?.message })
      } finally {
        this.busy = null
      }
    },
    async reject (t) {
      const { value: reason } = await this.$swal({ title: 'ปฏิเสธคำขอ', input: 'text', inputPlaceholder: 'เหตุผล (ถ้ามี)', showCancelButton: true, confirmButtonText: 'ปฏิเสธ', cancelButtonText: 'ยกเลิก' })
      if (reason === undefined) { return }
      this.busy = t._id
      try {
        await this.$axios.$post(process.env.API_COINS_ADMIN_REJECT.replace(':id', t._id), { reason })
        this.load()
      } catch (e) {
        this.$swal({ icon: 'error', title: 'ไม่สำเร็จ', text: e.response?.data?.message })
      } finally {
        this.busy = null
      }
    },
    async doRefund (t) {
      const { value: reason, isConfirmed } = await this.$swal({
        title: 'คืนเงินคำขอนี้?',
        html: `จะหักคืน <b>${t.coins} เหรียญ</b> จากผู้ใช้<br><small>ถ้าผู้ใช้ใช้เหรียญไปบางส่วนแล้ว จะหักได้เท่าที่เหลือ</small>`,
        input: 'text',
        inputPlaceholder: 'เหตุผลการคืนเงิน',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'คืนเงิน',
        cancelButtonText: 'ยกเลิก'
      })
      if (!isConfirmed) { return }
      this.busy = t._id
      try {
        const r = await this.$axios.$post(process.env.API_COINS_ADMIN_REFUND.replace(':id', t._id), { reason })
        this.$swal({ icon: 'success', title: 'คืนเงินแล้ว', text: r.message, timer: 2200, showConfirmButton: false })
        this.load()
      } catch (e) {
        this.$swal({ icon: 'error', title: 'ไม่สำเร็จ', text: e.response?.data?.message })
      } finally {
        this.busy = null
      }
    }
  }
}
</script>

<style scoped>
.at-page { min-height: 100vh; background: #121218; color: #f6f3ed; font-family: 'Kanit', sans-serif; }
.at-header {
  display: flex; align-items: center; gap: 12px;
  padding: calc(16px + env(safe-area-inset-top)) 18px 16px; background: linear-gradient(135deg, #ff5c4d, #7c6ff5);
  position: sticky; top: 0; z-index: 5;
}
.at-header h1 { flex: 1; margin: 0; font-size: 18px; font-weight: 700; }
.at-back { border: none; background: rgba(255, 255, 255, 0.2); color: #fff; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; }
.at-filter { border: none; border-radius: 8px; padding: 6px 10px; font-family: inherit; }

.at-body { max-width: 640px; margin: 0 auto; padding: 18px 14px; }
.at-warn, .at-empty { text-align: center; color: rgba(246, 243, 237, 0.6); padding: 40px 0; }
.at-warn { color: #ff8f84; }

.at-card {
  display: flex; gap: 14px; flex-wrap: wrap;
  background: #1c1c26; border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px; padding: 14px; margin-bottom: 12px;
}
.at-info { flex: 1; min-width: 180px; }
.at-user { display: flex; flex-direction: column; }
.at-user strong { font-size: 15px; }
.at-user span { font-size: 12px; color: rgba(246, 243, 237, 0.55); }
.at-amount { margin: 8px 0 6px; font-size: 15px; }
.at-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: rgba(246, 243, 237, 0.55); }
.at-status { font-weight: 700; }
.at-status.awaiting_review { color: #ffc94d; }
.at-status.approved { color: #4dd07a; }
.at-status.rejected { color: #ff8f84; }
.at-reason { font-size: 12px; color: #ff8f84; margin-top: 6px; }

.at-slip img { width: 120px; height: 160px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }

.at-actions { display: flex; gap: 8px; align-items: flex-start; width: 100%; }
.at-approve, .at-reject {
  flex: 1; border: none; border-radius: 10px; padding: 10px; font-weight: 700;
  font-family: inherit; cursor: pointer;
}
.at-approve { background: #4dd07a; color: #0d2417; }
.at-reject { background: rgba(255, 143, 132, 0.18); color: #ff8f84; }
.at-approve:disabled, .at-reject:disabled { opacity: 0.5; }
</style>
