<template>
  <div class="party-bar">
    <template v-if="isFriendRoom">
      <span class="party-info"><i class="fas fa-user-friends" /> อยู่ในห้องเพื่อน (โค้ด {{ code }})</span>
      <button type="button" class="party-btn" @click="goHome">
        <i class="fas fa-house" /> <span>กลับห้องของฉัน</span>
      </button>
    </template>
    <template v-else>
      <span class="party-info"><i class="fas fa-key" /> โค้ดห้องของคุณ: <strong>{{ code }}</strong></span>
      <button type="button" class="party-btn" @click="copyInvite">
        <i class="fas fa-link" /> <span>{{ copied ? 'คัดลอกแล้ว!' : 'ชวนเพื่อนเข้าห้อง' }}</span>
      </button>
    </template>
    <form class="join-form" @submit.prevent="joinCode">
      <input v-model="joinInput" type="text" maxlength="12" placeholder="ใส่โค้ดเพื่อน..." class="join-input">
      <button type="submit" class="party-btn" :disabled="!joinInput.trim()">
        <i class="fas fa-right-to-bracket" />
      </button>
    </form>
  </div>
</template>

<script>
import { myPartyCode, resolvePartyCode } from '~/utils/rpgParty'

export default {
  name: 'PartyCodeBar',
  props: {
    basePath: {
      type: String,
      required: true
    }
  },
  data () {
    let user = null
    try { user = JSON.parse(localStorage.getItem('userData')) } catch (e) {}
    return { user, joinInput: '', copied: false }
  },
  computed: {
    code () {
      return resolvePartyCode(this.$route, this.user)
    },
    isFriendRoom () {
      const q = this.$route.query && this.$route.query.party
      return !!q && q !== myPartyCode(this.user)
    }
  },
  methods: {
    copyInvite () {
      const url = window.location.origin + this.basePath + '?party=' + this.code
      if (!navigator.clipboard) { return }
      navigator.clipboard.writeText(url).then(() => {
        this.copied = true
        setTimeout(() => { this.copied = false }, 2000)
      }).catch(() => {})
    },
    goHome () {
      this.$router.push(this.basePath)
    },
    joinCode () {
      const code = this.joinInput.trim().toUpperCase()
      if (!code) { return }
      this.joinInput = ''
      this.$router.push({ path: this.basePath, query: { party: code } })
    }
  }
}
</script>

<style scoped>
.party-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: rgba(237, 230, 214, 0.7);
}
.party-info { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.party-info strong { color: #e8b34a; letter-spacing: 1px; }
.party-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 1px solid rgba(232, 179, 74, 0.3);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11.5px;
  font-family: 'Kanit', sans-serif;
  background: transparent;
  color: #e8b34a;
  cursor: pointer;
  transition: all 0.2s;
}
.party-btn:hover:not(:disabled) { background: rgba(232, 179, 74, 0.1); }
.party-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.join-form { display: flex; align-items: center; gap: 6px; }
.join-input {
  width: 100px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(232, 179, 74, 0.25);
  border-radius: 999px;
  color: #ede6d6;
  font-family: 'Kanit', sans-serif;
  font-size: 11.5px;
  padding: 6px 12px;
  outline: none;
}
.join-input::placeholder { color: rgba(237, 230, 214, 0.3); }
.join-input:focus { border-color: #e8b34a; }

@media (max-width: 560px) {
  .party-btn span { display: none; }
  .join-input { width: 76px; }
}
</style>
