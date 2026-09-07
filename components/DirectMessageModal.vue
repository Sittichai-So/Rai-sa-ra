// components/DirectMessageModal.vue
<template>
  <b-modal
    v-model="showModal"
    size="lg"
    centered
    hide-header
    modal-class="modern-dm-modal"
    body-class="p-0"
    @hidden="closeModal"
  >
    <div class="dm-modal-header-custom">
      <div class="dm-modal-title">
        <i class="fas fa-comments" />
        <span>แชทกับ {{ friendName }}</span>
      </div>
      <button class="dm-modal-close-btn" @click="closeModal">
        <i class="fas fa-times" />
      </button>
    </div>
    <div class="dm-chat-container">
      <!-- Messages Area -->
      <div ref="messagesContainer" class="dm-messages">
        <div
          v-for="message in messages"
          :key="message._id"
          class="dm-message"
          :class="{ 'own-message': message.senderId === currentUserId }"
        >
          <div class="message-avatar">
            <img v-if="message.senderAvatar" :src="message.senderAvatar" :alt="message.senderName">
            <div v-else class="avatar-placeholder">
              {{ getInitials(message.senderName) }}
            </div>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="sender-name">{{ message.senderName }}</span>
              <span class="message-time">{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-text">
              {{ message.content }}
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="loading-messages">
          <i class="fas fa-spinner fa-spin" /> กำลังโหลดข้อความ...
        </div>

        <!-- Empty state -->
        <div v-if="!loading && messages.length === 0" class="empty-messages">
          <i class="fas fa-comments" />
          <p>เริ่มการสนทนากับ {{ friendName }}</p>
        </div>
      </div>

      <!-- Message Input -->
      <div class="dm-input-area">
        <div class="input-container">
          <input
            v-model="newMessage"
            type="text"
            placeholder="พิมพ์ข้อความ..."
            class="message-input"
            @keyup.enter="sendMessage"
          >
          <button
            class="send-btn"
            :disabled="!newMessage.trim() || sending"
            @click="sendMessage"
          >
            <i v-if="sending" class="fas fa-spinner fa-spin" />
            <i v-else class="fas fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
// TODO: DM ยังทำไม่ครบ — โหลดข้อความเก่า (infinite scroll), แก้ไข/ลบข้อความ,
//   typing indicator, ส่งรูป/ไฟล์ (backend ต้องเพิ่ม endpoint ด้วย)
export default {
  name: 'DirectMessageModal',
  props: {
    friend: {
      type: Object,
      default: null
    },
    currentUserId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showModal: false,
      messages: [],
      newMessage: '',
      loading: false,
      sending: false
    }
  },
  computed: {
    friendName () {
      return this.friend ? this.friend.displayName || this.friend.fullname : ''
    }
  },
  watch: {
    friend (newFriend) {
      if (newFriend && this.showModal) {
        this.loadMessages()
      }
    }
  },
  mounted () {
    if (this.$socket) {
      this.$socket.on('dm:new', this.onIncomingDM)
    }
  },
  beforeDestroy () {
    if (this.$socket) {
      this.$socket.off('dm:new', this.onIncomingDM)
    }
  },
  methods: {
    open () {
      this.showModal = true
      this.messages = []
      this.loadMessages()
    },
    closeModal () {
      this.showModal = false
      this.messages = []
      this.newMessage = ''
    },
    mapMessage (m) {
      const mine = String(m.senderId) === String(this.currentUserId)
      return {
        _id: m._id,
        content: m.content,
        senderId: String(m.senderId),
        senderName: mine ? 'คุณ' : (this.friend?.displayName || this.friend?.fullname || 'เพื่อน'),
        senderAvatar: mine ? null : (this.friend?.avatar || null),
        createdAt: m.createdAt
      }
    },
    async loadMessages () {
      if (!this.friend) { return }

      this.loading = true
      try {
        const url = process.env.API_DM_MESSAGES.replace(':friendId', this.friend.friendId)
        const res = await this.$axios.$get(url, { params: { page: 1, limit: 50 } })
        const list = res.result?.messages || []
        this.messages = list.map(m => this.mapMessage(m))
        this.$emit('read', this.friend.friendId)
      } catch (error) {
        this.$bvToast && this.$bvToast.toast('โหลดข้อความไม่สำเร็จ', { variant: 'danger', solid: true })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    async sendMessage () {
      const text = this.newMessage.trim()
      if (!text || !this.friend || this.sending) { return }

      this.sending = true
      this.newMessage = ''
      try {
        const url = process.env.API_DM_MESSAGES.replace(':friendId', this.friend.friendId)
        const res = await this.$axios.$post(url, { content: text })
        if (res.result) {
          this.messages.push(this.mapMessage(res.result))
          this.$emit('sent', { friendId: this.friend.friendId, content: text })
          this.$nextTick(() => this.scrollToBottom())
        }
      } catch (error) {
        this.newMessage = text
        this.$bvToast && this.$bvToast.toast(
          error.response?.data?.message || 'ส่งข้อความไม่สำเร็จ',
          { variant: 'danger', solid: true }
        )
      } finally {
        this.sending = false
      }
    },
    onIncomingDM (m) {
      if (!this.showModal || !this.friend) { return }
      if (String(m.friendId) !== String(this.friend.friendId)) { return }
      this.messages.push(this.mapMessage({ ...m, senderId: m.senderId }))
      this.$nextTick(() => this.scrollToBottom())
      // เปิดอ่านอยู่ → mark read ทันที (server + local) เพื่อไม่ให้ badge เด้ง
      this.markRead()
      this.$emit('read', this.friend.friendId)
    },
    markRead () {
      if (!this.friend || !process.env.API_DM_READ) { return }
      const url = process.env.API_DM_READ.replace(':friendId', this.friend.friendId)
      this.$axios.$post(url).catch(() => {})
    },
    scrollToBottom () {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
      }
    },
    getInitials (name) {
      if (!name) { return '?' }
      return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
    },
    formatTime (date) {
      const d = new Date(date)
      return d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.dm-chat-container {
  --ink: #101014;
  --paper: #14141c;
  --cream: #f6f3ed;
  --coral: #ff5c4d;
  --violet: #7c6ff5;
  --violet-deep: #5b4fd6;
  --yellow: #ffc94d;
  --white: #ffffff;
  --line-sm: 2px;
  --shadow-xs: 2px 2px 0 var(--ink);
  --shadow-sm: 4px 4px 0 var(--ink);
  --radius-md: 14px;
  --radius-pill: 999px;

  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Modal Styling */
:deep(.modern-dm-modal .modal-content) {
  background: var(--paper);
  border: 3px solid var(--ink);
  border-radius: 20px;
  box-shadow: 8px 8px 0 var(--ink);
  overflow: hidden;
}

.dm-modal-header-custom {
  background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
  border-bottom: 2px solid var(--ink);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dm-modal-title {
  font-family: 'Kanit', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 10px;
}

.dm-modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid var(--ink);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--white);
}

.dm-modal-close-btn:hover {
  background: var(--coral);
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--ink);
}

.dm-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  background: var(--paper);
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px);
  background-size: 20px 20px;
}

.dm-messages::-webkit-scrollbar { width: 6px; }
.dm-messages::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 3px; }

.dm-message {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.dm-message.own-message {
  flex-direction: row-reverse;
}

.dm-message.own-message .message-content {
  margin-left: 0;
  margin-right: 10px;
  align-items: flex-end;
}

.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: var(--line-sm) solid var(--ink);
  box-shadow: var(--shadow-xs);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--violet);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.message-content {
  margin-left: 10px;
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--cream);
}

.message-time {
  font-size: 11px;
  color: rgba(246, 243, 237, 0.5);
  margin-left: 8px;
}

.message-text {
  background: var(--white);
  color: var(--ink);
  padding: 9px 14px;
  border-radius: var(--radius-md);
  border: var(--line-sm) solid var(--ink);
  box-shadow: var(--shadow-xs);
  word-wrap: break-word;
  font-size: 0.92rem;
}

.own-message .message-text {
  background: var(--violet);
  color: var(--white);
}

.loading-messages,
.empty-messages {
  text-align: center;
  padding: 40px 20px;
  color: rgba(246, 243, 237, 0.6);
}

.empty-messages i {
  font-size: 44px;
  margin-bottom: 12px;
  opacity: 0.5;
  color: var(--violet);
}

.dm-input-area {
  border-top: 3px solid var(--ink);
  padding: 14px 16px;
  background: #1b1b25;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 11px 16px;
  background: var(--white);
  border: var(--line-sm) solid var(--ink);
  border-radius: var(--radius-pill);
  outline: none;
  font-size: 14px;
  color: var(--ink);
  box-shadow: var(--shadow-xs);
}

.message-input::placeholder { color: rgba(16, 16, 20, 0.4); }

.message-input:focus {
  border-color: var(--violet);
  box-shadow: 4px 4px 0 var(--violet);
}

.send-btn {
  width: 42px;
  height: 42px;
  border: var(--line-sm) solid var(--ink);
  border-radius: 50%;
  background: var(--coral);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-sm);
}

.send-btn:active:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow: none;
}

.send-btn:disabled {
  background: var(--cream);
  color: rgba(16, 16, 20, 0.4);
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<!-- b-modal chrome is teleported outside this component's DOM, so it
     needs an unscoped block, matching RoomSettings.vue's approach. -->
<style>
.dm-modal .modal-content {
  background: #f6f3ed;
  border: 3px solid #101014;
  border-radius: 20px;
  box-shadow: 6px 6px 0 #101014;
  overflow: hidden;
}

.dm-modal .dm-modal-header {
  background: #7c6ff5;
  border-bottom: 3px solid #101014;
  padding: 16px 20px;
}

.dm-modal .dm-modal-header .modal-title {
  font-family: 'Space Grotesk', 'Noto Sans Thai', sans-serif;
  font-weight: 800;
  color: #ffffff;
  font-size: 1rem;
}

.dm-modal .dm-modal-header .close {
  color: #ffffff;
  opacity: 0.9;
  text-shadow: none;
}

.dm-modal .dm-modal-body {
  padding: 0;
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.dm-modal .modal-backdrop {
  background: rgba(16, 16, 20, 0.6);
}
</style>
